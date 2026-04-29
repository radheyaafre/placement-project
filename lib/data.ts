import type {
  AdminDashboardSnapshot,
  AdminContentSnapshot,
  DashboardSnapshot,
  Mission,
  MissionDetail,
  MissionQuestionResponse,
  MissionProgress,
  ProgressSnapshot,
  ReminderSettings,
  SettingsSnapshot,
  StudentProfile,
  TaskType
} from "@/types/domain";

import { getViewerContext, getDemoSettings, isAllowedAdminEmail } from "@/lib/auth";
import { getDemoState } from "@/lib/demo-state";
import { isSupabaseConfigured } from "@/lib/env";
import { parsePlanImport, SAMPLE_IMPORT_CSV } from "@/lib/admin-import";
import {
  buildDemoProgressMap,
  calculateCurrentDay,
  calculateCurrentStreak,
  calculateWeekNumber,
  deriveMissionStatus,
  getEffectiveProgress,
  usesDirectCompleteFlow
} from "@/lib/plan";
import {
  demoMissions,
  demoPlan,
  demoProfile
} from "@/lib/sample-data";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { asArray, percent, splitParagraphs, toDateOnly } from "@/lib/utils";

function mapSupabaseMission(dayRow: any): Mission | null {
  const taskRow = asArray(dayRow.tasks)[0];

  if (!taskRow) {
    return null;
  }

  const questionRows = asArray(taskRow.task_questions).sort(
    (left: any, right: any) => (left.position || 0) - (right.position || 0)
  );

  return {
    id: taskRow.id,
    planDayId: dayRow.id,
    dayNumber: dayRow.day_number,
    weekNumber: dayRow.week_number || calculateWeekNumber(dayRow.day_number),
    taskType: taskRow.task_type,
    title: taskRow.title || dayRow.title,
    topic: taskRow.topic || dayRow.theme || "Placement Prep",
    estimatedMinutes: taskRow.estimated_minutes || dayRow.estimated_minutes || 60,
    motivationCopy:
      dayRow.motivation_copy || "Show up for one hour and keep the streak alive.",
    instructions: splitParagraphs(taskRow.instructions_md),
    solution: splitParagraphs(taskRow.solution_md),
    difficulty: taskRow.difficulty || "medium",
    questions: questionRows.map((question: any) => ({
      id: question.id,
      prompt: question.prompt_md || "",
      questionType: question.question_type || "long_text",
      explanation: question.explanation_md || undefined,
      sampleAnswer: question.sample_answer_md || undefined,
      placeholder:
        question.question_type === "mcq"
          ? undefined
          : "Write your answer here...",
      sourcePlatform: question.source_platform || undefined,
      sourceUrl: question.source_url || undefined,
      options: asArray(question.question_options)
        .sort((left: any, right: any) => (left.position || 0) - (right.position || 0))
        .map((option: any, index: number) => ({
          id: option.id,
          label: String.fromCharCode(65 + index),
          text: option.option_text,
          isCorrect: Boolean(option.is_correct)
        }))
    }))
  };
}

