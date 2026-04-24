import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { buildRedirect } from "@/lib/utils";

const heroGuide = [
  "Login",
  "Finish today's task",
  "Take notes",
  "Mark completed"
];

export default async function HomePage() {
  const viewer = await getViewerContext();
  const requiresLogin = viewer.mode === "supabase" && !viewer.userId;
  const dashboardHref = requiresLogin
    ? buildRedirect("/login", { next: "/dashboard" })
    : "/dashboard";

  return (
    <div className="marketing-shell">
      <section className="landing-cta">
        <div>
          <p className="eyebrow">Start here</p>
          <h2>One hour daily for 90 days.</h2>
          <div className="landing-offer">
            <span className="landing-offer__price">
              <s>Rs 999</s>
            </span>
            <span className="landing-offer__badge">Free limited edition</span>
          </div>
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
              <Link href="/signup" className="button">
                Get Started
              </Link>
              <Link href={dashboardHref} className="button-secondary">
                Open Dashboard
              </Link>
            </div>
          </div>

          <div className="motto-panel">
            <p className="eyebrow">The Motto</p>
            <h2>Small daily effort beats last-minute stress.</h2>
            <p className="muted">
              Login. Finish one task. Take notes. Mark it complete.
            </p>
            <p className="muted">
              The app stays clear and focused so students can build consistency
              across aptitude, DSA, SQL, HR, and revision.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
