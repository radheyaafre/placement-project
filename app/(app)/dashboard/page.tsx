import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSnapshot } from "@/lib/data";
import { deriveMissionStatus } from "@/lib/plan";
import { formatPlanDate, parseLocalDate, shiftDays } from "@/lib/utils";
import type { MissionStatus } from "@/types/domain";

function getQueueState(status: MissionStatus) {
  switch (status) {
    case "completed":
      return { label: "Done", tone: "done" };
    case "attempted":
    case "solution_unlocked":
      return { label: "Started", tone: "started" };
    case "locked":
      return { label: "Locked", tone: "locked" };
    default:
      return { label: "Open", tone: "open" };
  }
}

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot) {
    return null;
  }

  const planStartDate = parseLocalDate(snapshot.startDate);
  const dashboardMissions = snapshot.hasFullAccess
    ? snapshot.missions
    : snapshot.missions.filter(
        (mission) => mission.weekNumber === snapshot.currentWeek
      );
  const currentPlan = dashboardMissions
    .map((mission) => {
      const progress = snapshot.progressByTaskId[mission.id] || null;
      const status = deriveMissionStatus(
        mission,
        snapshot.currentDay,
        progress,
        snapshot.hasFullAccess
      );
      const scheduledFor = formatPlanDate(
        shiftDays(planStartDate, mission.dayNumber - 1)
      );
      const metaParts = [`${mission.estimatedMinutes} min`];

      return {
        mission,
        status,
        isLocked: status === "locked",
        metaText: metaParts.join(" | "),
        scheduledFor
      };
    });
  const progressLabel = `${snapshot.completedCount}/${snapshot.totalDays}`;
  const completedCaption =
    snapshot.completedCount === 1 ? "day completed" : "days completed";
  const consistencyCaption = "completed without skipping";
  const queueTitle = snapshot.hasFullAccess ? "Full mission queue" : "This week's queue";
  const queueEyebrow = snapshot.hasFullAccess
    ? "Tester access"
    : `Day ${snapshot.currentDay} of ${snapshot.totalDays}`;
  const queueAside = (
    <span className="pill">
      {snapshot.hasFullAccess ? "All days unlocked" : `Week ${snapshot.currentWeek}`}
    </span>
  );

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--dashboard dashboard-hero">
        <div className="dashboard-toolbar">
          <div className="hero-copy dashboard-hero__copy">
            <p className="eyebrow">Mission queue</p>
            <h1 className="dashboard-hero__title">Keep the next step obvious.</h1>
            <p className="dashboard-hero__meta">
              Open today&apos;s task, finish it, and let the rest of the plan unlock
              one day at a time.
            </p>
          </div>
          <div className="button-row">
            <Link
              href={`/mission/${snapshot.todayMission.id}`}
              className="button"
              data-loading-label="Opening today's mission"
            >
              Open today&apos;s mission
            </Link>
            <Link
              href="/progress"
              className="button-secondary"
              data-loading-label="Opening progress"
            >
              See full progress
            </Link>
          </div>
        </div>

        <div className="stat-grid dashboard-hero__stats">
          <div className="stat-card">
            <span className="stat-card__label">Progress</span>
            <strong>{progressLabel}</strong>
            <p className="muted">{completedCaption}</p>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Started</span>
            <strong>{snapshot.inProgressCount}</strong>
            <p className="muted">started but not finished</p>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Days in a row</span>
            <strong>{snapshot.currentStreak}</strong>
            <p className="muted">{consistencyCaption}</p>
          </div>
        </div>
      </section>

      <SectionCard title={queueTitle} eyebrow={queueEyebrow} aside={queueAside}>
        <div className="task-list">
          {currentPlan.map(({ mission, metaText, isLocked, scheduledFor, status }) => {
            const queueState = getQueueState(status);

            return isLocked ? (
              <div
                key={mission.id}
                className="task-row task-row--locked"
              >
                <div className="task-row__meta">
                  <strong className="task-row__title-text">
                    Day {mission.dayNumber}: {mission.title}
                  </strong>
                  <p className="task-row__schedule">{scheduledFor}</p>
                  <p className="muted">{metaText}</p>
                  <p className="muted">Available on Day {mission.dayNumber}.</p>
                </div>
                <div className="pill-row">
                  <StatusBadge taskType={mission.taskType} />
                  <span className={`queue-status queue-status--${queueState.tone}`}>
                    {queueState.label}
                  </span>
                </div>
              </div>
            ) : (
              <Link
                key={mission.id}
                href={`/mission/${mission.id}`}
                className="task-row task-row--interactive"
                data-loading-label={`Opening Day ${mission.dayNumber}`}
              >
                <div className="task-row__meta">
                  <strong className="task-row__title-text">
                    Day {mission.dayNumber}: {mission.title}
                  </strong>
                  <p className="task-row__schedule">{scheduledFor}</p>
                  <p className="muted">{metaText}</p>
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