function buildDashboardSnapshot(args: {
  mode: "demo" | "supabase";
  profile: StudentProfile;
  reminderSettings: ReminderSettings;
  planName: string;
  totalDays: number;
  startDate: string;
  missions: Mission[];
  progressByTaskId: Record<string, MissionProgress>;
}): DashboardSnapshot {
  const effectiveProgressByTaskId = args.missions.reduce<
    Record<string, MissionProgress>
  >((acc, mission) => {
    const progress = getEffectiveProgress(
      mission,
      args.progressByTaskId[mission.id] || null
    );

    if (progress) {
      acc[mission.id] = progress;
    }

    return acc;
  }, {});

  const currentDay = calculateCurrentDay(
    args.startDate,
    args.totalDays,
    args.profile.timezone || args.reminderSettings.timezone
  );
  const visibilityDay = args.profile.fullAccess ? args.totalDays : currentDay;
  const currentWeek = calculateWeekNumber(currentDay);
  const completedCount = Object.values(effectiveProgressByTaskId).filter(
    (progress) => progress.status === "completed"
  ).length;
  const inProgressCount = Object.values(effectiveProgressByTaskId).filter(
    (progress) =>
      progress.status === "attempted" ||
      progress.status === "solution_unlocked"
  ).length;
  const weeklyCompletedCount = args.missions.filter((mission) => {
    const progress = effectiveProgressByTaskId[mission.id];
    return (
      mission.weekNumber === currentWeek && progress?.status === "completed"
    );
  }).length;

  const pendingCount = args.missions.filter((mission) => {
    if (mission.dayNumber > currentDay) {
      return false;
    }

    return effectiveProgressByTaskId[mission.id]?.status !== "completed";
  }).length;

  const todayMission =
    args.missions.find((mission) => mission.dayNumber === currentDay) ||
    args.missions[args.missions.length - 1];

  const categoryBreakdown = ([
    "aptitude",
    "dsa",
    "sql",
    "hr",
    "revision"
  ] as TaskType[]).map((taskType) => ({
    taskType,
    planned: args.missions.filter((mission) => mission.taskType === taskType).length,
    completed: args.missions.filter(
      (mission) =>
        mission.taskType === taskType &&
        effectiveProgressByTaskId[mission.id]?.status === "completed"
    ).length
  }));

  const visibleMissionStates = args.missions
    .filter(
      (mission) =>
        mission.dayNumber <= visibilityDay ||
        Boolean(effectiveProgressByTaskId[mission.id])
    )
    .map((mission) => {
      const progress = effectiveProgressByTaskId[mission.id] || null;

      return {
        mission,
        status: deriveMissionStatus(
          mission,
          currentDay,
          progress,
          args.profile.fullAccess
        ),
        score: progress?.score ?? null
      };
    })
    .sort((left, right) => left.mission.dayNumber - right.mission.dayNumber);

  return {
    mode: args.mode,
    profile: args.profile,
    hasFullAccess: args.profile.fullAccess,
    reminderSettings: args.reminderSettings,
    planName: args.planName,
    totalDays: args.totalDays,
    startDate: args.startDate,
    currentDay,
    currentWeek,
    currentStreak: calculateCurrentStreak(
      args.missions,
      effectiveProgressByTaskId,
      currentDay
    ),
    completedCount,
    inProgressCount,
    weeklyCompletedCount,
    pendingCount,
    todayMission,
    missions: args.missions,
    progressByTaskId: effectiveProgressByTaskId,
    categoryBreakdown,
    visibleMissionStates
  };
}

