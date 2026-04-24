import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { buildRedirect } from "@/lib/utils";

const heroFlow = [
  {
    label: "Login",
    detail: "Open the workspace and see the next task immediately."
  },
  {
    label: "Finish daily task",
    detail: "Attempt first before you look at any explanation."
  },
  {
    label: "Take notes",
    detail: "Keep short notes so revision becomes easier later."
  },
  {
    label: "Mark completed",
    detail: "Close the day cleanly and let the next one unlock."
  }
];

const challengePoints = [
  "Placement prep gets messy when students have too many topics and no clear starting point.",
  "This app mixes aptitude, DSA, SQL, HR, and revision into one simple daily queue.",
  "On low-motivation days, a small completed step is still better than doing nothing.",
  "Consistency first. Confidence next. Better placement outcomes follow."
];

const queuePreview = [
  {
    day: "Day 1",
    title: "Percentages and Ratios Drill",
    meta: "Aptitude | 60 min",
    status: "Open"
  },
  {
    day: "Day 2",
    title: "Time, Speed and Distance",
    meta: "Aptitude | 60 min",
    status: "Locked"
  },
  {
    day: "Day 3",
    title: "Two Sum Pattern",
    meta: "DSA | 60 min",
    status: "Locked"
  },
  {
    day: "Day 4",
    title: "Second Highest Salary",
    meta: "SQL | 50 min",
    status: "Locked"
  }
];

const categoryChips = ["Aptitude", "DSA", "SQL", "HR", "Revision"];

const previewPrinciples = [
  "Students never wonder what to study next.",
  "Every day stays small enough to finish in one sitting.",
  "The dashboard shows motion without overwhelming analysis."
];

export default async function HomePage() {
  const viewer = await getViewerContext();
  const requiresLogin = viewer.mode === "supabase" && !viewer.userId;
  const dashboardHref = requiresLogin
    ? buildRedirect("/login", { next: "/dashboard" })
    : "/dashboard";

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark" data-loading-label="Opening home">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Placement prep workspace</p>
            <p className="marketing-header__meta">
              Daily placement practice with a cleaner, problem-first flow.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/login" className="button-ghost" data-loading-label="Opening login">
            Login
          </Link>
          <Link href="/signup" className="button" data-loading-label="Opening signup">
            Get Started
          </Link>
        </div>
      </header>

      <section className="landing-cta">
        <div>
          <p className="eyebrow">Start here</p>
          <h2>For placement prep, commit one focused hour a day for 90 days.</h2>
          <p className="landing-cta__note">
            A calm, guided queue for students who want to stay consistent without
            overplanning every study session.
          </p>
          <div className="landing-offer">
            <span className="landing-offer__price">
              <s>Rs 999</s>
            </span>
            <span className="landing-offer__badge">Free limited edition</span>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/signup" className="button" data-loading-label="Opening signup">
            Get Started
          </Link>
          <Link href="/login" className="button-ghost" data-loading-label="Opening login">
            I already have an account
          </Link>
        </div>
      </section>

      <section className="hero-panel landing-hero">
        <div className="hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Daily queue</p>
            <h1 className="landing-hero__title">
              Placement prep, only one focused hour daily for 90 days.
            </h1>
            <p>
              Students log in, get one clear task, attempt it honestly, take notes,
              and move forward without decision fatigue.
            </p>
            <div className="hero-chip-row">
              {categoryChips.map((chip) => (
                <span key={chip} className="hero-chip">
                  {chip}
                </span>
              ))}
            </div>
            <div className="landing-offer">
              <span className="landing-offer__price">
                <s>Rs 999</s>
              </span>
              <span className="landing-offer__badge">Free limited edition</span>
            </div>
            <div className="hero-actions">
              <Link href="/signup" className="button" data-loading-label="Opening signup">
                Get Started
              </Link>
              <Link
                href={dashboardHref}
                className="button-secondary"
                data-loading-label="Opening dashboard"
              >
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="hero-console">
            <div className="hero-console__header">
              <div>
                <p className="eyebrow">Week 1 queue</p>
                <strong>What the student sees</strong>
              </div>
              <span className="hero-console__badge">Day-by-day unlocks</span>
            </div>
            <div className="hero-console__list">
              {queuePreview.map((item) => (
                <div key={item.day} className="hero-console__row">
                  <div className="hero-console__meta">
                    <span className="hero-console__day">{item.day}</span>
                    <strong>{item.title}</strong>
                    <p>{item.meta}</p>
                  </div>
                  <span
                    className={
                      item.status === "Open"
                        ? "queue-status queue-status--open"
                        : "queue-status queue-status--locked"
                    }
                  >
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="landing-split">
        <div className="motto-panel">
          <p className="eyebrow">The challenge</p>
          <h2>Small daily effort beats last-minute stress.</h2>
          <ul className="motto-list">
            {challengePoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>

        <div className="section-card">
          <div className="section-card__header">
            <div>
              <p className="eyebrow">How students use it</p>
              <h2>Simple enough to repeat every day</h2>
            </div>
          </div>
          <div className="flow-grid">
            {heroFlow.map((step, index) => (
              <div key={step.label} className="flow-card">
                <span className="step-number">0{index + 1}</span>
                <strong>{step.label}</strong>
                <p className="muted">{step.detail}</p>
              </div>
            ))}
          </div>
          <ul className="challenge-list">
            {previewPrinciples.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  );
}
