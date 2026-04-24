"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getViewerContext } from "@/lib/auth";
import { getMissionDetail } from "@/lib/data";
import { getDemoState, setDemoState } from "@/lib/demo-state";
import { getAppUrl, isSupabaseConfigured } from "@/lib/env";
import { scoreAptitudeMission } from "@/lib/plan";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  buildRedirect,
  getSafeNextPath,
  looksLikeUuid,
  toDateOnly,
  unique
} from "@/lib/utils";

function readString(
  formData: FormData,
  key: string,
  options?: { defaultValue?: string }
) {
  const value = formData.get(key);
  if (typeof value === "string") {
    return value.trim();
  }

  return options?.defaultValue || "";
}

function readNumber(formData: FormData, key: string, defaultValue: number) {
  const value = Number(readString(formData, key, { defaultValue: `${defaultValue}` }));
  return Number.isFinite(value) ? value : defaultValue;
}

function readAnswers(formData: FormData, questionIds: string[]) {
  return questionIds.reduce<Record<string, string>>((acc, questionId) => {
    const value = readString(formData, `answer_${questionId}`);

    if (value) {
      acc[questionId] = value;
    }

    return acc;
  }, {});
}

export async function signInAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/dashboard");
  }

  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const nextPath = getSafeNextPath(readString(formData, "next"), "/dashboard");

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(
      buildRedirect("/login", {
        error: error.message,
        next: nextPath
      })
    );
  }

  redirect(nextPath);
}

export async function signUpAction(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect("/onboarding");
  }

  const fullName = readString(formData, "fullName");
  const email = readString(formData, "email");
  const password = readString(formData, "password");
  const nextPath = getSafeNextPath(readString(formData, "next"), "/onboarding");
  const timezone = readString(formData, "timezone", {
    defaultValue: "Asia/Kolkata"
  });

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getAppUrl()}${nextPath}`,
      data: {
        full_name: fullName,
        timezone
      }
    }
  });

  if (error) {
    redirect(
      buildRedirect("/signup", {
        error: error.message,
        next: nextPath
      })
    );
  }

  if (!data.session) {
    redirect(
      buildRedirect("/login", {
        notice: "Check your email to verify the account, then sign in.",
        next: nextPath
      })
    );
  }

  redirect(nextPath);
}

export async function requestPasswordResetAction(formData: FormData) {
  const email = readString(formData, "email");

  if (!email) {
    redirect(
      buildRedirect("/forgot-password", {
        error: "Enter your email address to receive a reset link."
      })
    );
  }

  if (!isSupabaseConfigured()) {
    redirect(
      buildRedirect("/forgot-password", {
        notice:
          "Supabase auth is not configured yet, so reset emails are disabled in demo mode."
      })
    );
  }

  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${getAppUrl()}/reset-password`
  });

  if (error) {
    redirect(
      buildRedirect("/forgot-password", {
        error: error.message
      })
    );
  }

  redirect(
    buildRedirect("/forgot-password", {
      notice:
        "If that email exists in the system, a password reset link has been sent."
    })
  );
}

export async function saveOnboardingAction(formData: FormData) {
  const fullName = readString(formData, "fullName");
  const collegeName = readString(formData, "collegeName");
  const targetRole = readString(formData, "targetRole");
  const timezone = readString(formData, "timezone", {
    defaultValue: "Asia/Kolkata"
  });
  const weeklyReminderDay = readNumber(formData, "weeklyReminderDay", 0);
  const weeklyReminderHour = readNumber(formData, "weeklyReminderHour", 19);

  if (!fullName) {
    redirect(buildRedirect("/onboarding", { error: "Please add your name." }));
  }

  if (!isSupabaseConfigured()) {
    const current = await getDemoState();

    await setDemoState({
      ...current,
      startDate: toDateOnly(new Date()),
      profile: {
        ...current.profile,
        fullName,
        collegeName,
        targetRole,
        timezone
      },
      reminderSettings: {
        ...current.reminderSettings,
        timezone,
        emailEnabled: true,
        weeklyReminderEnabled: true,
        weeklyReminderDay,
        weeklyReminderHour
      }
    });

    revalidatePath("/dashboard");
    redirect("/dashboard");
  }

  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  await supabase.from("profiles").upsert({
    user_id: viewer.userId,
    full_name: fullName,
    college_name: collegeName,
    target_role: targetRole,
    timezone,
    role: viewer.isAdmin ? "admin" : "student"
  });

  const { data: existingPlan } = await supabase
    .from("student_plans")
    .select("id")
    .eq("user_id", viewer.userId)
    .eq("status", "active")
    .maybeSingle();

  const { data: activePlan } = await supabase
    .from("plan_templates")
    .select("id")
    .eq("is_active", true)
    .maybeSingle();

  if (!activePlan?.id) {
    redirect(
      buildRedirect("/onboarding", {
        error: "Create an active plan in Supabase before onboarding students."
      })
    );
  }

  const startDate = toDateOnly(new Date());

  if (existingPlan?.id) {
    await supabase
      .from("student_plans")
      .update({
        plan_template_id: activePlan.id,
        start_date: startDate,
        target_minutes_per_day: 60
      })
      .eq("id", existingPlan.id);
  } else {
    await supabase.from("student_plans").insert({
      user_id: viewer.userId,
      plan_template_id: activePlan.id,
      start_date: startDate,
      status: "active",
      target_minutes_per_day: 60
    });
  }

  await supabase.from("reminder_preferences").upsert({
    user_id: viewer.userId,
    email_enabled: true,
    weekly_reminder_enabled: true,
    weekly_reminder_day: weeklyReminderDay,
    weekly_reminder_hour: weeklyReminderHour,
    timezone
  });

  revalidatePath("/dashboard");
  revalidatePath("/settings");
  redirect("/dashboard");
}

