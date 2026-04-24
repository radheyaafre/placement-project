import type { DashboardSnapshot } from "@/types/domain";
import { formatWeekday } from "@/lib/utils";

export function buildWeeklyReminder(snapshot: DashboardSnapshot) {
  const completionText = `${snapshot.completedCount} of ${snapshot.totalDays} missions completed`;
  const streakText = `${snapshot.currentStreak}-day streak`;
  const reminderDay = formatWeekday(snapshot.reminderSettings.weeklyReminderDay);

  return {
    subject: `Keep your placement streak alive this ${reminderDay}`,
    preview:
      snapshot.pendingCount > 0
        ? `You have ${snapshot.pendingCount} mission${snapshot.pendingCount === 1 ? "" : "s"} ready to tackle.`
        : "You are on track. Keep showing up for your daily hour.",
    lines: [
      `Hi ${snapshot.profile.fullName},`,
      `You are currently on ${streakText} with ${completionText}.`,
      `Today's focus is ${snapshot.todayMission.title}.`,
      "Block one hour, attempt first, and then review the solution.",
      "Keep going."
    ]
  };
}
