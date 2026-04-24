import type { ReminderSettings, StudentProfile, ViewerContext } from "@/types/domain";

import { getDemoState } from "@/lib/demo-state";
import { isSupabaseConfigured } from "@/lib/env";
import {
  demoProfile,
  demoReminderSettings
} from "@/lib/sample-data";
import { createSupabaseServerClient } from "@/lib/supabase/server";

function mergeDemoProfile(state: Awaited<ReturnType<typeof getDemoState>>): StudentProfile {
  return {
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
}

export async function getDemoSettings(): Promise<ReminderSettings> {
  const state = await getDemoState();

  return {
    ...demoReminderSettings,
    ...state.reminderSettings,
    timezone: state.reminderSettings.timezone || demoReminderSettings.timezone,
    emailEnabled:
      state.reminderSettings.emailEnabled ?? demoReminderSettings.emailEnabled,
    weeklyReminderEnabled:
      state.reminderSettings.weeklyReminderEnabled ??
      demoReminderSettings.weeklyReminderEnabled,
    weeklyReminderDay:
      state.reminderSettings.weeklyReminderDay ??
      demoReminderSettings.weeklyReminderDay,
    weeklyReminderHour:
      state.reminderSettings.weeklyReminderHour ??
      demoReminderSettings.weeklyReminderHour
  };
}

export async function getViewerContext(): Promise<ViewerContext> {
  if (!isSupabaseConfigured()) {
    const state = await getDemoState();
    const profile = mergeDemoProfile(state);

    return {
      mode: "demo",
      userId: profile.userId,
      displayName: profile.fullName,
      profile,
      isAdmin: true,
      hasFullAccess: true
    };
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      mode: "supabase",
      userId: null,
      displayName: "Student",
      profile: null,
      isAdmin: false,
      hasFullAccess: false
    };
  }

  const fullAccess = Boolean(user.app_metadata?.full_access);

  const { data: profileRow } = await supabase
    .from("profiles")
    .select("full_name, college_name, target_role, timezone, role")
    .eq("user_id", user.id)
    .maybeSingle();

  const profile: StudentProfile = {
    userId: user.id,
    fullName:
      profileRow?.full_name ||
      user.user_metadata?.full_name ||
      user.email?.split("@")[0] ||
      "Student",
    collegeName: profileRow?.college_name || "",
    targetRole: profileRow?.target_role || "Software Engineer",
    timezone: profileRow?.timezone || "Asia/Kolkata",
    role: profileRow?.role === "admin" ? "admin" : "student",
    fullAccess
  };

  return {
    mode: "supabase",
    userId: user.id,
    displayName: profile.fullName,
    profile,
    isAdmin: profile.role === "admin",
    hasFullAccess: fullAccess
  };
}