async function listAllAuthUsers(adminClient: ReturnType<typeof createSupabaseAdminClient>) {
  const users: Array<{
    id: string;
    email: string;
    createdAt: string | null;
    lastSignInAt: string | null;
  }> = [];

  let page = 1;

  while (true) {
    const { data, error } = await adminClient.auth.admin.listUsers({
      page,
      perPage: 1000
    });

    if (error) {
      throw error;
    }

    const batch = data?.users || [];

    users.push(
      ...batch.map((user) => ({
        id: user.id,
        email: user.email || "",
        createdAt: user.created_at || null,
        lastSignInAt: user.last_sign_in_at || null
      }))
    );

    if (batch.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

function getTaskRelation(row: any) {
  return asArray(row?.tasks)[0] || null;
}

function getPlanDayRelation(row: any) {
  return asArray(row?.plan_days)[0] || null;
}

function getPlanTemplateRelation(row: any) {
  return asArray(row?.plan_templates)[0] || null;
}

function getLatestProgressActivity(row: any) {
  return (
    row.completed_at ||
    row.solution_unlocked_at ||
    row.first_attempt_at ||
    row.updated_at ||
    null
  );
}

export async function getAdminDashboardSnapshot(): Promise<AdminDashboardSnapshot> {
  const viewer = await getViewerContext();

  if (!isSupabaseConfigured()) {
    return {
      mode: "demo",
      isAdmin: true,
      activePlanName: demoPlan.name,
      activePlanDurationDays: demoPlan.totalDays,
      totalStudents: 1,
      onboardedStudents: 1,
      notStartedStudents: 0,
      activeTodayCount: 0,
      completedTodayCount: 0,
      averageCompletionPercent: 0,
      needsAttentionCount: 0,
      recentActivity: [],
      taskCompletionMix: ([
        "aptitude",
        "dsa",
        "sql",
        "hr",
        "revision"
      ] as TaskType[]).map((taskType) => ({
        taskType,
        completed: 0
      })),
      userOverview: [
        {
          userId: demoProfile.userId,
          fullName: demoProfile.fullName,
          email: "demo@samyaklabs.ai",
          collegeName: demoProfile.collegeName,
          targetRole: demoProfile.targetRole,
          timezone: demoProfile.timezone,
          hasActivePlan: true,
          startDate: toDateOnly(new Date(), demoProfile.timezone),
          currentDay: 1,
          totalDays: demoPlan.totalDays,
          completedCount: 0,
          inProgressCount: 0,
          completionPercent: 0,
          lastActivityAt: null,
          lastSignInAt: null,
          needsAttention: false
        }
      ]
    };
  }

  if (!viewer.isAdmin) {
    return {
      mode: "supabase",
      isAdmin: false,
      activePlanName: "Restricted",
      activePlanDurationDays: 90,
      totalStudents: 0,
      onboardedStudents: 0,
      notStartedStudents: 0,
      activeTodayCount: 0,
      completedTodayCount: 0,
      averageCompletionPercent: 0,
      needsAttentionCount: 0,
      recentActivity: [],
      taskCompletionMix: ([
        "aptitude",
        "dsa",
        "sql",
        "hr",
        "revision"
      ] as TaskType[]).map((taskType) => ({
        taskType,
        completed: 0
      })),
      userOverview: []
    };
  }

  const adminClient = createSupabaseAdminClient();
  const [authUsers, activePlanResult, profilesResult, activePlansResult, progressResult] =
    await Promise.all([
      listAllAuthUsers(adminClient),
      adminClient
        .from("plan_templates")
        .select("name, duration_days")
        .eq("is_active", true)
        .maybeSingle(),
      adminClient
        .from("profiles")
        .select("user_id, full_name, college_name, target_role, timezone, role"),
      adminClient
        .from("student_plans")
        .select(
          "user_id, start_date, status, target_minutes_per_day, created_at, plan_templates(name, duration_days)"
        )
        .eq("status", "active"),
      adminClient
        .from("user_task_progress")
        .select(
          "id, user_id, status, completed_at, first_attempt_at, solution_unlocked_at, updated_at, tasks(title, task_type), plan_days(day_number)"
        )
    ]);

  if (
    activePlanResult.error ||
    profilesResult.error ||
    activePlansResult.error ||
    progressResult.error
  ) {
    throw new Error(
      activePlanResult.error?.message ||
        profilesResult.error?.message ||
        activePlansResult.error?.message ||
        progressResult.error?.message ||
        "Unable to load admin dashboard data."
    );
  }

  const todayKey = toDateOnly(new Date(), "Asia/Kolkata");
  const adminUserIds = new Set<string>();
  const profileByUserId = new Map(
    (profilesResult.data || []).map((row: any) => [row.user_id, row])
  );

  for (const authUser of authUsers) {
    if (isAllowedAdminEmail(authUser.email)) {
      adminUserIds.add(authUser.id);
    }
  }

  for (const profileRow of profilesResult.data || []) {
    if (profileRow.role === "admin") {
      adminUserIds.add(profileRow.user_id);
    }
  }

  const planByUserId = new Map(
    (activePlansResult.data || []).map((row: any) => {
      const planTemplate = getPlanTemplateRelation(row);

      return [
        row.user_id,
        {
          startDate: row.start_date as string,
          durationDays: planTemplate?.duration_days || activePlanResult.data?.duration_days || 90
        }
      ];
    })
  );

  const progressByUserId = new Map<
    string,
    {
      completedCount: number;
      inProgressCount: number;
      lastActivityAt: string | null;
    }
  >();
  const activeTodayUsers = new Set<string>();
  let completedTodayCount = 0;
  const taskCompletionCounts = new Map<TaskType, number>();
  const recentActivityRaw: Array<{
    id: string;
    userId: string;
    occurredAt: string;
    status: "completed" | "started";
    taskTitle: string;
    taskType: TaskType | null;
    dayNumber: number | null;
  }> = [];

  for (const row of progressResult.data || []) {
    if (adminUserIds.has(row.user_id)) {
      continue;
    }

    const summary = progressByUserId.get(row.user_id) || {
      completedCount: 0,
      inProgressCount: 0,
      lastActivityAt: null
    };

    if (row.status === "completed") {
      summary.completedCount += 1;
    } else if (row.status === "attempted" || row.status === "solution_unlocked") {
      summary.inProgressCount += 1;
    }

    const activityAt = getLatestProgressActivity(row);

    if (activityAt) {
      if (!summary.lastActivityAt || activityAt > summary.lastActivityAt) {
        summary.lastActivityAt = activityAt;
      }

      if (toDateOnly(new Date(activityAt), "Asia/Kolkata") === todayKey) {
        activeTodayUsers.add(row.user_id);
      }
    }

    if (
      row.completed_at &&
      toDateOnly(new Date(row.completed_at), "Asia/Kolkata") === todayKey
    ) {
      completedTodayCount += 1;
    }

    progressByUserId.set(row.user_id, summary);

    const taskRow = getTaskRelation(row);
    const dayRow = getPlanDayRelation(row);

    if (row.status === "completed" && taskRow?.task_type) {
      const taskType = taskRow.task_type as TaskType;
      taskCompletionCounts.set(
        taskType,
        (taskCompletionCounts.get(taskType) || 0) + 1
      );
    }

    if (activityAt) {
      recentActivityRaw.push({
        id: row.id,
        userId: row.user_id,
        occurredAt: activityAt,
        status: row.completed_at ? "completed" : "started",
        taskTitle: taskRow?.title || "Mission activity",
        taskType: (taskRow?.task_type as TaskType | undefined) || null,
        dayNumber: dayRow?.day_number || null
      });
    }
  }

  const studentUsers = authUsers.filter((authUser) => !adminUserIds.has(authUser.id));
  const userOverview = studentUsers
    .map((authUser) => {
      const profileRow = profileByUserId.get(authUser.id);
      const planRow = planByUserId.get(authUser.id);
      const progressRow = progressByUserId.get(authUser.id);
      const currentDay = planRow
        ? calculateCurrentDay(
            planRow.startDate,
            planRow.durationDays,
            profileRow?.timezone || "Asia/Kolkata"
          )
        : null;
      const availableDays = currentDay && planRow ? Math.min(currentDay, planRow.durationDays) : 0;
      const completionPercent = availableDays
        ? percent(progressRow?.completedCount || 0, availableDays)
        : 0;
      const lastActivityAt = progressRow?.lastActivityAt || null;
      const attentionThreshold = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const needsAttention = planRow
        ? Boolean(
            (currentDay || 0) > 2 &&
              (!lastActivityAt || new Date(lastActivityAt).getTime() < attentionThreshold)
          )
        : false;

      return {
        userId: authUser.id,
        fullName:
          profileRow?.full_name || authUser.email.split("@")[0] || "Student",
        email: authUser.email,
        collegeName: profileRow?.college_name || "",
        targetRole: profileRow?.target_role || "Software Engineer",
        timezone: profileRow?.timezone || "Asia/Kolkata",
        hasActivePlan: Boolean(planRow),
        startDate: planRow?.startDate || null,
        currentDay,
        totalDays: planRow?.durationDays || null,
        completedCount: progressRow?.completedCount || 0,
        inProgressCount: progressRow?.inProgressCount || 0,
        completionPercent,
        lastActivityAt,
        lastSignInAt: authUser.lastSignInAt,
        needsAttention
      };
    })
    .sort((left, right) => {
      if (left.needsAttention !== right.needsAttention) {
        return left.needsAttention ? -1 : 1;
      }

      const leftStamp = left.lastActivityAt || left.lastSignInAt || "";
      const rightStamp = right.lastActivityAt || right.lastSignInAt || "";

      return rightStamp.localeCompare(leftStamp);
    });

  const recentActivity = recentActivityRaw
    .sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
    .slice(0, 12)
    .map((activity) => {
      const user = userOverview.find((row) => row.userId === activity.userId);

      return {
        id: activity.id,
        userId: activity.userId,
        fullName: user?.fullName || "Student",
        email: user?.email || "",
        status: activity.status,
        taskTitle: activity.taskTitle,
        taskType: activity.taskType,
        dayNumber: activity.dayNumber,
        occurredAt: activity.occurredAt
      };
    });

  const onboardedUsers = userOverview.filter((user) => user.hasActivePlan);
  const averageCompletionPercent = onboardedUsers.length
    ? Math.round(
        onboardedUsers.reduce((sum, user) => sum + user.completionPercent, 0) /
          onboardedUsers.length
      )
    : 0;

  return {
    mode: "supabase",
    isAdmin: true,
    activePlanName: activePlanResult.data?.name || "No active plan yet",
    activePlanDurationDays: activePlanResult.data?.duration_days || 90,
    totalStudents: userOverview.length,
    onboardedStudents: onboardedUsers.length,
    notStartedStudents: userOverview.filter((user) => !user.hasActivePlan).length,
    activeTodayCount: activeTodayUsers.size,
    completedTodayCount,
    averageCompletionPercent,
    needsAttentionCount: userOverview.filter((user) => user.needsAttention).length,
    recentActivity,
    taskCompletionMix: ([
      "aptitude",
      "dsa",
      "sql",
      "hr",
      "revision"
    ] as TaskType[]).map((taskType) => ({
      taskType,
      completed: taskCompletionCounts.get(taskType) || 0
    })),
    userOverview
  };
}

export async function getDashboardSnapshot() {
  if (!isSupabaseConfigured()) {
    const state = await getDemoState();
    const profile: StudentProfile = {
      ...demoProfile,
      ...state.profile,
      userId: demoProfile.userId,
      fullName: state.profile.fullName || demoProfile.fullName,
      collegeName: state.profile.collegeName || demoProfile.collegeName,
      targetRole: state.profile.targetRole || demoProfile.targetRole,
      timezone: state.profile.timezone || demoProfile.timezone,
      role: state.profile.role || demoProfile.role,
      fullAccess: state.profile.fullAccess ?? demoProfile.fullAccess
    };

    return buildDashboardSnapshot({
      mode: "demo",
      profile,
      reminderSettings: await getDemoSettings(),
      planName: demoPlan.name,
      totalDays: demoPlan.totalDays,
      startDate: state.startDate,
      missions: demoMissions,
      progressByTaskId: buildDemoProgressMap(demoMissions, state)
    });
  }

  const viewer = await getViewerContext();

  if (!viewer.userId || !viewer.profile) {
    return null;
  }

  const supabase = await createSupabaseServerClient();

  const { data: planRow } = await supabase
    .from("student_plans")
    .select("plan_template_id, start_date, target_minutes_per_day")
    .eq("user_id", viewer.userId)
    .eq("status", "active")
    .maybeSingle();

  if (!planRow?.plan_template_id) {
    return null;
  }

  const startDate =
    planRow?.start_date || toDateOnly(new Date(), viewer.profile.timezone);

  const { data: planTemplate } = await supabase
    .from("plan_templates")
    .select("id, name, duration_days")
    .eq("id", planRow?.plan_template_id || "")
    .maybeSingle();

  if (!planTemplate?.id) {
    return null;
  }

  const { data: dayRows } = await supabase
    .from("plan_days")
    .select(
      `
      id,
      day_number,
      week_number,
      theme,
      title,
      motivation_copy,
      estimated_minutes,
      tasks (
        id,
        task_type,
        title,
        topic,
        instructions_md,
        solution_md,
        estimated_minutes,
        difficulty,
        task_questions (
          id,
          position,
          prompt_md,
          question_type,
          explanation_md,
          sample_answer_md,
          source_platform,
          source_url,
          question_options (
            id,
            position,
            option_text,
            is_correct
          )
        )
      )
    `
    )
    .eq("plan_template_id", planTemplate?.id || "")
    .eq("is_published", true)
    .order("day_number", { ascending: true });

  const missions = (dayRows || [])
    .map((dayRow: any) => mapSupabaseMission(dayRow))
    .filter(Boolean) as Mission[];

  const currentMissionIds = new Set(missions.map((mission) => mission.id));

  const { data: progressRows } = await supabase
    .from("user_task_progress")
    .select("id, task_id, status, attempt_count, score, completed_at, solution_unlocked_at")
    .eq("user_id", viewer.userId);

  const progressByTaskId = (progressRows || []).reduce<
    Record<string, MissionProgress>
  >((acc, row: any) => {
    if (missions.length && !currentMissionIds.has(row.task_id)) {
      return acc;
    }

    acc[row.task_id] = {
      progressId: row.id,
      taskId: row.task_id,
      status: row.status,
      attemptCount: row.attempt_count || 0,
      score: row.score ?? null,
      completedAt: row.completed_at ?? null,
      solutionUnlockedAt: row.solution_unlocked_at ?? null
    };

    return acc;
  }, {});

  if (!missions.length) {
    return null;
  }

  const { data: reminderRow } = await supabase
    .from("reminder_preferences")
    .select(
      "email_enabled, weekly_reminder_enabled, weekly_reminder_day, weekly_reminder_hour, timezone"
    )
    .eq("user_id", viewer.userId)
    .maybeSingle();

  return buildDashboardSnapshot({
    mode: "supabase",
    profile: viewer.profile,
    reminderSettings: {
      emailEnabled: false,
      weeklyReminderEnabled: false,
      weeklyReminderDay: reminderRow?.weekly_reminder_day ?? 0,
      weeklyReminderHour: reminderRow?.weekly_reminder_hour ?? 19,
      timezone: reminderRow?.timezone || viewer.profile.timezone
    },
    planName: planTemplate?.name || "Placement Sprint",
    totalDays: planTemplate?.duration_days || 90,
    startDate,
    missions,
    progressByTaskId
  });
}

export async function getMissionDetail(taskId: string): Promise<MissionDetail | null> {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot) {
    return null;
  }

  const mission = snapshot.missions.find((item) => item.id === taskId);

  if (!mission) {
    return null;
  }

  const progress = snapshot.progressByTaskId[taskId] || null;
  const status = deriveMissionStatus(
    mission,
    snapshot.currentDay,
    progress,
    snapshot.hasFullAccess
  );
  const usesDirectFlow = usesDirectCompleteFlow(mission.taskType);
  let responsesByQuestionId: Record<string, MissionQuestionResponse> = {};

  if (snapshot.mode === "demo") {
    const demoState = await getDemoState();
    const savedResponses = demoState.responsesByTaskId?.[taskId] || {};

    responsesByQuestionId = mission.questions.reduce<
      Record<string, MissionQuestionResponse>
    >((acc, question) => {
      const savedValue = savedResponses[question.id];

      if (!savedValue) {
        return acc;
      }

      acc[question.id] = {
        answerText: question.questionType === "mcq" ? null : savedValue,
        selectedOptionId:
          question.questionType === "mcq" ? savedValue : null
      };

      return acc;
    }, {});
  } else if (progress?.progressId && isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const { data: attemptRows } = await supabase
      .from("question_attempts")
      .select("task_question_id, selected_option_id, answer_text")
      .eq("user_task_progress_id", progress.progressId);

    responsesByQuestionId = (attemptRows || []).reduce<
      Record<string, MissionQuestionResponse>
    >((acc, row: any) => {
      acc[row.task_question_id] = {
        answerText: row.answer_text ?? null,
        selectedOptionId: row.selected_option_id ?? null
      };

      return acc;
    }, {});
  }

  return {
    snapshot,
    mission,
    status,
    progress,
    responsesByQuestionId,
    canRevealSolution: usesDirectFlow
      ? false
      : status === "solution_unlocked" || status === "completed",
    canMarkComplete: usesDirectFlow
      ? status !== "locked"
      : status === "solution_unlocked" || status === "completed"
  };
}

export async function getProgressSnapshot(): Promise<ProgressSnapshot | null> {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot) {
    return null;
  }

  const missions = snapshot.missions ?? [];
  const maxWeek = Math.max(1, ...missions.map((mission) => mission.weekNumber));
  const weeklySummary = Array.from({ length: maxWeek }, (_, index) => {
    const weekNumber = index + 1;
    const weekMissions = missions.filter(
      (mission) => mission.weekNumber === weekNumber
    );
    const completed = weekMissions.filter(
      (mission) =>
        snapshot.progressByTaskId[mission.id]?.status === "completed"
    ).length;

    return {
      weekNumber,
      completed,
      planned: weekMissions.length,
      focus:
        weekMissions
          .map((mission) => mission.taskType)
          .filter((value, index, all) => all.indexOf(value) === index)
          .join(", ") || "Mixed"
    };
  });

  return {
    snapshot,
    weeklySummary
  };
}

export async function getSettingsSnapshot(): Promise<SettingsSnapshot | null> {
  const viewer = await getViewerContext();

  if (viewer.mode === "demo" && viewer.profile) {
    return {
      mode: "demo",
      profile: viewer.profile,
      reminderSettings: await getDemoSettings()
    };
  }

  if (!viewer.userId || !viewer.profile) {
    return null;
  }

  const supabase = await createSupabaseServerClient();
  const { data: reminderRow } = await supabase
    .from("reminder_preferences")
    .select(
      "email_enabled, weekly_reminder_enabled, weekly_reminder_day, weekly_reminder_hour, timezone"
    )
    .eq("user_id", viewer.userId)
    .maybeSingle();

  return {
    mode: "supabase",
    profile: viewer.profile,
    reminderSettings: {
      emailEnabled: false,
      weeklyReminderEnabled: false,
      weeklyReminderDay: reminderRow?.weekly_reminder_day ?? 0,
      weeklyReminderHour: reminderRow?.weekly_reminder_hour ?? 19,
      timezone: reminderRow?.timezone || viewer.profile.timezone
    }
  };
}

export async function getAdminContentSnapshot(): Promise<AdminContentSnapshot> {
  const viewer = await getViewerContext();

  if (!isSupabaseConfigured()) {
    return {
      mode: "demo",
      isAdmin: true,
      activePlanName: demoPlan.name,
      durationDays: demoPlan.totalDays,
      publishedDays: demoMissions.length,
      sampleCsv: SAMPLE_IMPORT_CSV
    };
  }

  if (!viewer.isAdmin) {
    return {
      mode: "supabase",
      isAdmin: false,
      activePlanName: "Restricted",
      durationDays: 90,
      publishedDays: 0,
      sampleCsv: SAMPLE_IMPORT_CSV
    };
  }

  const supabase = createSupabaseAdminClient();
  const { data: activePlan } = await supabase
    .from("plan_templates")
    .select("id, name, duration_days")
    .eq("is_active", true)
    .maybeSingle();

  const { count } = await supabase
    .from("plan_days")
    .select("id", { count: "exact", head: true })
    .eq("plan_template_id", activePlan?.id || "");

  return {
    mode: "supabase",
    isAdmin: viewer.isAdmin,
    activePlanName: activePlan?.name || "No active plan yet",
    durationDays: activePlan?.duration_days || 90,
    publishedDays: count || 0,
    sampleCsv: SAMPLE_IMPORT_CSV
  };
}

export function previewImport(csv: string) {
  return parsePlanImport(csv);
}
