import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getDashboardSnapshot } from "@/lib/data";
import { deriveMissionStatus } from "@/lib/plan";
import { formatPlanDate, parseLocalDate, shiftDays } from "@/lib/utils";
import type { MissionStatus } from "@/types/domain";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function getQueueState(status: MissionStatus) {
  switch (status) {
    case "completed":
      return { label: "Done", tone: "done" };
    case "missed":
      return { label: "Pending", tone: "missed" };
    case "attempted":
    case "solution_unlocked":
      return { label: "Started", tone: "started" };
    case "locked":
      return { label: "Locked", tone: "locked" };
    default:
      return { label: "Open", tone: "open" };
  }
}

export default async function DashboardPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const snapshot = await getDashboardSnapshot();
  const error = typeof params.error === "string" ? params.error : "";

  if (!snapshot) {
    return (
      <div className="stack">
        {error ? <div className="notice">{error}</div> : null}
        <SectionCard title="App unavailable" eyebrow="Live data required">
          <p>
            The live placement program is not available right now. This production
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
  const missedEarlierMissions = snapshot.visibleMissionStates
    .filter(
      ({ mission, status }) =>
        status === "missed" && mission.weekNumber < snapshot.currentWeek
    )
    .map(({ mission, status }) => ({
      mission,
      status,
      scheduledFor: formatPlanDate(shiftDays(planStartDate, mission.dayNumber - 1))
    }));
  const releasedDayCount = snapshot.completedCount + snapshot.pendingCount;
  const progressLabel = `${snapshot.completedCount}/${releasedDayCount}`;
  const pendingLabel = `${snapshot.pendingCount}/${releasedDayCount}`;
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
      {error ? <div className="notice">{error}</div> : null}
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

        <div className="stat-grid stat-grid--two dashboard-hero__stats">
          <div className="stat-card">
            <span className="stat-card__label">Progress</span>
            <strong>{progressLabel}</strong>
            <p className="muted">completed out of released days</p>
          </div>
          <div className="stat-card">
            <span className="stat-card__label">Pending</span>
            <strong>{pendingLabel}</strong>
            <p className="muted">pending out of released days</p>
          </div>
        </div>
      </section>

      {missedEarlierMissions.length ? (
        <SectionCard
          title="Pending from earlier days"
          eyebrow={`${missedEarlierMissions.length} missed`}
        >
          <div className="task-list">
            {missedEarlierMissions.map(({ mission, status, scheduledFor }) => {
              const queueState = getQueueState(status);

              return (
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
                    <p className="muted">{mission.estimatedMinutes} min</p>
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
      ) : null}

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
                className={`task-row task-row--interactive${
                  status === "completed" ? " task-row--completed" : ""
                }`}
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
