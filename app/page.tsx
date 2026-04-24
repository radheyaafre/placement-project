import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { buildRedirect } from "@/lib/utils";

export default async function HomePage() {
  const viewer = await getViewerContext();
  const requiresLogin = viewer.mode === "supabase" && !viewer.userId;
  const dashboardHref = requiresLogin
    ? buildRedirect("/login", { next: "/dashboard" })
    : "/dashboard";
  const secondaryHref =
    viewer.mode === "supabase" && !viewer.userId ? "/login" : dashboardHref;
  const secondaryLabel =
    viewer.mode === "supabase" && !viewer.userId
      ? "I already have an account"
      : "Open Dashboard";

  return (
    <div className="marketing-shell">
      <header className="marketing-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark" data-loading-label="Opening home">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">90-day placement prep app</p>
            <p className="marketing-header__meta">
              Students get one clear daily task across aptitude, DSA, SQL, HR,
              and revision so placement prep stays consistent and manageable.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/signup" className="button" data-loading-label="Opening signup">
            Get Started
          </Link>
          <Link href="/login" className="button-ghost" data-loading-label="Opening login">
            Login
          </Link>
        </div>
      </header>

      <section className="hero-panel landing-hero landing-hero--simple">
        <div className="hero-grid home-hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">Placement prep</p>
            <h1 className="landing-hero__title">
              One focused hour daily for 90 days.
            </h1>
            <p className="landing-hero__summary">
              A simple daily practice app for students preparing for placements
              across aptitude, DSA, SQL, HR, and revision.
            </p>
            <p className="landing-hero__flow">
              Login. Finish daily task. Take notes. Mark completed.
            </p>
            <div className="hero-actions">
              <Link href="/signup" className="button" data-loading-label="Opening signup">
                Get Started
              </Link>
              <Link
                href={secondaryHref}
                className="button-secondary"
                data-loading-label={
                  secondaryLabel === "Open Dashboard"
                    ? "Opening dashboard"
                    : "Opening login"
                }
              >
                {secondaryLabel}
              </Link>
            </div>
          </div>

          <aside className="landing-sidecard">
            <p className="eyebrow">How it works</p>
            <h2 className="landing-sidecard__title">A simple kickstart for daily placement prep.</h2>
            <div className="landing-sidecard__copy">
              <p>You get one simple task each day for 90 days.</p>
              <p>Finish today&apos;s task and the next day unlocks after that.</p>
              <p>Progress stays visible, so small daily wins keep adding up.</p>
              <p>
                This is a beta support tool. It gives clarity and momentum, but you
                still need deeper study, projects, and serious practice outside it.
              </p>
              <p>
                The app does not judge your skill level. It just helps you study at
                your own pace and keep moving.
              </p>
              <p>If something breaks, use Report a bug in the app or mail me directly.</p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