export async function saveSettingsAction(formData: FormData) {
  const fullName = readString(formData, "fullName");
  const collegeName = readString(formData, "collegeName");
  const targetRole = readString(formData, "targetRole");
  const timezone = readString(formData, "timezone", {
    defaultValue: "Asia/Kolkata"
  });
  const emailEnabled = readString(formData, "emailEnabled") === "on";
  const weeklyReminderEnabled =
    readString(formData, "weeklyReminderEnabled") === "on";
  const weeklyReminderDay = readNumber(formData, "weeklyReminderDay", 0);
  const weeklyReminderHour = readNumber(formData, "weeklyReminderHour", 19);

  if (!isSupabaseConfigured()) {
    const current = await getDemoState();

    await setDemoState({
      ...current,
      profile: {
        ...current.profile,
        fullName,
        collegeName,
        targetRole,
        timezone
      },
      reminderSettings: {
        ...current.reminderSettings,
        timezone,
        emailEnabled,
        weeklyReminderEnabled,
        weeklyReminderDay,
        weeklyReminderHour
      }
    });

    revalidatePath("/settings");
    revalidatePath("/dashboard");
    redirect(buildRedirect("/settings", { saved: "Profile updated." }));
  }

  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();

  await supabase.from("profiles").upsert({
    user_id: viewer.userId,
    full_name: fullName,
    college_name: collegeName,
    target_role: targetRole,
    timezone,
    role: viewer.isAdmin ? "admin" : "student"
  });

  await supabase.from("reminder_preferences").upsert({
    user_id: viewer.userId,
    email_enabled: emailEnabled,
    weekly_reminder_enabled: weeklyReminderEnabled,
    weekly_reminder_day: weeklyReminderDay,
    weekly_reminder_hour: weeklyReminderHour,
    timezone
  });

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  redirect(buildRedirect("/settings", { saved: "Settings updated." }));
}

