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
  title: "Placement Preparation, AI Training, Mentoring, and Internships in Nashik",
  description:
    "SamyakLabs.AI offers a placement preparation app, AI training in Nashik and virtual mode, GenAI training, diploma and degree classes, 1:1 mentoring, Codex support, AI-based development guidance, and internship-focused learning support.",
  alternates: {
    canonical: "/"
  },
  openGraph: {
    title: "SamyakLabs.AI | Placement Prep, AI Training, and Internships",
    description:
      "Explore placement preparation, AI training, GenAI training, mentoring, and internship-focused student programs from SamyakLabs.AI.",
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
      "SamyakLabs.AI provides placement preparation, AI training, GenAI training, diploma and degree classes, 1:1 mentoring, Codex guidance, AI-based development support, and internship-oriented programs for students in Nashik and beyond.",
    areaServed: ["Nashik", "Maharashtra", "India"],
    sameAs: [siteUrl]
  };
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SamyakLabs.AI",
    url: siteUrl
  };

  return (
    <div className="marketing-shell public-shell">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema)
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema)
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

      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark" data-loading-label="Opening home">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Placement prep, AI training, and internship support</p>
            <p className="marketing-header__meta">
              A practical student-focused platform for placement preparation, AI
              learning, and internship-oriented growth in Nashik and online.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/about" className="button-ghost">
            About
          </Link>
          <Link href="/internships" className="button-ghost">
            Internships
          </Link>
          <Link href="/ai-training" className="button-ghost">
            AI Training
          </Link>
          <Link href="/services" className="button-ghost">
            Services
          </Link>
          <Link href={dashboardHref} className="button" data-loading-label="Opening portal">
            Placement Portal
          </Link>
        </div>
      </header>

      <section className="hero-panel landing-hero landing-hero--simple">
        <div className="hero-grid home-hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">SamyakLabs.AI</p>
            <h1 className="landing-hero__title public-hero__title">
              Placement preparation, AI training, mentoring, and internship support for students.
            </h1>
            <p className="landing-hero__summary">
              If you are looking for a placement preparation app, AI training in Nashik,
              virtual AI learning, GenAI training, diploma or degree classes, 1:1 mentoring,
              Codex support, or AI-based development guidance, SamyakLabs.AI is building
              practical systems to help students move with more clarity.
            </p>
            <p className="landing-hero__flow">
              Start with the placement portal. Explore internships. Learn AI through guided practice and mentoring.
            </p>
            <div className="hero-actions">
              <Link href="/placement-prep" className="button">
                Explore placement prep
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
            <p className="eyebrow">What students search for</p>
            <h2 className="landing-sidecard__title">
              Structured support instead of scattered preparation.
            </h2>
            <div className="landing-sidecard__copy landing-sidecard__copy--story">
              <p className="landing-sidecard__lead">
                Students in Nashik often search for the best placement preparation app,
                AI internships, AI training, and internship opportunities for diploma
                or degree programs. Most of the time, the real need is clarity,
                consistency, and practical exposure.
              </p>
              <div className="landing-sidecard__section">
                <p className="landing-sidecard__section-title">Our current focus</p>
                <ul className="landing-sidecard__list">
                  <li>90-day placement preparation through one clear task per day.</li>
                  <li>AI training, GenAI training, and AI-based development guidance.</li>
                  <li>Diploma classes, degree classes, and 1:1 mentoring support.</li>
                  <li>Internship-oriented exposure for diploma and degree students.</li>
                  <li>Useful guidance for students around Nashik, including KKW-area searches.</li>
                </ul>
              </div>
              <p>
                We are building toward a practical student ecosystem where placement prep,
                analytics thinking, AI skills, and hands-on learning reinforce each other.
              </p>
            </div>
          </aside>
        </div>
      </section>

      <section className="section-card public-section">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">Public pages</p>
            <h2>Explore what SamyakLabs.AI offers</h2>
          </div>
        </div>
        <div className="public-grid">
          <Link href="/about" className="public-card" data-loading-label="Opening about">
            <p className="public-card__tag">About</p>
            <h3>About SamyakLabs.AI</h3>
            <p>See what we do across AI, analytics, internships, and student support.</p>
          </Link>
          <Link
            href="/internships"
            className="public-card"
            data-loading-label="Opening internships"
          >
            <p className="public-card__tag">Internships</p>
            <h3>Internships in Nashik and beyond</h3>
            <p>Learn how we position internship-oriented support for diploma and degree students.</p>
          </Link>
          <Link
            href="/ai-training"
            className="public-card"
            data-loading-label="Opening AI training"
          >
            <p className="public-card__tag">AI Training</p>
            <h3>AI training, GenAI, and AI development</h3>
            <p>Explore how students can begin AI learning, Codex support, and practical AI-based development.</p>
          </Link>
          <Link
            href="/services"
            className="public-card"
            data-loading-label="Opening services"
          >
            <p className="public-card__tag">Services</p>
            <h3>Diploma classes, degree classes, and 1:1 mentoring</h3>
            <p>See how SamyakLabs.AI is positioning guided classes and mentoring support for students.</p>
          </Link>
          <Link href="/placement-prep" className="public-card" data-loading-label="Opening placement prep">
            <p className="public-card__tag">Placement Prep</p>
            <h3>Placement preparation app</h3>
            <p>See how the 90-day portal helps students stay consistent for placements.</p>
          </Link>
        </div>
      </section>

      <section className="section-card public-section">
        <div className="section-card__header">
          <div>
            <p className="eyebrow">FAQ</p>
            <h2>Questions students may search online</h2>
          </div>
        </div>
        <div className="stack">
          <div className="callout">
            <h3>Is this a placement preparation app for students in Nashik?</h3>
            <p className="muted">
              Yes. SamyakLabs.AI is building a placement preparation app that students in
              Nashik can use for daily guided practice across aptitude, DSA, SQL, HR, and revision.
            </p>
          </div>
          <div className="callout">
            <h3>Do you support AI training in Nashik and virtual AI training?</h3>
            <p className="muted">
              Yes. We are positioning SamyakLabs.AI as a student-focused platform for AI
              learning, with scope for Nashik-based AI training, virtual AI training, GenAI guidance,
              and practical AI-based development support.
            </p>
          </div>
          <div className="callout">
            <h3>Do you also support diploma classes, degree classes, and 1:1 mentoring?</h3>
            <p className="muted">
              Yes. The public SEO content now also positions SamyakLabs.AI around diploma classes,
              degree classes, and 1:1 mentoring so students can discover the platform through those needs too.
            </p>
          </div>
          <div className="callout">
            <h3>Can diploma and degree students look at internships here?</h3>
            <p className="muted">
              Yes. The public internships page is written for diploma and degree students,
              including people searching for internship opportunities around Nashik and KKW-related areas.
            </p>
          </div>
          <div className="callout">
            <h3>What is the fastest way to start?</h3>
            <p className="muted">
              Start with the placement portal if your immediate goal is placement preparation,
              then explore internships and AI training pages based on your current stage.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
