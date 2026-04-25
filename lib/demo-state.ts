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
    startDate: toDateOnly(shiftDays(new Date(), -4), demoProfile.timezone),
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
    },
    responsesByTaskId: {}
  };
}

function createBlankDemoState(): DemoState {
  return {
    ...createDefaultDemoState(),
    attemptedTaskIds: [],
    unlockedTaskIds: [],
    completedTaskIds: [],
    scores: {},
    responsesByTaskId: {}
  };
}

export async function getDemoState(options?: {
  blankProgress?: boolean;
  ownerUserId?: string | null;
}) {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  const fallbackState = options?.blankProgress
    ? createBlankDemoState()
    : createDefaultDemoState();

  if (!raw) {
    if (options?.ownerUserId) {
      return {
        ...fallbackState,
        profile: {
          ...fallbackState.profile,
          userId: options.ownerUserId
        }
      };
    }

    return fallbackState;
  }

  try {
    const parsed = JSON.parse(raw) as DemoState;

    if (
      options?.ownerUserId &&
      parsed.profile?.userId !== options.ownerUserId
    ) {
      return {
        ...fallbackState,
        profile: {
          ...fallbackState.profile,
          userId: options.ownerUserId
        }
      };
    }

    return {
      ...fallbackState,
      ...parsed,
      profile: {
        ...fallbackState.profile,
        ...parsed.profile,
        ...(options?.ownerUserId ? { userId: options.ownerUserId } : {})
      },
      reminderSettings: {
        ...fallbackState.reminderSettings,
        ...parsed.reminderSettings
      },
      scores: {
        ...fallbackState.scores,
        ...parsed.scores
      },
      responsesByTaskId: {
        ...fallbackState.responsesByTaskId,
        ...parsed.responsesByTaskId
      }
    };
  } catch {
    return fallbackState;
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
