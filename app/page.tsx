import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { buildRedirect } from "@/lib/utils";

const heroGuide = [
  "Login",
  "Finish today's task",
  "Take notes",
  "Mark completed"
];

const mottoPoints = [
  "Placement prep feels confusing when there is too much to study and no clear starting point.",
  "This quick-start plan mixes aptitude, DSA, SQL, and HR into one simple daily routine.",
  "On low-motivation days, one small step is still far better than doing nothing.",
  "Keep showing up, build confidence slowly, and move step by step toward placement success."
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
        <Link href="/" className="brand-mark" data-loading-label="Opening home">
          <span className="brand-mark__dot" aria-hidden="true" />
          <span className="brand-mark__text">SamyakLabs.AI</span>
        </Link>
        <p className="marketing-header__meta">
          Placement prep with one focused hour every day.
        </p>
      </header>

      <section className="landing-cta">
        <div>
          <p className="eyebrow">Start here</p>
          <h2>Start your placement prep with one focused hour a day for 90 days.</h2>
          <p className="landing-cta__note">
            Log in, finish the daily task, take notes, and keep your momentum
            steady without overthinking what to study next.
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
            <p className="eyebrow">Daily flow</p>
            <h1 className="landing-hero__title">Login. Solve. Note. Complete.</h1>
            <div className="hero-guide">
              {heroGuide.map((step, index) => (
                <div key={step} className="hero-guide__item">
                  <span className="hero-guide__index">0{index + 1}</span>
                  <p>{step}</p>
                </div>
              ))}
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

          <div className="motto-panel">
            <p className="eyebrow">The Motto</p>
            <h2>When placement prep feels scattered, start small and stay consistent.</h2>
            <ul className="motto-list">
              {mottoPoints.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
    </div>
  );
}
