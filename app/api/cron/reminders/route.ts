import { NextResponse } from "next/server";

import { getResendFromEmail, isResendConfigured, isSupabaseConfigured } from "@/lib/env";
import { calculateCurrentDay } from "@/lib/plan";
import {
  buildWeeklyReminderEmail,
  type WeeklyReminderCategorySummary,
  type WeeklyReminderPendingMission
} from "@/lib/reminders";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { asArray, DEFAULT_TIMEZONE } from "@/lib/utils";
import type { TaskType } from "@/types/domain";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ActivePlanRow = {
  user_id: string;
  start_date: string;
  plan_template_id: string;
};

type PlanTemplateRow = {
  id: string;
  name: string;
  duration_days: number;
};

type ProfileRow = {
  user_id: string;
  full_name: string;
  timezone: string;
};

type ReminderPreferenceRow = {
  user_id: string;
  email_enabled: boolean;
  weekly_reminder_enabled: boolean;
  timezone: string;
  last_sent_at: string | null;
};

type ReleasedMission = {
  id: string;
  dayNumber: number;
  title: string;
  taskType: TaskType;
};

function getReminderWindow(dayNumber: number) {
  return Math.floor(dayNumber / 7);
}

function shouldSendReminder(params: {
  currentDay: number;
  startDate: string;
  totalDays: number;
  timeZone: string;
  lastSentAt: string | null;
}) {
  const currentWindow = getReminderWindow(params.currentDay);

  if (currentWindow < 1) {
    return false;
  }

  if (!params.lastSentAt) {
    return true;
  }

  const lastSentDay = calculateCurrentDay(
    params.startDate,
    params.totalDays,
    params.timeZone,
    new Date(params.lastSentAt)
  );

  return currentWindow > getReminderWindow(lastSentDay);
}

function isReminderEnabled(reminderRow?: ReminderPreferenceRow | null) {
  return (
    (reminderRow?.email_enabled ?? true) &&
    (reminderRow?.weekly_reminder_enabled ?? true)
  );
}

async function listAllAuthUsers(
  adminClient: ReturnType<typeof createSupabaseAdminClient>
) {
  const users: Array<{
    id: string;
    email: string;
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
        email: user.email || ""
      }))
    );

    if (batch.length < 1000) {
      break;
    }

    page += 1;
  }

  return users;
}

async function sendReminderEmail(params: {
  to: string;
  subject: string;
  html: string;
  text: string;
}) {
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      from: getResendFromEmail(),
      to: params.to,
      subject: params.subject,
      html: params.html,
      text: params.text
    })
  });

  if (response.ok) {
    return;
  }

  const payload = await response.json().catch(() => null);
  const message =
    typeof payload?.message === "string"
      ? payload.message
      : "Unable to send reminder email.";

  throw new Error(message);
}

function formatFailure(error: unknown) {
  return error instanceof Error ? error.message : "Unknown error";
}

