import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getProgressSnapshot } from "@/lib/data";
import { formatPlanDate, formatTaskType, parseLocalDate, percent, shiftDays } from "@/lib/utils";

export default async function ProgressPage() {
  const data = await getProgressSnapshot();

  if (!data) {
    return null;
  }

  const visibleMissionStates = data.snapshot.visibleMissionStates ?? [];
  const availableMissionStates = visibleMissionStates.filter(
    ({ mission }) => mission.dayNumber <= data.snapshot.currentDay
  );
  const inProgress = visibleMissionStates.filter(
    ({ status }) => status === "attempted" || status === "solution_unlocked"
  );
  const completed = visibleMissionStates.filter(
    ({ status }) => status === "completed"
  );
  const completedSoFarCount = availableMissionStates.filter(
    ({ status }) => status === "completed"
  ).length;
  const availableMissionCount =
    availableMissionStates.length || Math.min(data.snapshot.currentDay, data.snapshot.totalDays);
  const remainingFutureCount = Math.max(
    data.snapshot.totalDays - availableMissionCount,
    0
  );
  const planStartDate = parseLocalDate(data.snapshot.startDate);
  const overallCompletionSoFar = percent(
    completedSoFarCount,
    availableMissionCount
  );

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--progress">
        <div className="progress-hero">
          <div className="hero-copy">
            <p className="eyebrow">Progress snapshot</p>
            <h1 className="app-page-title">Keep your daily progress visible.</h1>
            <p>
              Track progress against the days that are already due, then let the
              future days unlock one by one.
            </p>
          </div>
          <div className="progress-band">
            <div className="progress-band__top">
              <span className="eyebrow">Overall completion so far</span>
              <strong>{overallCompletionSoFar}% complete</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${overallCompletionSoFar}%` }} />
            </div>
            <div className="progress-band__meta">
              <span>
                {completedSoFarCount} of {availableMissionCount} available days
                completed
              </span>
              <span>{remainingFutureCount} days yet to come</span>
            </div>
          </div>
        </div>
      </section>

      <SectionCard
        title="Progress overview"
        eyebrow={`Current week ${data.snapshot.currentWeek}`}
      >
        <div className="callout">
          <p>
            You are on day {data.snapshot.currentDay} of your {data.snapshot.totalDays}-day program.
            Till now you have finished {data.snapshot.completedCount} tasks and
            you have {data.snapshot.pendingCount} pending tasks.
          </p>
          <p className="muted">
            You can see the pending and completed tasks below.
          </p>
        </div>
        <div className="stat-grid">
          <div className="stat-card">
            <span className="eyebrow">Overall completion</span>
            <strong>{data.snapshot.completedCount}</strong>
            <p className="muted">missions marked complete</p>
          </div>
          <div className="stat-card">
            <span className="eyebrow">In progress</span>
            <strong>{data.snapshot.inProgressCount}</strong>
            <p className="muted">missions you started</p>
          </div>
          <div className="stat-card">
            <span className="eyebrow">Days in a row</span>
            <strong>{data.snapshot.currentStreak}</strong>
            <p className="muted">completed without skipping</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Continue where you left off" eyebrow="In progress">
        <div className="task-list">
          {inProgress.length ? inProgress.map(({ mission, status }) => (
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
                <p className="task-row__schedule">
                  {formatPlanDate(shiftDays(planStartDate, mission.dayNumber - 1))}
                </p>
                <p className="muted">
                  {formatTaskType(mission.taskType)} • {mission.topic}
                </p>
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
              </div>
            </Link>
          )) : <p className="muted">No missions are in progress yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Completed" eyebrow="Done">
        <div className="task-list">
          {completed.length ? completed.map(({ mission, status }) => (
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
                <p className="task-row__schedule">
                  {formatPlanDate(shiftDays(planStartDate, mission.dayNumber - 1))}
                </p>
                <p className="muted">
                  {formatTaskType(mission.taskType)}
                </p>
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
              </div>
            </Link>
          )) : <p className="muted">Completed missions will appear here.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
