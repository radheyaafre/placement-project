import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Internships in Nashik for Diploma and Degree Students",
  description:
    "Explore how SamyakLabs.AI is approaching internship-oriented student support for Nashik, including AI internships, diploma internships, degree internships, and practical exposure.",
  alternates: {
    canonical: "/internships"
  }
};

export default function InternshipsPage() {
  return (
    <div className="marketing-shell public-shell">
      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Internships</p>
            <p className="marketing-header__meta">
              Internship-oriented learning support for students in Nashik and beyond.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/about" className="button-ghost">About</Link>
          <Link href="/ai-training" className="button-ghost">AI Training</Link>
          <Link href="/services" className="button-ghost">Services</Link>
          <Link href="/placement-prep" className="button">Placement Prep</Link>
        </div>
      </header>

      <section className="section-card public-section">
        <div className="stack">
          <p className="eyebrow">Internships in Nashik</p>
          <h1 className="app-page-title">Internship-oriented support for diploma and degree students.</h1>
          <p className="muted">
            Students often search for internships in Nashik, AI internships in Nashik,
            diploma internships, degree internships, and opportunities around KKW or nearby
            colleges. SamyakLabs.AI is building public positioning around those needs, along
            with mentoring and classes that can help students become internship-ready.
          </p>
          <div className="public-grid">
            <div className="public-card public-card--static">
              <p className="public-card__tag">Diploma students</p>
              <h3>Early practical exposure</h3>
              <p>Support for students who want hands-on work, guided tasks, and confidence-building exposure.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">Degree students</p>
              <h3>Internship readiness</h3>
              <p>Better direction around project thinking, problem solving, and structured preparation.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">AI internships</p>
              <h3>AI and analytics orientation</h3>
              <p>Exposure to practical AI and analytics workflows rather than only theoretical concepts.</p>
            </div>
          </div>
          <p className="muted">
            This page helps search engines understand that SamyakLabs.AI is relevant to
            students searching for internship opportunities in Nashik and related local terms.
          </p>
        </div>
      </section>
    </div>
  );
}
