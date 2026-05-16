import type { Metadata } from "next";
import Link from "next/link";

import { getViewerContext } from "@/lib/auth";
import { getAuthLinkErrorMessage } from "@/lib/auth-link-messages";
import { getAppUrl } from "@/lib/env";
import { buildRedirect } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

function readParam(
  params: Record<string, string | string[] | undefined>,
  key: string
) {
  const value = params[key];
  return typeof value === "string" ? value : "";
}

const siteUrl = getAppUrl();

export const metadata: Metadata = {
  title: "Placement Preparation App in Nashik",
  description:
    "SamyakLabs.AI offers a placement preparation portal with weekly sprint-style guided practice for aptitude, DSA, SQL, HR, and revision, along with AI training, internships, and mentoring support.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SamyakLabs.AI | Placement Preparation App",
    description:
      "A weekly sprint-style placement preparation portal from SamyakLabs.AI for students in Nashik and beyond.",
    url: siteUrl
  }
};

export default async function HomePage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const viewer = await getViewerContext();
  const authLinkError = getAuthLinkErrorMessage({
    error: readParam(params, "error"),
    errorCode: readParam(params, "error_code"),
    errorDescription: readParam(params, "error_description")
  });
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
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "SamyakLabs.AI",
    url: siteUrl,
    description:
      "SamyakLabs.AI provides placement preparation, AI training, internships, mentoring, and student-focused learning support in Nashik and beyond.",
    areaServed: ["Nashik", "Maharashtra", "India"],
    sameAs: [siteUrl]
  };

  return (
    <div className="marketing-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      {authLinkError ? (
        <div className="notice marketing-inline-notice">
          <p style={{ margin: 0, fontWeight: 700 }}>That email link did not work.</p>
          <p style={{ margin: "8px 0 0", color: "var(--muted)" }}>{authLinkError}</p>
          <div className="hero-actions">
            <Link
              href="/forgot-password"
              className="button-secondary"
              data-loading-label="Opening forgot password"
            >
              Request new reset link
            </Link>
            <Link href="/login" className="button-ghost" data-loading-label="Opening login">
              Back to login
            </Link>
          </div>
        </div>
      ) : null}
      <header className="marketing-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark" data-loading-label="Opening home">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Placement prep portal</p>
            <p className="marketing-header__meta">
              Daily placement practice with a cleaner weekly sprint feel across
              aptitude, DSA, SQL, HR, and revision.
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
            <p className="eyebrow">Weekly placement sprint</p>
            <h1 className="landing-hero__title">
              Placement prep, sprint by sprint.
            </h1>
            <p className="landing-hero__summary">
              A simple daily practice portal that helps students stop overthinking
              what to study next and just begin.
            </p>
            <p className="landing-hero__flow">
              Login. Finish setup once. Open your current sprint. Complete one task at a time.
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
            <div className="hero-guide">
              <div className="hero-guide__item">
                <span className="hero-guide__index">01</span>
                <p>
                  Open the current sprint and start with the next unlocked task.
                </p>
              </div>
              <div className="hero-guide__item">
                <span className="hero-guide__index">02</span>
                <p>
                  Practice aptitude, DSA, SQL, HR, and revision in a guided order
                  that feels clear and manageable.
                </p>
              </div>
              <div className="hero-guide__item">
                <span className="hero-guide__index">03</span>
                <p>
                  Complete the sprint, then unlock the next one. Missed tasks stay
                  visible in Progress so nothing gets lost.
                </p>
              </div>
            </div>
          </div>

          <aside className="landing-sidecard">
            <p className="eyebrow">Why students need this</p>
            <h2 className="landing-sidecard__title">A calm structure for placement prep that usually feels messy.</h2>
            <div className="landing-sidecard__copy landing-sidecard__copy--story">
              <p className="landing-sidecard__lead">
                Too many resources, too many tabs, and still no clear starting point.
                That is where most students lose momentum.
              </p>
              <div className="landing-sidecard__section">
                <p className="landing-sidecard__section-title">What this portal does</p>
                <ul className="landing-sidecard__list">
                  <li>
                    It breaks placement prep into weekly sprints so the journey feels
                    smaller, clearer, and easier to follow.
                  </li>
                  <li>
                    It shows one task at a time inside the current sprint, so students
                    spend more time practicing and less time planning.
                  </li>
                  <li>
                    It keeps pending work visible in Progress, so skipped tasks can
                    still be completed later without confusion.
                  </li>
                </ul>
              </div>
              <p>
                This is a kickstart, not the full placement strategy. Students still
                need deeper study, projects, mock interviews, and serious practice
                outside the app.
              </p>
              <p>
                The goal is simple: reduce confusion, support consistency, and keep
                the next honest step visible.
              </p>
              <p>
                It is still in beta, so feedback matters. If something breaks, use
                Report a bug inside the app and we will keep improving it.
              </p>
              <p className="landing-sidecard__closing">
                Start small. Stay steady. Let each sprint build confidence.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
