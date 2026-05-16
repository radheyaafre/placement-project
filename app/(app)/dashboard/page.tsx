import Link from "next/link";
import { redirect } from "next/navigation";

import { SectionCard } from "@/components/section-card";
import { getDashboardSnapshot, getViewerStudentPlanState } from "@/lib/data";
import { buildRedirect, formatPlanDate, parseLocalDate, shiftDays } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function DashboardPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot();
  const error = typeof params.error === "string" ? params.error : "";
  const sprintCompletedNotice =
    typeof params.sprintCompleted === "string" ? params.sprintCompleted : "";

  if (!snapshot) {
    const planState = await getViewerStudentPlanState();

    if (planState === "missing") {
      redirect(
        buildRedirect("/onboarding", {
          error: "Complete onboarding once to start your placement sprint."
        })
      );
    }

    return (
      <div className="stack">
        {error ? <div className="notice">{error}</div> : null}
        <SectionCard title="App unavailable" eyebrow="Live data required">
          <p>
            The live placement content is not available right now. This production
            build does not fall back to sample tasks, so students only see real data.
          </p>
          <p className="muted">
            If you just created the account, complete onboarding first. If onboarding is
            already done, the Supabase plan content likely needs attention.
          </p>
          <div className="button-row">
            <Link href="/onboarding" className="button-secondary">
              Open onboarding
            </Link>
            <Link href="/report-bug" className="button-ghost">
              Report a bug
            </Link>
          </div>
        </SectionCard>
      </div>
    );
  }

  const dashboardSprintWeek = snapshot.hasFullAccess
    ? snapshot.currentWeek
    : snapshot.activeSprintWeek;
  const planStartDate = parseLocalDate(snapshot.startDate);
  const sprintMissions = snapshot.missions
    .filter((mission) => mission.weekNumber === dashboardSprintWeek)
    .sort((left, right) => left.dayNumber - right.dayNumber);
  const sprintFirstMission = sprintMissions[0];
  const sprintLastMission = sprintMissions[sprintMissions.length - 1];
  const sprintCompletedCount = sprintMissions.filter(
    (mission) => snapshot.progressByTaskId[mission.id]?.status === "completed"
  ).length;
  const sprintPendingCount = sprintMissions.length - sprintCompletedCount;
  const visibleSprintCount = new Set(
    snapshot.visibleMissionStates.map(({ mission }) => mission.weekNumber)
  ).size;
  const backlogCount = snapshot.visibleMissionStates.filter(
    ({ mission, status }) =>
      mission.weekNumber < dashboardSprintWeek && status !== "completed"
  ).length;
  const sprintDateRange =
    sprintFirstMission && sprintLastMission
      ? `${formatPlanDate(
          shiftDays(planStartDate, sprintFirstMission.dayNumber - 1)
        )} to ${formatPlanDate(
          shiftDays(planStartDate, sprintLastMission.dayNumber - 1)
        )}`
      : "Sprint dates unavailable";

  return (
    <div className="stack">
      {error ? <div className="notice">{error}</div> : null}
      {sprintCompletedNotice ? (
        <div className="notice notice--success">
          <strong>{sprintCompletedNotice}</strong>
        </div>
      ) : null}
      <SectionCard
        title={`Sprint ${dashboardSprintWeek}`}
        eyebrow="Current sprint"
        aside={<span className="pill">{sprintDateRange}</span>}
      >
        <Link
          href={`/sprint/${dashboardSprintWeek}`}
          className="sprint-card sprint-card--interactive"
          data-loading-label={`Opening Sprint ${dashboardSprintWeek}`}
        >
          <div className="sprint-card__copy">
            <strong className="sprint-card__title">
              Open Sprint {dashboardSprintWeek}
            </strong>
            <p className="muted">
              {sprintCompletedCount} of {sprintMissions.length} tasks completed in this sprint.
            </p>
            <p className="muted">
              {sprintPendingCount === 0
                ? "This sprint is complete. The next sprint will unlock for the student automatically."
                : `${sprintPendingCount} task${sprintPendingCount === 1 ? "" : "s"} still pending in this sprint.`}
            </p>
            <p>
              Finish one sprint and unlock the next sprint.
            </p>
            <div className="progress-bar" aria-hidden="true">
              <span
                style={{
                  width: `${sprintMissions.length ? (sprintCompletedCount / sprintMissions.length) * 100 : 0}%`
                }}
              />
            </div>
          </div>
          <div className="sprint-card__meta">
            <span className="queue-status queue-status--open">
              {sprintMissions.length} tasks
            </span>
            <span className="queue-status queue-status--done">
              {sprintCompletedCount} done
            </span>
            <span className="queue-status queue-status--started">
              {sprintPendingCount} open
            </span>
          </div>
        </Link>
      </SectionCard>

      {backlogCount > 0 ? (
        <SectionCard title="Pending from earlier sprints" eyebrow="Catch up">
          <p className="muted">
            You still have {backlogCount} pending task
            {backlogCount === 1 ? "" : "s"} from earlier unlocked sprints.
          </p>
          <div className="button-row">
            <Link
              href="/progress"
              className="button-secondary"
              data-loading-label="Opening sprint progress"
            >
              Open progress
            </Link>
          </div>
        </SectionCard>
      ) : null}

      {visibleSprintCount > 1 ? (
        <SectionCard title="How can you see past progress?">
          <p className="muted">
            Completed sprint history and earlier progress remain available in{" "}
            <Link
              href="/progress"
              className="text-link"
              data-loading-label="Opening progress"
            >
              Progress
            </Link>
            .
          </p>
        </SectionCard>
      ) : null}

    </div>
  );
}
