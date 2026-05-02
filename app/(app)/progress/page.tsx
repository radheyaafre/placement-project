import Link from "next/link";
import { redirect } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getProgressSnapshot, getViewerStudentPlanState } from "@/lib/data";
import {
  buildRedirect,
  formatPlanDate,
  formatTaskType,
  parseLocalDate,
  percent,
  shiftDays
} from "@/lib/utils";

export default async function ProgressPage() {
  const data = await getProgressSnapshot();

  if (!data) {
    const planState = await getViewerStudentPlanState();

    if (planState === "missing") {
      redirect(
        buildRedirect("/onboarding", {
          error: "Complete onboarding once to start your 90-day plan."
        })
      );
    }

    return (
      <div className="stack">
        <SectionCard title="App unavailable" eyebrow="Live data required">
          <p>
            Progress is unavailable right now because the live placement program data
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

  const visibleMissionStates = data.snapshot.visibleMissionStates ?? [];
  const availableMissionStates = visibleMissionStates.filter(
    ({ mission }) => mission.dayNumber <= data.snapshot.currentDay
  );
  const inProgress = visibleMissionStates.filter(
    ({ status }) => status === "attempted" || status === "solution_unlocked"
  );
  const pending = availableMissionStates.filter(
    ({ status }) => status === "available" || status === "missed"
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
  const pendingSoFarCount = data.snapshot.pendingCount;
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
            <p className="eyebrow">Progress</p>
            <h1 className="app-page-title">Your Progress</h1>
            <p>
              Completed and pending days from your 90-day plan.
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
        <div className="stat-grid stat-grid--two">
          <div className="stat-card">
            <span className="eyebrow">Progress</span>
            <strong>{completedSoFarCount}/{availableMissionCount}</strong>
            <p className="muted">completed out of released days</p>
          </div>
          <div className="stat-card">
            <span className="eyebrow">Pending</span>
            <strong>{pendingSoFarCount}/{availableMissionCount}</strong>
            <p className="muted">pending out of released days</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Pending and missed" eyebrow="Pending for you">
        <div className="task-list">
          {pending.length ? pending.map(({ mission, status }) => (
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
          )) : <p className="muted">No pending days right now.</p>}
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
              className="task-row task-row--interactive task-row--completed"
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
