import { cookies } from "next/headers";

import type { DemoState } from "@/types/domain";
import {
  demoProfile,
  demoReminderSettings
} from "@/lib/sample-data";
import { shiftDays, toDateOnly } from "@/lib/utils";

const COOKIE_NAME = "placement-demo-state";

function createDefaultDemoState(): DemoState {
  return {
    startDate: toDateOnly(shiftDays(new Date(), -4)),
    profile: {
      fullName: demoProfile.fullName,
      collegeName: demoProfile.collegeName,
      targetRole: demoProfile.targetRole,
      timezone: demoProfile.timezone,
      role: demoProfile.role
    },
    reminderSettings: {
      emailEnabled: demoReminderSettings.emailEnabled,
      weeklyReminderEnabled: demoReminderSettings.weeklyReminderEnabled,
      weeklyReminderDay: demoReminderSettings.weeklyReminderDay,
      weeklyReminderHour: demoReminderSettings.weeklyReminderHour,
      timezone: demoReminderSettings.timezone
    },
    attemptedTaskIds: ["mission-day-1", "mission-day-2", "mission-day-3"],
    unlockedTaskIds: ["mission-day-1", "mission-day-2", "mission-day-3"],
    completedTaskIds: ["mission-day-1", "mission-day-2"],
    scores: {
      "mission-day-1": 80,
      "mission-day-2": 60
    }
  };
}

export async function getDemoState() {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;

  if (!raw) {
    return createDefaultDemoState();
  }

  try {
    const parsed = JSON.parse(raw) as DemoState;
    return {
      ...createDefaultDemoState(),
      ...parsed
    };
  } catch {
    return createDefaultDemoState();
  }
}

export async function setDemoState(nextState: DemoState) {
  const store = await cookies();

  store.set(COOKIE_NAME, JSON.stringify(nextState), {
    path: "/",
    maxAge: 60 * 60 * 24 * 90,
    sameSite: "lax",
    httpOnly: false
  });
}
