import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getProgressSnapshot } from "@/lib/data";
import { formatTaskType, percent } from "@/lib/utils";

export default async function ProgressPage() {
  const data = await getProgressSnapshot();

  if (!data) {
    return null;
  }

  const visibleMissionStates = data.snapshot.visibleMissionStates ?? [];
  const inProgress = visibleMissionStates.filter(
    ({ status }) => status === "attempted" || status === "solution_unlocked"
  );
  const completed = visibleMissionStates.filter(
    ({ status }) => status === "completed"
  );
  const weekMissionCount = data.snapshot.missions.filter(
    (mission) => mission.weekNumber === data.snapshot.currentWeek
  ).length;
  const weeklyCompletion = percent(
    data.snapshot.weeklyCompletedCount,
    weekMissionCount
  );

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--progress">
        <div className="progress-hero">
          <div className="hero-copy">
            <p className="eyebrow">Progress snapshot</p>
            <h1 className="app-page-title">Keep your daily progress visible.</h1>
            <p>
              A clean progress view makes it easier to keep going. Finish one task,
              see the movement, and come back tomorrow.
            </p>
          </div>
          <div className="progress-band">
            <div className="progress-band__top">
              <span className="eyebrow">This week</span>
              <strong>{weeklyCompletion}% complete</strong>
            </div>
            <div className="progress-bar">
              <span style={{ width: `${weeklyCompletion}%` }} />
            </div>
            <div className="progress-band__meta">
              <span>
                {data.snapshot.weeklyCompletedCount} of {weekMissionCount} missions
                done
              </span>
              <span>{inProgress.length} currently in motion</span>
            </div>
          </div>
        </div>
      </section>

      <SectionCard
        title="Progress overview"
        eyebrow={`Current week ${data.snapshot.currentWeek}`}
      >
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
          {inProgress.length ? inProgress.map(({ mission, status, score }) => (
            <div key={mission.id} className="task-row">
              <div className="task-row__meta">
                <strong className="task-row__title-text">
                  Day {mission.dayNumber}: {mission.title}
                </strong>
                <p className="muted">
                  {formatTaskType(mission.taskType)} • {mission.topic}
                  {typeof score === "number" ? ` • Score ${score}%` : ""}
                </p>
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
              </div>
            </div>
          )) : <p className="muted">No missions are in progress yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Completed" eyebrow="Done">
        <div className="task-list">
          {completed.length ? completed.map(({ mission, status, score }) => (
            <div key={mission.id} className="task-row">
              <div className="task-row__meta">
                <strong className="task-row__title-text">
                  Day {mission.dayNumber}: {mission.title}
                </strong>
                <p className="muted">
                  {formatTaskType(mission.taskType)}
                  {typeof score === "number" ? ` • Score ${score}%` : ""}
                </p>
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
              </div>
            </div>
          )) : <p className="muted">Completed missions will appear here.</p>}
        </div>
      </SectionCard>
    </div>
  );
}
