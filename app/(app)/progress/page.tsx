import Link from "next/link";
import { redirect } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getProgressSnapshot, getViewerStudentPlanState } from "@/lib/data";
import { formatPlanDate, formatTaskType, parseLocalDate, shiftDays } from "@/lib/utils";

export default async function ProgressPage() {
  const data = await getProgressSnapshot();

  if (!data) {
    const planState = await getViewerStudentPlanState();

    if (planState === "missing") {
      redirect("/onboarding?error=Complete%20onboarding%20once%20to%20start%20your%20placement%20sprint.");
    }

    return (
      <div className="stack">
        <SectionCard title="App unavailable" eyebrow="Live data required">
          <p>
            Progress is unavailable right now because the live placement content
            is not ready.
          </p>
          <p className="muted">
            This production build does not fall back to sample tasks. Complete onboarding
            if your account is new, or check the published Supabase plan content.
          </p>
          <div className="button-row">
            <Link href="/dashboard" className="button-secondary">
              Back to dashboard
            </Link>
            <Link href="/report-bug" className="button-ghost">
              Report a bug
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  const snapshot = data.snapshot;
  const planStartDate = parseLocalDate(snapshot.startDate);
  const visibleWeeks = Array.from(
    new Set(
      snapshot.visibleMissionStates
        .map(({ mission }) => mission.weekNumber)
        .sort((left, right) => left - right)
    )
  );
  const sprintCards = visibleWeeks.map((weekNumber) => {
    const sprintStates = snapshot.visibleMissionStates.filter(
      ({ mission }) => mission.weekNumber === weekNumber
    );
    const planned = sprintStates.length;
    const completed = sprintStates.filter(({ status }) => status === "completed").length;
    const pending = planned - completed;
    const isCurrent = weekNumber === snapshot.activeSprintWeek;
    const completedDates = sprintStates
      .map(({ mission }) => snapshot.progressByTaskId[mission.id]?.completedAt)
      .filter((value): value is string => Boolean(value))
      .sort();

    return {
      weekNumber,
      planned,
      completed,
      pending,
      isCurrent,
      isComplete: planned > 0 && pending === 0,
      completedOn:
        planned > 0 && pending === 0 && completedDates.length
          ? formatPlanDate(new Date(completedDates[completedDates.length - 1]))
          : null
    };
  });
  const completedSprintCount = sprintCards.filter((sprint) => sprint.isComplete).length;
  const currentSprint = sprintCards.find((sprint) => sprint.isCurrent) || sprintCards[0] || null;
  const completedSprints = sprintCards.filter(
    (sprint) => sprint.isComplete && !sprint.isCurrent
  );
  const pendingStates = snapshot.visibleMissionStates.filter(
    ({ mission, status }) =>
      status === "attempted" ||
      status === "solution_unlocked" ||
      status === "missed" ||
      (mission.weekNumber < snapshot.activeSprintWeek && status === "available")
  );

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--progress">
        <div className="hero-copy">
          <p className="eyebrow">Progress</p>
          <h1 className="app-page-title">Your Progress</h1>
          <div className="callout">
            <p>
              You have completed <strong>{completedSprintCount}</strong> sprint
              {completedSprintCount === 1 ? "" : "s"}, finished{" "}
              <strong>{snapshot.completedCount}</strong> total task
              {snapshot.completedCount === 1 ? "" : "s"}, and you are now in{" "}
              <strong>Sprint {snapshot.activeSprintWeek}</strong>.
            </p>
          </div>
        </div>
      </section>

      {currentSprint ? (
        <SectionCard title={`Sprint ${currentSprint.weekNumber}`} eyebrow="Current sprint">
          <Link
            href={`/sprint/${currentSprint.weekNumber}`}
            className={`sprint-card sprint-card--interactive${
              currentSprint.isComplete ? " sprint-card--complete" : ""
            } sprint-card--current`}
            data-loading-label={`Opening Sprint ${currentSprint.weekNumber}`}
          >
            <div className="sprint-card__copy">
              <strong className="sprint-card__title">
                Continue Sprint {currentSprint.weekNumber}
              </strong>
              <p className="muted">
                {currentSprint.completed}/{currentSprint.planned} tasks completed
              </p>
              <div className="progress-bar" aria-hidden="true">
                <span
                  style={{
                    width: `${currentSprint.planned ? (currentSprint.completed / currentSprint.planned) * 100 : 0}%`
                  }}
                />
              </div>
              <p className="muted">
                {currentSprint.pending === 0
                  ? "Current sprint completed."
                  : `${currentSprint.pending} task${currentSprint.pending === 1 ? "" : "s"} still pending.`}
              </p>
            </div>
            <div className="sprint-card__meta">
              <span className="queue-status queue-status--started">Current</span>
            </div>
          </Link>
        </SectionCard>
      ) : null}

      {completedSprints.length ? (
        <SectionCard title="Completed sprints" eyebrow="Finished">
          <div className="sprint-grid">
            {completedSprints.map((sprint) => (
              <Link
                key={sprint.weekNumber}
                href={`/sprint/${sprint.weekNumber}`}
                className="sprint-card sprint-card--interactive sprint-card--complete"
                data-loading-label={`Opening Sprint ${sprint.weekNumber}`}
              >
                <div className="sprint-card__copy">
                  <strong className="sprint-card__title">Sprint {sprint.weekNumber}</strong>
                  <p className="muted">{sprint.completed}/{sprint.planned} tasks completed</p>
                  <p className="muted">
                    {sprint.completedOn
                      ? `Completed on ${sprint.completedOn}`
                      : "Completed"}
                  </p>
                </div>
                <div className="sprint-card__meta">
                  <span className="queue-status queue-status--done">Completed</span>
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      ) : null}

      <SectionCard title="Earlier pending work" eyebrow="Catch up">
        <div className="task-list">
          {pendingStates.length ? (
            pendingStates.map(({ mission, status }) => (
              <Link
                key={mission.id}
                href={`/mission/${mission.id}`}
                className="task-row task-row--interactive"
                data-loading-label={`Opening Day ${mission.dayNumber}`}
              >
                <div className="task-row__meta">
                  <strong className="task-row__title-text">
                    Sprint {mission.weekNumber} • Day {mission.dayNumber}: {mission.title}
                  </strong>
                  <p className="task-row__schedule">
                    {formatPlanDate(shiftDays(planStartDate, mission.dayNumber - 1))}
                  </p>
                  <p className="muted">
                    {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
                  </p>
                </div>
                <div className="pill-row">
                  <StatusBadge taskType={mission.taskType} />
                  <StatusBadge status={status} />
                </div>
              </Link>
            ))
          ) : (
            <p className="muted">No pending work right now.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
