import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSnapshot } from "@/lib/data";
import { deriveMissionStatus } from "@/lib/plan";
import { formatTaskType, percent } from "@/lib/utils";

export default async function DashboardPage() {
  const snapshot = await getDashboardSnapshot();

  if (!snapshot) {
    return null;
  }

  const weekMissionCount = snapshot.missions.filter(
    (mission) => mission.weekNumber === snapshot.currentWeek
  ).length;
  const weekCompletion = percent(snapshot.weeklyCompletedCount, weekMissionCount);
  const remainingThisWeek = Math.max(
    weekMissionCount - snapshot.weeklyCompletedCount,
    0
  );
  const weekPlan = snapshot.missions
    .filter((mission) => mission.weekNumber === snapshot.currentWeek)
    .map((mission) => {
      const progress = snapshot.progressByTaskId[mission.id] || null;
      const status = deriveMissionStatus(mission, snapshot.currentDay, progress);

      return {
        mission,
        status,
        score: progress?.score ?? null,
        isLocked: status === "locked"
      };
    });

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--dashboard">
        <div className="dashboard-grid">
          <div className="hero-copy">
            <p className="eyebrow">Day {snapshot.currentDay} of {snapshot.totalDays}</p>
            <h1 style={{ fontSize: "4rem" }}>
              {snapshot.todayMission.title}
            </h1>
            <p>
              {formatTaskType(snapshot.todayMission.taskType)} •{" "}
              {snapshot.todayMission.estimatedMinutes} min
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
                <span>{weekCompletion}% of this week finished</span>
              </div>
            </div>
          </div>
          <div className="stack">
            <div className="stat-grid">
              <div className="stat-card">
                <span className="eyebrow">Completed</span>
                <strong>{snapshot.completedCount}</strong>
                <p className="muted">missions finished</p>
              </div>
              <div className="stat-card">
                <span className="eyebrow">In progress</span>
                <strong>{snapshot.inProgressCount}</strong>
                <p className="muted">attempted but not completed</p>
              </div>
              <div className="stat-card">
                <span className="eyebrow">Streak</span>
                <strong>{snapshot.currentStreak}</strong>
                <p className="muted">days in a row</p>
              </div>
            </div>
            <div className="mini-metric-grid">
              <div className="mini-metric">
                <span className="eyebrow">This week</span>
                <strong>
                  {snapshot.weeklyCompletedCount}/{weekMissionCount}
                </strong>
                <p className="muted">missions completed</p>
              </div>
              <div className="mini-metric">
                <span className="eyebrow">Remaining</span>
                <strong>{remainingThisWeek}</strong>
                <p className="muted">missions left this week</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SectionCard title="This week&apos;s tasks" eyebrow={`Week ${snapshot.currentWeek}`}>
        <div className="task-list">
          {weekPlan.map(({ mission, status, score, isLocked }) => (
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
                <p className="muted">
                  {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
                  {typeof score === "number" ? ` • Score ${score}%` : ""}
                </p>
                {isLocked ? (
                  <p className="muted">
                    Unlocks when you reach Day {mission.dayNumber}.
                  </p>
                ) : null}
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
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