export async function GET(request: Request) {
  const providedSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    "";

  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Invalid cron secret." },
      { status: 401 }
    );
  }

  if (
    !isSupabaseConfigured() ||
    !isResendConfigured() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      skipped:
        "Set Supabase and Resend env vars to enable the weekly reminder sender."
    });
  }

  const admin = createSupabaseAdminClient();
  const { data: activePlans, error: activePlansError } = await admin
    .from("student_plans")
    .select("user_id, start_date, plan_template_id")
    .eq("status", "active");

  if (activePlansError) {
    return NextResponse.json(
      {
        ok: false,
        error: activePlansError.message
      },
      { status: 500 }
    );
  }

  const plans = (activePlans || []) as ActivePlanRow[];

  if (!plans.length) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      skipped: 0,
      failed: 0,
      message: "No active student plans found."
    });
  }

  const userIds = Array.from(new Set(plans.map((plan) => plan.user_id)));
  const templateIds = Array.from(
    new Set(plans.map((plan) => plan.plan_template_id))
  );

  const [
    profileResult,
    reminderResult,
    templateResult,
    dayResult,
    progressResult,
    authUsers
  ] = await Promise.all([
    admin
      .from("profiles")
      .select("user_id, full_name, timezone")
      .in("user_id", userIds),
    admin
      .from("reminder_preferences")
      .select(
        "user_id, email_enabled, weekly_reminder_enabled, timezone, last_sent_at"
      )
      .in("user_id", userIds),
    admin
      .from("plan_templates")
      .select("id, name, duration_days")
      .in("id", templateIds),
    admin
      .from("plan_days")
      .select(
        `
          id,
          plan_template_id,
          day_number,
          title,
          theme,
          tasks (
            id,
            task_type,
            title
          )
        `
      )
      .in("plan_template_id", templateIds)
      .eq("is_published", true)
      .order("day_number", { ascending: true }),
    admin
      .from("user_task_progress")
      .select("user_id, task_id")
      .in("user_id", userIds)
      .eq("status", "completed"),
    listAllAuthUsers(admin)
  ]);

  if (profileResult.error) {
    return NextResponse.json(
      { ok: false, error: profileResult.error.message },
      { status: 500 }
    );
  }

  if (reminderResult.error) {
    return NextResponse.json(
      { ok: false, error: reminderResult.error.message },
      { status: 500 }
    );
  }

  if (templateResult.error) {
    return NextResponse.json(
      { ok: false, error: templateResult.error.message },
      { status: 500 }
    );
  }

  if (dayResult.error) {
    return NextResponse.json(
      { ok: false, error: dayResult.error.message },
      { status: 500 }
    );
  }

  if (progressResult.error) {
    return NextResponse.json(
      { ok: false, error: progressResult.error.message },
      { status: 500 }
    );
  }

  const profileByUserId = new Map(
    ((profileResult.data || []) as ProfileRow[]).map((row) => [row.user_id, row])
  );
  const reminderByUserId = new Map(
    ((reminderResult.data || []) as ReminderPreferenceRow[]).map((row) => [
      row.user_id,
      row
    ])
  );
  const templateById = new Map(
    ((templateResult.data || []) as PlanTemplateRow[]).map((row) => [row.id, row])
  );
  const emailByUserId = new Map(authUsers.map((user) => [user.id, user.email]));
  const completedTaskIdsByUser = ((progressResult.data || []) as Array<{
    user_id: string;
    task_id: string;
  }>).reduce<Map<string, Set<string>>>((acc, row) => {
    const current = acc.get(row.user_id) || new Set<string>();
    current.add(row.task_id);
    acc.set(row.user_id, current);
    return acc;
  }, new Map());
  const missionsByTemplate = ((dayResult.data || []) as Array<{
    plan_template_id: string;
    day_number: number;
    title: string;
    theme: TaskType;
    tasks:
      | Array<{
          id: string;
          task_type: TaskType;
          title: string;
        }>
      | {
          id: string;
          task_type: TaskType;
          title: string;
        }
      | null;
  }>).reduce<Map<string, ReleasedMission[]>>((acc, row) => {
    const taskRow = asArray(row.tasks)[0];

    if (!taskRow?.id) {
      return acc;
    }

    const current = acc.get(row.plan_template_id) || [];
    current.push({
      id: taskRow.id,
      dayNumber: row.day_number,
      title: taskRow.title || row.title,
      taskType: taskRow.task_type || row.theme
    });
    acc.set(row.plan_template_id, current);
    return acc;
  }, new Map());

  const categoryOrder: TaskType[] = [
    "aptitude",
    "dsa",
    "sql",
    "hr",
    "revision"
  ];
  const nowIso = new Date().toISOString();
  let processed = 0;
  let skipped = 0;
  const failures: Array<{
    userId: string;
    email: string;
    message: string;
  }> = [];

  for (const plan of plans) {
    const profile = profileByUserId.get(plan.user_id);
    const reminder = reminderByUserId.get(plan.user_id) || null;
    const template = templateById.get(plan.plan_template_id);
    const email = emailByUserId.get(plan.user_id) || "";
    const timeZone = DEFAULT_TIMEZONE;
    const totalDays = template?.duration_days || 90;
    const currentDay = calculateCurrentDay(
      plan.start_date,
      totalDays,
      timeZone
    );

    if (!email || !isReminderEnabled(reminder)) {
      skipped += 1;
      continue;
    }

    if (
      !shouldSendReminder({
        currentDay,
        startDate: plan.start_date,
        totalDays,
        timeZone,
        lastSentAt: reminder?.last_sent_at || null
      })
    ) {
      skipped += 1;
      continue;
    }

    const releasedMissions = (missionsByTemplate.get(plan.plan_template_id) || [])
      .filter((mission) => mission.dayNumber <= currentDay)
      .sort((left, right) => left.dayNumber - right.dayNumber);

    if (!releasedMissions.length) {
      skipped += 1;
      continue;
    }

    const completedTaskIds = completedTaskIdsByUser.get(plan.user_id) || new Set();
    const completedCount = releasedMissions.filter((mission) =>
      completedTaskIds.has(mission.id)
    ).length;
    const pendingMissions: WeeklyReminderPendingMission[] = releasedMissions
      .filter((mission) => !completedTaskIds.has(mission.id))
      .map((mission) => ({
        dayNumber: mission.dayNumber,
        title: mission.title,
        taskType: mission.taskType
      }));
    const categorySummary: WeeklyReminderCategorySummary[] = categoryOrder.map(
      (taskType) => ({
        taskType,
        received: releasedMissions.filter((mission) => mission.taskType === taskType)
          .length,
        solved: releasedMissions.filter(
          (mission) =>
            mission.taskType === taskType && completedTaskIds.has(mission.id)
        ).length
      })
    );
    const emailPayload = buildWeeklyReminderEmail({
      fullName: profile?.full_name || email.split("@")[0] || "Student",
      joinDate: plan.start_date,
      currentDay,
      totalDays,
      releasedCount: releasedMissions.length,
      completedCount,
      pendingCount: pendingMissions.length,
      categorySummary,
      pendingMissions
    });

    try {
      await sendReminderEmail({
        to: email,
        subject: emailPayload.subject,
        html: emailPayload.html,
        text: emailPayload.text
      });

      await admin.from("reminder_preferences").upsert({
        user_id: plan.user_id,
        email_enabled: reminder?.email_enabled ?? true,
        weekly_reminder_enabled: reminder?.weekly_reminder_enabled ?? true,
        weekly_reminder_day: 0,
        weekly_reminder_hour: 19,
        timezone: timeZone,
        last_sent_at: nowIso
      });

      processed += 1;
    } catch (error) {
      failures.push({
        userId: plan.user_id,
        email,
        message: formatFailure(error)
      });
    }
  }

  return NextResponse.json({
    ok: failures.length === 0,
    processed,
    skipped,
    failed: failures.length,
    failures
  });
}
