import type {
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

import { getViewerContext, getDemoSettings } from "@/lib/auth";
import { getDemoState } from "@/lib/demo-state";
import { isSupabaseConfigured } from "@/lib/env";
import { parsePlanImport, SAMPLE_IMPORT_CSV } from "@/lib/admin-import";
import {
  buildDemoProgressMap,
  calculateCurrentDay,
  calculateCurrentStreak,
  calculateWeekNumber,
  deriveMissionStatus,
  usesDirectCompleteFlow
} from "@/lib/plan";
import {
  demoMissions,
  demoPlan,
  demoProfile
} from "@/lib/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { asArray, splitParagraphs, toDateOnly } from "@/lib/utils";

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
  const currentDay = calculateCurrentDay(
    args.startDate,
    args.totalDays,
    args.profile.timezone || args.reminderSettings.timezone
  );
  const visibilityDay = args.profile.fullAccess ? args.totalDays : currentDay;
  const currentWeek = calculateWeekNumber(currentDay);
  const completedCount = Object.values(args.progressByTaskId).filter(
    (progress) => progress.status === "completed"
  ).length;
  const inProgressCount = Object.values(args.progressByTaskId).filter(
    (progress) =>
      progress.status === "attempted" ||
      progress.status === "solution_unlocked"
  ).length;
  const weeklyCompletedCount = args.missions.filter((mission) => {
    const progress = args.progressByTaskId[mission.id];
    return (
      mission.weekNumber === currentWeek && progress?.status === "completed"
    );
  }).length;

  const pendingCount = args.missions.filter((mission) => {
    if (mission.dayNumber > currentDay) {
      return false;
    }

    return args.progressByTaskId[mission.id]?.status !== "completed";
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
        args.progressByTaskId[mission.id]?.status === "completed"
    ).length
  }));

  const visibleMissionStates = args.missions
    .filter(
      (mission) =>
        mission.dayNumber <= visibilityDay ||
        Boolean(args.progressByTaskId[mission.id])
    )
    .map((mission) => {
      const progress = args.progressByTaskId[mission.id] || null;

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
      args.progressByTaskId,
      currentDay
    ),
    completedCount,
    inProgressCount,
    weeklyCompletedCount,
    pendingCount,
    todayMission,
    missions: args.missions,
    progressByTaskId: args.progressByTaskId,
    categoryBreakdown,
    visibleMissionStates
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

  const startDate =
    planRow?.start_date || toDateOnly(new Date(), viewer.profile.timezone);

  const { data: planTemplate } = await supabase
    .from("plan_templates")
    .select("id, name, duration_days")
    .eq("id", planRow?.plan_template_id || "")
    .maybeSingle();

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
    const demoState = await getDemoState({
      blankProgress: true,
      ownerUserId: viewer.userId
    });

    return buildDashboardSnapshot({
      mode: "supabase",
      profile: viewer.profile,
      reminderSettings: {
        emailEnabled: false,
        weeklyReminderEnabled: false,
        weeklyReminderDay: 0,
        weeklyReminderHour: 19,
        timezone: viewer.profile.timezone
      },
      planName: planTemplate?.name || "Placement Sprint",
      totalDays: planTemplate?.duration_days || 90,
      startDate,
      missions: demoMissions,
      progressByTaskId: buildDemoProgressMap(demoMissions, demoState)
    });
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

  if (snapshot.mode === "demo" || !progress?.progressId) {
    const demoState = await getDemoState(
      snapshot.mode === "supabase"
        ? {
            blankProgress: true,
            ownerUserId: snapshot.profile.userId
          }
        : undefined
    );
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
  } else if (isSupabaseConfigured()) {
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

  const supabase = await createSupabaseServerClient();
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
