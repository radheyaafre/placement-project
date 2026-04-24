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

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--dashboard">
        <div className="dashboard-grid">
          <div className="hero-copy">
            <p className="eyebrow">
              {snapshot.currentDay} out of {snapshot.totalDays} days
            </p>
            <h1 style={{ fontSize: "4rem" }}>
              {snapshot.todayMission.title}
            </h1>
            <p>
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
            <div className="focus-strip">
              <span className="eyebrow">Today&apos;s focus</span>
              <strong>{snapshot.todayMission.topic}</strong>
              <div className="focus-strip__meta">
                <span>{snapshot.todayMission.estimatedMinutes} minute commitment</span>
                <span>
                  {snapshot.completedCount} of {snapshot.totalDays} days finished
                </span>
              </div>
            </div>
          </div>
          <div className="stack">
            <div className="stat-grid">
              <div className="stat-card">
                <span className="eyebrow">Progress</span>
                <strong>
                  {snapshot.completedCount}/{snapshot.totalDays}
                </strong>
                <p className="muted">days completed</p>
              </div>
              <div className="stat-card">
                <span className="eyebrow">Started</span>
                <strong>{snapshot.inProgressCount}</strong>
                <p className="muted">started but not finished</p>
              </div>
              <div className="stat-card">
                <span className="eyebrow">Streak</span>
                <strong>{snapshot.currentStreak}</strong>
                <p className="muted">days in a row</p>
              </div>
            </div>
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
