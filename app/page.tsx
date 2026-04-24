import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { buildRedirect } from "@/lib/utils";

const categoryChips = ["Aptitude", "DSA", "SQL", "HR", "Revision"];

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
            <p className="eyebrow">Placement prep workspace</p>
            <p className="marketing-header__meta">
              One focused hour daily. One clear task at a time.
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
          <div className="hero-chip-row">
            {categoryChips.map((chip) => (
              <span key={chip} className="hero-chip">
                {chip}
              </span>
            ))}
          </div>
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
      </section>
    </div>
  );
}
