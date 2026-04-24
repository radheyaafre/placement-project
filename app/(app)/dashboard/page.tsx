import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSnapshot } from "@/lib/data";
import { deriveMissionStatus } from "@/lib/plan";
import { formatPlanDate, formatTaskType, parseLocalDate, shiftDays } from "@/lib/utils";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot) {
    return null;
  }

  const planStartDate = parseLocalDate(snapshot.startDate);
  const todayMissionDate = formatPlanDate(
    shiftDays(planStartDate, snapshot.todayMission.dayNumber - 1)
  );
  const currentPlan = snapshot.missions
    .filter((mission) => mission.weekNumber === snapshot.currentWeek)
    .map((mission) => {
      const progress = snapshot.progressByTaskId[mission.id] || null;
      const status = deriveMissionStatus(mission, snapshot.currentDay, progress);
      const scheduledFor = formatPlanDate(
        shiftDays(planStartDate, mission.dayNumber - 1)
      );
      const metaParts = [
        formatTaskType(mission.taskType),
        `${mission.estimatedMinutes} min`
      ];

      if (typeof progress?.score === "number") {
        metaParts.push(`Score ${progress.score}%`);
      }

      if (status === "completed") {
        metaParts.push("Completed");
      } else if (status === "attempted" || status === "solution_unlocked") {
        metaParts.push("Started");
      }

      return {
        mission,
        status,
        score: progress?.score ?? null,
        isLocked: status === "locked",
        metaText: metaParts.join(" • "),
        scheduledFor
      };
    });
  const progressLabel = `${snapshot.completedCount}/${snapshot.totalDays}`;
  const completedCaption =
    snapshot.completedCount === 1 ? "day completed" : "days completed";
  const streakCaption =
    snapshot.currentStreak === 1 ? "day in a row" : "days in a row";

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--dashboard dashboard-hero">
        <div className="hero-copy dashboard-hero__copy">
          <h1 className="dashboard-hero__title">{snapshot.todayMission.title}</h1>
          <p className="dashboard-hero__meta">
            {formatTaskType(snapshot.todayMission.taskType)} •{" "}
            {snapshot.todayMission.estimatedMinutes} min • {todayMissionDate}
          </p>
          <div className="button-row">
            <Link
              href={`/mission/${snapshot.todayMission.id}`}
              className="button"
            >
              Open today&apos;s mission
            </Link>
            <Link href="/progress" className="button-secondary">
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
            <span className="stat-card__label">Streak</span>
            <strong>{snapshot.currentStreak}</strong>
            <p className="muted">{streakCaption}</p>
          </div>
        </div>
      </section>

      <SectionCard title="Current plan">
        <div className="task-list">
          {currentPlan.map(({ mission, metaText, isLocked, scheduledFor }) => (
            <div
              key={mission.id}
              className={`task-row${isLocked ? " task-row--locked" : ""}`}
            >
              <div className="task-row__meta">
                {isLocked ? (
                  <strong className="task-row__title-text">
                    Day {mission.dayNumber}: {mission.title}
                  </strong>
                ) : (
                  <Link
                    href={`/mission/${mission.id}`}
                    className="task-row__title-link"
                  >
                    Day {mission.dayNumber}: {mission.title}
                  </Link>
                )}
                <p className="task-row__schedule">{scheduledFor}</p>
                <p className="muted">{metaText}</p>
                {isLocked ? (
                  <p className="muted">Available on Day {mission.dayNumber}.</p>
                ) : null}
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                {isLocked ? (
                  <span className="button-ghost button-ghost--disabled">Locked</span>
                ) : (
                  <Link href={`/mission/${mission.id}`} className="button-ghost">
                    Open
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