export async function submitMissionAttemptAction(formData: FormData) {
  const taskId = readString(formData, "taskId");
  const detail = await getMissionDetail(taskId);

  if (!detail) {
    redirect("/dashboard");
  }

  const answers = readAnswers(
    formData,
    detail.mission.questions.map((question) => question.id)
  );

  if (!Object.keys(answers).length) {
    redirect(
      buildRedirect(`/mission/${taskId}`, {
        error: "Add at least one answer before unlocking the solution."
      })
    );
  }

  const useFallbackStorage =
    !isSupabaseConfigured() ||
    !detail.mission.planDayId ||
    !looksLikeUuid(taskId);

  if (useFallbackStorage) {
    const current = await getDemoState();
    const nextScores = { ...current.scores };

    if (detail.mission.taskType === "aptitude") {
      nextScores[taskId] = scoreAptitudeMission(detail.mission, answers).score;
    }

    await setDemoState({
      ...current,
      attemptedTaskIds: unique([...current.attemptedTaskIds, taskId]),
      unlockedTaskIds: unique([...current.unlockedTaskIds, taskId]),
      scores: nextScores
    });

    revalidatePath(`/mission/${taskId}`);
    revalidatePath("/dashboard");
    redirect(buildRedirect(`/mission/${taskId}`, { submitted: "Attempt saved." }));
  }

  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingProgress } = await supabase
    .from("user_task_progress")
    .select("id, attempt_count, completed_at, first_attempt_at, solution_unlocked_at")
    .eq("user_id", viewer.userId)
    .eq("task_id", taskId)
    .maybeSingle();

  const attemptCount = (existingProgress?.attempt_count || 0) + 1;
  const now = new Date().toISOString();

  const scoring =
    detail.mission.taskType === "aptitude"
      ? scoreAptitudeMission(detail.mission, answers)
      : null;

  const nextStatus = existingProgress?.completed_at
    ? "completed"
    : "solution_unlocked";

  const progressPayload = {
    user_id: viewer.userId,
    task_id: taskId,
    plan_day_id: detail.mission.planDayId,
    status: nextStatus,
    attempt_count: attemptCount,
    score: scoring?.score ?? null,
    first_attempt_at: existingProgress?.first_attempt_at || now,
    solution_unlocked_at: existingProgress?.solution_unlocked_at || now
  };

  const progressResult = existingProgress?.id
    ? await supabase
        .from("user_task_progress")
        .update(progressPayload)
        .eq("id", existingProgress.id)
        .select("id")
        .single()
    : await supabase
        .from("user_task_progress")
        .insert(progressPayload)
        .select("id")
        .single();

  if (progressResult.error) {
    redirect(
      buildRedirect(`/mission/${taskId}`, {
        error: progressResult.error.message
      })
    );
  }

  const progressId = progressResult.data?.id;

  if (progressId) {
    const correctnessByQuestion = new Map(
      (scoring?.byQuestion || []).map((result) => [result.questionId, result.isCorrect])
    );

    const attemptsResult = await supabase.from("question_attempts").insert(
      detail.mission.questions.map((question) => ({
        user_id: viewer.userId,
        user_task_progress_id: progressId,
        task_question_id: question.id,
        attempt_no: attemptCount,
        selected_option_id:
          question.questionType === "mcq" ? answers[question.id] || null : null,
        answer_text:
          question.questionType === "mcq" ? null : answers[question.id] || null,
        is_correct:
          detail.mission.taskType === "aptitude"
            ? correctnessByQuestion.get(question.id) || false
            : null
      }))
    );

    if (attemptsResult.error) {
      redirect(
        buildRedirect(`/mission/${taskId}`, {
          error: attemptsResult.error.message
        })
      );
    }
  }

  revalidatePath(`/mission/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  redirect(buildRedirect(`/mission/${taskId}`, { submitted: "Attempt saved." }));
}

export async function completeMissionAction(formData: FormData) {
  const taskId = readString(formData, "taskId");
  const detail = await getMissionDetail(taskId);

  if (!detail) {
    redirect("/dashboard");
  }

  if (!detail.canMarkComplete) {
    redirect(
      buildRedirect(`/mission/${taskId}`, {
        error: "Submit an attempt before marking the mission complete."
      })
    );
  }

  const useFallbackStorage =
    !isSupabaseConfigured() ||
    !detail.mission.planDayId ||
    !looksLikeUuid(taskId);

  if (useFallbackStorage) {
    const current = await getDemoState();

    await setDemoState({
      ...current,
      unlockedTaskIds: unique([...current.unlockedTaskIds, taskId]),
      completedTaskIds: unique([...current.completedTaskIds, taskId])
    });

    revalidatePath(`/mission/${taskId}`);
    revalidatePath("/dashboard");
    revalidatePath("/progress");
    redirect(buildRedirect(`/mission/${taskId}`, { completed: "Mission completed." }));
  }

  const viewer = await getViewerContext();

  if (!viewer.userId) {
    redirect("/login");
  }

  const supabase = await createSupabaseServerClient();
  const { data: existingProgress } = await supabase
    .from("user_task_progress")
    .select("id")
    .eq("user_id", viewer.userId)
    .eq("task_id", taskId)
    .maybeSingle();

  const payload = {
    user_id: viewer.userId,
    task_id: taskId,
    plan_day_id: detail.mission.planDayId,
    status: "completed",
    attempt_count: detail.progress?.attemptCount || 1,
    score: detail.progress?.score ?? null,
    solution_unlocked_at:
      detail.progress?.solutionUnlockedAt || new Date().toISOString(),
    completed_at: new Date().toISOString()
  };

  if (existingProgress?.id) {
    const updateResult = await supabase
      .from("user_task_progress")
      .update(payload)
      .eq("id", existingProgress.id);

    if (updateResult.error) {
      redirect(
        buildRedirect(`/mission/${taskId}`, {
          error: updateResult.error.message
        })
      );
    }
  } else {
    const insertResult = await supabase.from("user_task_progress").insert(payload);

    if (insertResult.error) {
      redirect(
        buildRedirect(`/mission/${taskId}`, {
          error: insertResult.error.message
        })
      );
    }
  }

  revalidatePath(`/mission/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/progress");
  redirect(buildRedirect(`/mission/${taskId}`, { completed: "Mission completed." }));
}

export async function previewImportAction(formData: FormData) {
  const csv = readString(formData, "csv");
  const { previewImport } = await import("@/lib/data");
  const result = previewImport(csv);

  if (!result.ok) {
    redirect(
      buildRedirect("/admin/content", {
        error: result.error || "Unable to preview the CSV import."
      })
    );
  }

  redirect(
    buildRedirect("/admin/content", {
      rows: `${result.summary.rowCount}`,
      days: `${result.summary.uniqueDays}`,
      types: result.summary.taskTypes.join(", ")
    })
  );
}

export async function signOutAction() {
  if (!isSupabaseConfigured()) {
    redirect("/");
  }

  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  redirect("/login");
}
