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
    "SamyakLabs.AI offers a 90-day placement preparation app for aptitude, DSA, SQL, HR, and revision, along with public SEO support for AI training, internships, and mentoring.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SamyakLabs.AI | Placement Preparation App",
    description:
      "A 90-day guided placement preparation app from SamyakLabs.AI for students in Nashik and beyond.",
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
              Login. Complete setup once. Finish daily task. Mark completed.
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
            <p className="eyebrow">Why this exists</p>
            <h2 className="landing-sidecard__title">A free 90-day kickstart for placement prep.</h2>
            <div className="landing-sidecard__copy landing-sidecard__copy--story">
              <p className="landing-sidecard__lead">
                Let's be real. Too many resources, too many tabs, and still too
                much confusion. Add distractions and inconsistency, and it becomes
                easy to lose track. Even 30 to 40 minutes of focused work every day
                can make a real difference.
              </p>
              <p>
                To make the start easier, this free 90-day program is built to help
                you begin and stay consistent. Starting at least 6 months before
                placements is ideal, but if you have not started yet, this is still
                a good time to begin.
              </p>
              <div className="landing-sidecard__section">
                <p className="landing-sidecard__section-title">How it works</p>
                <ul className="landing-sidecard__list">
                  <li>
                    After login, you complete one short setup form once so your
                    90-day plan can begin from your own start date.
                  </li>
                  <li>
                    Once setup is saved, the dashboard becomes your home and shows
                    one clear task at a time across aptitude, DSA, SQL, HR, and more.
                  </li>
                  <li>
                    Finish today's task, and the next day unlocks after that while
                    your progress stays visible.
                  </li>
                </ul>
              </div>
              <p>
                This is not the full placement journey by itself. You will still
                need deeper study, projects, and serious practice outside the app.
                Think of this as a kickstart that reduces confusion and makes the
                next step clearer.
              </p>
              <p>
                The app does not judge or rate your skills. It is here to support
                your self-study, help you stay steady, and let you prepare at your
                own pace.
              </p>
              <p>
                This is a beta version, so if something breaks, use Report a bug in
                the app or mail me directly. Feedback and suggestions are always
                welcome.
              </p>
              <p className="landing-sidecard__closing">
                All the best. Stay consistent and go get that offer.
              </p>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}
