import Link from "next/link";

import { SectionCard } from "@/components/section-card";
import { StatusBadge } from "@/components/status-badge";
import { getAdminDashboardSnapshot } from "@/lib/data";
import { formatTaskType, parseLocalDate, formatPlanDate } from "@/lib/utils";

function formatDateTime(value: string | null) {
  if (!value) {
    return "No recent activity";
  }

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatStudentPlan(user: {
  hasActivePlan: boolean;
  currentDay: number | null;
  totalDays: number | null;
  startDate: string | null;
}) {
  if (!user.hasActivePlan || !user.currentDay || !user.totalDays || !user.startDate) {
    return {
      label: "Not started",
      subtext: "Onboarding or active plan missing"
    };
  }

  return {
    label: `Day ${user.currentDay} / ${user.totalDays}`,
    subtext: `Started ${formatPlanDate(parseLocalDate(user.startDate))}`
  };
}

export default async function AdminOverviewPage() {
  const snapshot = await getAdminDashboardSnapshot();

  if (!snapshot.isAdmin) {
    return (
      <SectionCard title="Admin access required" eyebrow="Restricted">
        <p className="muted">
          Sign in with the configured admin account to view student-wide activity.
        </p>
      </SectionCard>
    );
  }

  return (
    <div className="stack">
      <section className="hero-panel app-hero app-hero--progress">
        <div className="progress-hero">
          <div className="hero-copy">
            <p className="eyebrow">Admin overview</p>
            <h1 className="app-page-title">All student activity, one clean view.</h1>
            <p>
              Track onboarding, current progress, recent work, and who needs attention
              across the live placement program.
            </p>
            <div className="focus-strip__meta">
              <span>{snapshot.activePlanName}</span>
              <span>{snapshot.activePlanDurationDays}-day active plan</span>
              <span>{snapshot.totalStudents} student accounts</span>
            </div>
          </div>
          <div className="button-row">
            <Link href="/admin/content" className="button-secondary">
              Manage content
            </Link>
            <Link href="/dashboard" className="button-ghost">
              Back to student app
            </Link>
          </div>
        </div>
      </section>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Students</span>
          <strong>{snapshot.totalStudents}</strong>
          <p className="muted">registered student accounts</p>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Onboarded</span>
          <strong>{snapshot.onboardedStudents}</strong>
          <p className="muted">active plans running</p>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Active today</span>
          <strong>{snapshot.activeTodayCount}</strong>
          <p className="muted">students with activity today</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-card">
          <span className="stat-card__label">Completed today</span>
          <strong>{snapshot.completedTodayCount}</strong>
          <p className="muted">tasks finished today</p>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Need onboarding</span>
          <strong>{snapshot.notStartedStudents}</strong>
          <p className="muted">accounts without an active plan</p>
        </div>
        <div className="stat-card">
          <span className="stat-card__label">Needs attention</span>
          <strong>{snapshot.needsAttentionCount}</strong>
          <p className="muted">inactive for a few days</p>
        </div>
      </div>

      <div className="split-panel">
        <SectionCard title="Recent activity" eyebrow="Latest student actions">
          <div className="table-like">
            {snapshot.recentActivity.length ? (
              snapshot.recentActivity.map((activity) => (
                <div key={activity.id} className="table-like__row">
                  <div className="stack" style={{ gap: "4px" }}>
                    <strong>{activity.fullName}</strong>
                    <p className="muted">
                      {activity.email}
                    </p>
                    <p className="muted">
                      {activity.dayNumber ? `Day ${activity.dayNumber} • ` : ""}
                      {activity.taskTitle}
                      {activity.taskType ? ` • ${formatTaskType(activity.taskType)}` : ""}
                    </p>
                  </div>
                  <div>
                    <StatusBadge
                      status={activity.status === "completed" ? "completed" : "attempted"}
                    />
                  </div>
                  <div className="muted">{formatDateTime(activity.occurredAt)}</div>
                </div>
              ))
            ) : (
              <p className="muted">Recent activity will appear here once students start using the app.</p>
            )}
          </div>
        </SectionCard>

        <SectionCard title="Program health" eyebrow="Quick checks">
          <div className="stack">
            <div className="callout">
              <h3>Average completion so far</h3>
              <strong>{snapshot.averageCompletionPercent}%</strong>
              <p className="muted">
                Calculated against the days that should already be available for onboarded students.
              </p>
            </div>
            <div className="summary-grid">
              {snapshot.taskCompletionMix.map((item) => (
                <div key={item.taskType} className="summary-tile callout">
                  <span className="eyebrow">{formatTaskType(item.taskType)}</span>
                  <strong>{item.completed}</strong>
                  <p className="muted">completed tasks</p>
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Students" eyebrow="All accounts at a glance">
        <div className="sample-grid">
          {snapshot.userOverview.length ? (
            snapshot.userOverview.map((user) => {
              const plan = formatStudentPlan(user);

              return (
                <div key={user.userId} className="sample-card">
                  <div className="sample-card__top">
                    <div className="stack" style={{ gap: "4px" }}>
                      <strong>{user.fullName}</strong>
                      <p className="muted">{user.email}</p>
                    </div>
                    <div className="pill-row">
                      <span className="pill">{plan.label}</span>
                      {user.needsAttention ? (
                        <span className="queue-status queue-status--locked">
                          Attention
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <p className="muted">{plan.subtext}</p>
                  <p className="muted">
                    {user.collegeName || "College not added"} • {user.targetRole}
                  </p>

                  <div className="focus-strip__meta">
                    <span>{user.completedCount} done</span>
                    <span>{user.inProgressCount} started</span>
                    <span>{user.completionPercent}% on track</span>
                  </div>

                  <div className="sample-card__foot">
                    <span>Last activity</span>
                    <span>{formatDateTime(user.lastActivityAt || user.lastSignInAt)}</span>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="muted">Student accounts will appear here once users sign up.</p>
          )}
        </div>
      </SectionCard>
    </div>
  );
}
