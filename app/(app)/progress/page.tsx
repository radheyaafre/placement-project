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
  const pendingItems = availableMissionStates.filter(
    ({ status }) => status !== "completed"
  );
  const completed = visibleMissionStates.filter(
    ({ status }) => status === "completed"
  );
  const completedSoFarCount = availableMissionStates.filter(
    ({ status }) => status === "completed"
  ).length;
  const availableMissionCount =
    availableMissionStates.length || Math.min(data.snapshot.currentDay, data.snapshot.totalDays);
  const pendingSoFarCount = data.snapshot.pendingCount;
  const planStartDate = parseLocalDate(data.snapshot.startDate);

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--progress">
        <div className="hero-copy">
          <p className="eyebrow">Progress</p>
          <h1 className="app-page-title">Your Progress</h1>
          <p>
            Day {data.snapshot.currentDay} of {data.snapshot.totalDays}. Completed and
            pending days from your 90-day plan.
          </p>
        </div>
      </section>

      <SectionCard
        title="Overview"
        eyebrow={`Day ${data.snapshot.currentDay} of ${data.snapshot.totalDays}`}
      >
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

      <SectionCard title="Pending" eyebrow="Pending for you">
        <div className="task-list">
          {pendingItems.length ? pendingItems.map(({ mission, status }) => (
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
                  {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
                </p>
              </div>
              <div className="pill-row">
                <StatusBadge taskType={mission.taskType} />
                <StatusBadge status={status} />
              </div>
            </Link>
          )) : <p className="muted">Nothing is pending right now.</p>}
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
                  {formatTaskType(mission.taskType)} • {mission.estimatedMinutes} min
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
