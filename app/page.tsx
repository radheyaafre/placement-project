import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import { getViewerContext } from "@/lib/auth";
import { demoMissions } from "@/lib/sample-data";
import { buildRedirect } from "@/lib/utils";

const weekOnePreview = demoMissions.slice(0, 7);

const steps = [
  {
    title: "Open today's mission",
    body: "Students log in and see one clear task for the day instead of a huge plan."
  },
  {
    title: "Attempt before solution",
    body: "They think first, answer honestly, and only then unlock the explanation."
  },
  {
    title: "Track daily progress",
    body: "Completed work, in-progress tasks, and streaks make momentum easy to notice."
  }
];

const supportPoints = [
  "One mission per day instead of a giant checklist.",
  "Balanced practice across aptitude, DSA, SQL, HR, and revision.",
  "A calm progress view that shows what to continue and what is done.",
  "Weekly reminders that bring students back before momentum drops."
];

const heroGuide = [
  "Create your account and choose the reminder time that fits your routine.",
  "Open the dashboard each day and start the mission shown for that day.",
  "Attempt every question or prompt honestly before checking the solution.",
  "Review the explanation, compare your thinking, and learn what to improve.",
  "Mark the task complete so your streak and weekly progress keep moving.",
  "Come back tomorrow for the next focused one-hour session."
];

export default async function HomePage() {
  const viewer = await getViewerContext();
  const requiresLogin = viewer.mode === "supabase" && !viewer.userId;
  const dashboardHref = requiresLogin
    ? buildRedirect("/login", { next: "/dashboard" })
    : "/dashboard";
  const getMissionHref = (taskId: string) =>
    requiresLogin
      ? buildRedirect("/login", { next: `/preview/${taskId}` })
      : `/preview/${taskId}`;

  return (
    <div className="marketing-shell">
      <section className="landing-cta">
        <div>
          <p className="eyebrow">Ready to start</p>
          <h2>Build the habit before placement season gets stressful.</h2>
        </div>
        <div className="hero-actions">
          <Link href="/signup" className="button">
            Get Started
          </Link>
          <Link href="/login" className="button-ghost">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="hero-panel landing-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">How students use it</p>
            <h1 className="landing-hero__title">Use the app in 6 simple steps.</h1>
            <div className="hero-guide">
              {heroGuide.map((step, index) => (
                <div key={step} className="hero-guide__item">
                  <span className="hero-guide__index">0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
            </div>
            <div className="hero-actions">
              <Link href="/signup" className="button">
                Get Started
              </Link>
              <Link href={dashboardHref} className="button-secondary">
                Open Dashboard
              </Link>
            </div>
            <div className="pill-row">
              <span className="pill">Aptitude</span>
              <span className="pill">DSA</span>
              <span className="pill">SQL</span>
              <span className="pill">HR</span>
              <span className="pill">Weekly reminders</span>
            </div>
          </div>

          <div className="motto-panel">
            <p className="eyebrow">The Motto</p>
            <h2>Show up. Attempt first. Learn honestly. Repeat tomorrow.</h2>
            <p className="muted">
              This is built for consistency, not overwhelm. Students always know
              where to start, what to finish, and what progress they made.
            </p>

            <div className="method-list">
              <div className="method-step">
                <span className="method-step__index">01</span>
                <div>
                  <strong>Get today&apos;s task</strong>
                  <p className="muted">No planning overload. Just a clear start.</p>
                </div>
              </div>
              <div className="method-step">
                <span className="method-step__index">02</span>
                <div>
                  <strong>Attempt before solution</strong>
                  <p className="muted">Students think first, then compare and learn.</p>
                </div>
              </div>
              <div className="method-step">
                <span className="method-step__index">03</span>
                <div>
                  <strong>Mark it done</strong>
                  <p className="muted">Small wins turn into rhythm and confidence.</p>
                </div>
              </div>
            </div>

            <div className="hero-metrics">
              <div className="hero-metric">
                <strong>90</strong>
                <span>day journey</span>
              </div>
              <div className="hero-metric">
                <strong>1</strong>
                <span>mission a day</span>
              </div>
              <div className="hero-metric">
                <strong>60</strong>
                <span>minutes of focus</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">How it works</p>
              <h2>Simple enough to follow even on low-motivation days.</h2>
            </div>
          </div>
          <div className="steps-grid">
            {steps.map((step, index) => (
              <div key={step.title} className="step-card">
                <span className="step-number">0{index + 1}</span>
                <h3>{step.title}</h3>
                <p className="muted">{step.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="stack">
          <div className="section-card">
            <div className="section-card__header">
              <div>
                <p className="eyebrow">Why students stick</p>
                <h2>It feels calm, not cluttered.</h2>
              </div>
            </div>
            <ul className="value-list">
              {supportPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>

          <div className="landing-banner">
            <p className="eyebrow">Built around consistency</p>
            <h3>Small daily wins become placement confidence.</h3>
            <p className="muted">
              The goal is not to push students into longer study hours. The goal is
              to make it easier for them to keep showing up.
            </p>
          </div>
        </div>
      </section>

      <section className="section-card">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">Week one preview</p>
            <h2>A balanced first week students can actually follow.</h2>
          </div>
        </div>
        <div className="sample-grid">
          {weekOnePreview.map((mission) => (
            <Link
              href={getMissionHref(mission.id)}
              key={mission.id}
              className="sample-card"
            >
              <div className="sample-card__top">
                <span className="pill">Day {mission.dayNumber}</span>
                <StatusBadge taskType={mission.taskType} />
              </div>
              <strong>{mission.title}</strong>
              <p className="muted">{mission.topic}</p>
              <div className="sample-card__foot">
                <span>{mission.estimatedMinutes} min</span>
                <span>Preview task</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
