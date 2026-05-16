import type { TaskType } from "@/types/domain";
import {
  formatPlanDate,
  formatTaskType,
  parseLocalDate
} from "@/lib/utils";

export interface WeeklyReminderCategorySummary {
  taskType: TaskType;
  received: number;
  solved: number;
}

export interface WeeklyReminderPendingMission {
  dayNumber: number;
  title: string;
  taskType: TaskType;
}

export interface WeeklyReminderSummary {
  fullName: string;
  joinDate: string;
  currentDay: number;
  totalDays: number;
  releasedCount: number;
  completedCount: number;
  pendingCount: number;
  categorySummary: WeeklyReminderCategorySummary[];
  pendingMissions: WeeklyReminderPendingMission[];
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function getWeeklyCheckpoint(dayNumber: number) {
  return Math.max(1, Math.floor(dayNumber / 7));
}

function getMotivationMessage(summary: WeeklyReminderSummary) {
  if (summary.pendingCount === 0) {
    return "Strong work. You are fully caught up, so keep protecting this rhythm and carry it into the next week.";
  }

  if (summary.completedCount === 0) {
    return "No pressure about the backlog. Pick the oldest pending day, finish one honest session, and let momentum restart from there.";
  }

  if (summary.pendingCount <= 2) {
    return "You are close. One or two clean sessions this week can put you fully back on track.";
  }

  if (summary.completedCount * 2 >= summary.releasedCount) {
    return "You already have momentum. A small catch-up block this week can close the gap faster than you think.";
  }

  return "Placement prep does not need perfect days. One focused hour is still enough to move forward and rebuild consistency.";
}

export function buildWeeklyReminderEmail(summary: WeeklyReminderSummary) {
  const checkpoint = getWeeklyCheckpoint(summary.currentDay);
  const joinedOn = formatPlanDate(parseLocalDate(summary.joinDate));
  const motivationMessage = getMotivationMessage(summary);
  const preview =
    summary.pendingCount > 0
      ? `You have completed ${summary.completedCount} of ${summary.releasedCount} released tasks so far.`
      : `You are fully caught up with ${summary.completedCount} of ${summary.releasedCount} released tasks completed.`;
  const subject =
    summary.pendingCount > 0
      ? `Sprint ${checkpoint} check-in: ${summary.pendingCount} task${summary.pendingCount === 1 ? "" : "s"} pending`
      : `Sprint ${checkpoint} check-in: you are on track`;
  const visiblePending = summary.pendingMissions.slice(0, 10);
  const hiddenPendingCount = Math.max(
    0,
    summary.pendingMissions.length - visiblePending.length
  );

  const categoryRowsHtml = summary.categorySummary
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.08); color: #f3f5f7;">${escapeHtml(
            formatTaskType(item.taskType)
          )}</td>
          <td style="padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.08); color: #cbd5e1; text-align: center;">${item.received}</td>
          <td style="padding: 10px 12px; border-top: 1px solid rgba(255,255,255,0.08); color: #86efac; text-align: center;">${item.solved}</td>
        </tr>
      `
    )
    .join("");

  const pendingHtml = visiblePending.length
    ? `
        <ul style="margin: 0; padding-left: 18px; color: #d7dde6;">
          ${visiblePending
            .map(
              (mission) => `
                <li style="margin-top: 8px;">
                  Day ${mission.dayNumber}: ${escapeHtml(mission.title)} (${escapeHtml(
                    formatTaskType(mission.taskType)
                  )})
                </li>
              `
            )
            .join("")}
        </ul>
        ${
          hiddenPendingCount
            ? `<p style="margin: 12px 0 0; color: #9aa4b2;">Plus ${hiddenPendingCount} more pending day${hiddenPendingCount === 1 ? "" : "s"}.</p>`
            : ""
        }
      `
    : `<p style="margin: 0; color: #86efac;">No pending days right now. Keep the rhythm calm and steady.</p>`;

  const html = `
    <div style="margin: 0; padding: 28px 16px; background: #0b1016; color: #f3f5f7; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
      <div style="max-width: 680px; margin: 0 auto; border: 1px solid rgba(255,255,255,0.08); border-radius: 24px; overflow: hidden; background: #151b23;">
        <div style="padding: 28px; background: linear-gradient(180deg, #1b2432 0%, #151b23 100%); border-bottom: 1px solid rgba(255,255,255,0.08);">
          <div style="color: #ffb84d; font-size: 12px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase;">SamyakLabs.AI</div>
          <h1 style="margin: 12px 0 8px; font-size: 28px; line-height: 1.1; color: #f8fafc;">Your weekly sprint check-in</h1>
          <p style="margin: 0; color: #cbd5e1; line-height: 1.6;">Hi ${escapeHtml(
            summary.fullName
          )}, here is your progress summary so far.</p>
        </div>

        <div style="padding: 28px; display: grid; gap: 18px;">
          <div style="display: grid; gap: 10px; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));">
            <div style="padding: 16px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Joined</div>
              <div style="margin-top: 8px; font-size: 16px; color: #f8fafc; font-weight: 700;">${escapeHtml(
                joinedOn
              )}</div>
            </div>
            <div style="padding: 16px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Current day</div>
              <div style="margin-top: 8px; font-size: 16px; color: #f8fafc; font-weight: 700;">Day ${summary.currentDay} of ${summary.totalDays}</div>
            </div>
            <div style="padding: 16px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Completed</div>
              <div style="margin-top: 8px; font-size: 16px; color: #86efac; font-weight: 700;">${summary.completedCount} / ${summary.releasedCount}</div>
            </div>
            <div style="padding: 16px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08);">
              <div style="font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Pending</div>
              <div style="margin-top: 8px; font-size: 16px; color: #fbbf24; font-weight: 700;">${summary.pendingCount}</div>
            </div>
          </div>

          <div style="padding: 18px; border-radius: 18px; border: 1px solid rgba(255,184,77,0.16); background: rgba(255,161,22,0.08);">
            <div style="font-size: 13px; color: #ffcf7a; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Summary</div>
            <p style="margin: 10px 0 0; color: #e5e7eb; line-height: 1.7;">
              You have received <strong>${summary.releasedCount}</strong> daily task${summary.releasedCount === 1 ? "" : "s"} so far.
              You completed <strong>${summary.completedCount}</strong> and still have
              <strong> ${summary.pendingCount}</strong> pending.
            </p>
          </div>

          <div>
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #f8fafc;">Category summary</h2>
            <table style="width: 100%; border-collapse: collapse; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; overflow: hidden;">
              <thead style="background: rgba(255,255,255,0.04);">
                <tr>
                  <th style="padding: 12px; text-align: left; font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Category</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Received</th>
                  <th style="padding: 12px; text-align: center; font-size: 12px; color: #9aa4b2; text-transform: uppercase; letter-spacing: 0.06em;">Solved</th>
                </tr>
              </thead>
              <tbody>${categoryRowsHtml}</tbody>
            </table>
          </div>

          <div>
            <h2 style="margin: 0 0 12px; font-size: 18px; color: #f8fafc;">Days still pending</h2>
            ${pendingHtml}
          </div>

          <div style="padding: 18px; border-radius: 18px; border: 1px solid rgba(34,197,94,0.18); background: rgba(34,197,94,0.08);">
            <div style="font-size: 13px; color: #86efac; font-weight: 700; text-transform: uppercase; letter-spacing: 0.06em;">Motivation</div>
            <p style="margin: 10px 0 0; color: #ecfdf5; line-height: 1.7;">${escapeHtml(
              motivationMessage
            )}</p>
          </div>
        </div>
      </div>
    </div>
  `;

  const text = [
    "SamyakLabs.AI weekly sprint check-in",
    "",
    `Hi ${summary.fullName},`,
    "",
    `Joined: ${joinedOn}`,
    `Current day: Day ${summary.currentDay} of ${summary.totalDays}`,
    `Received so far: ${summary.releasedCount}`,
    `Completed: ${summary.completedCount}`,
    `Pending: ${summary.pendingCount}`,
    "",
    "Category summary:",
    ...summary.categorySummary.map(
      (item) =>
        `- ${formatTaskType(item.taskType)}: received ${item.received}, solved ${item.solved}`
    ),
    "",
    visiblePending.length
      ? "Pending days:"
      : "Pending days: none right now.",
    ...visiblePending.map(
      (mission) =>
        `- Day ${mission.dayNumber}: ${mission.title} (${formatTaskType(
          mission.taskType
        )})`
    ),
    hiddenPendingCount
      ? `- Plus ${hiddenPendingCount} more pending day${hiddenPendingCount === 1 ? "" : "s"}.`
      : "",
    "",
    `Motivation: ${motivationMessage}`
  ]
    .filter(Boolean)
    .join("\n");

  return {
    subject,
    preview,
    html,
    text
  };
}
