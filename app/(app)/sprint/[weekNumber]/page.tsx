import Link from "next/link";
import { redirect } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSnapshot } from "@/lib/data";
import { deriveMissionStatus } from "@/lib/plan";
import {
  buildRedirect,
  formatPlanDate,
  formatTaskType,
  parseLocalDate,
  shiftDays
} from "@/lib/utils";
import type { MissionStatus } from "@/types/domain";

type Params = Promise<{ weekNumber: string }>;

function getQueueState(status: MissionStatus) {
  switch (status) {
    case "completed":
      return { label: "Done", tone: "done" };
    case "missed":
      return { label: "Pending", tone: "missed" };
    case "attempted":
    case "solution_unlocked":
      return { label: "Started", tone: "started" };
    case "locked":
      return { label: "Locked", tone: "locked" };
    default:
      return { label: "Open", tone: "open" };
  }
}

export default async function SprintPage({
  params
}: {
  params: Params;
}) {
  const { weekNumber: weekNumberParam } = await params;
  const snapshot = await getDashboardSnapshot();
  const weekNumber = Number(weekNumberParam);

  if (!snapshot || !Number.isFinite(weekNumber) || weekNumber < 1) {
    redirect(
      buildRedirect("/dashboard", {
        error: "That sprint is not available right now."
      })
    );
  }

  const maxAllowedSprint = snapshot.hasFullAccess
    ? Math.max(snapshot.currentWeek, snapshot.activeSprintWeek)
    : snapshot.activeSprintWeek;

  if (weekNumber > maxAllowedSprint) {
    redirect(
      buildRedirect("/dashboard", {
        error: "Finish the current sprint first to unlock the next sprint."
      })
    );
  }

  const planStartDate = parseLocalDate(snapshot.startDate);
  const sprintMissions = snapshot.missions
    .filter((mission) => mission.weekNumber === weekNumber)
    .sort((left, right) => left.dayNumber - right.dayNumber);

  const completedCount = sprintMissions.filter(
    (mission) => snapshot.progressByTaskId[mission.id]?.status === "completed"
  ).length;

  return (
    <div className="stack">
      <SectionCard
        title={`Sprint ${weekNumber}`}
        eyebrow={weekNumber === snapshot.activeSprintWeek ? "Current sprint" : "Unlocked sprint"}
        aside={
          <div className="pill-row">
            <span className="pill">{completedCount}/{sprintMissions.length} done</span>
            <Link href="/dashboard" className="button-ghost" data-loading-label="Opening dashboard">
              Back
            </Link>
          </div>
        }
      >
        <p className="muted">
          This sprint has 7 tasks. Inside this sprint, day-wise locking still applies,
          and the next sprint stays hidden until this sprint is completed.
        </p>
      </SectionCard>

      <SectionCard title="Sprint tasks" eyebrow={`Sprint ${weekNumber} queue`}>
        <div className="task-list">
          {sprintMissions.map((mission) => {
            const progress = snapshot.progressByTaskId[mission.id] || null;
            const status = deriveMissionStatus(
              mission,
              snapshot.currentDay,
              progress,
              snapshot.hasFullAccess
            );
            const queueState = getQueueState(status);
            const scheduledFor = formatPlanDate(
              shiftDays(planStartDate, mission.dayNumber - 1)
            );
            const rowClass =
              status === "completed"
                ? "task-row task-row--interactive task-row--completed"
                : status === "locked"
                  ? "task-row task-row--locked"
                  : "task-row task-row--interactive";

            if (status === "locked") {
              return (
                <div key={mission.id} className={rowClass}>
                  <div className="task-row__meta">
                    <strong className="task-row__title-text">
                      Day {mission.dayNumber}: {mission.title}
                    </strong>
                    <p className="task-row__schedule">{scheduledFor}</p>
                    <p className="muted">
                      {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
                    </p>
                  </div>
                  <div className="pill-row">
                    <StatusBadge taskType={mission.taskType} />
                    <span className={`queue-status queue-status--${queueState.tone}`}>
                      {queueState.label}
                    </span>
                  </div>
                </div>
              );
            }

            return (
              <Link
                key={mission.id}
                href={`/mission/${mission.id}`}
                className={rowClass}
                data-loading-label={`Opening Day ${mission.dayNumber}`}
              >
                <div className="task-row__meta">
                  <strong className="task-row__title-text">
                    Day {mission.dayNumber}: {mission.title}
                  </strong>
                  <p className="task-row__schedule">{scheduledFor}</p>
                  <p className="muted">
                    {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
                  </p>
                </div>
                <div className="pill-row">
                  <StatusBadge taskType={mission.taskType} />
                  <span className={`queue-status queue-status--${queueState.tone}`}>
                    {queueState.label}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
}
