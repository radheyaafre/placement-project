import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Diploma Classes, Degree Classes, 1:1 Mentoring, and AI Services",
  description:
    "Explore SamyakLabs.AI services including diploma classes, degree classes, 1:1 mentoring, GenAI training, Codex guidance, AI-based development support, and placement preparation.",
  alternates: {
    canonical: "/services"
  }
};

export default function ServicesPage() {
  return (
    <div className="marketing-shell public-shell">
      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Services</p>
            <p className="marketing-header__meta">
              Classes, mentoring, AI training, and development-oriented student support.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/about" className="button-ghost">About</Link>
          <Link href="/internships" className="button-ghost">Internships</Link>
          <Link href="/ai-training" className="button-ghost">AI Training</Link>
          <Link href="/placement-prep" className="button">Placement Prep</Link>
        </div>
      </header>

      <section className="section-card public-section">
        <div className="stack">
          <p className="eyebrow">Student-focused services</p>
          <h1 className="app-page-title">Classes, mentoring, GenAI, Codex, and AI-based development support.</h1>
          <p className="muted">
            SamyakLabs.AI is also being positioned around diploma classes, degree classes,
            1:1 mentoring, GenAI training, Codex-guided learning, and AI-based development support.
          </p>
          <div className="public-grid">
            <div className="public-card public-card--static">
              <p className="public-card__tag">Diploma classes</p>
              <h3>Structured fundamentals</h3>
              <p>Support for diploma students who want stronger basics, better clarity, and a guided path.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">Degree classes</p>
              <h3>Higher-level preparation</h3>
              <p>Support for degree students balancing placements, projects, interviews, and practical learning.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">1:1 mentoring</p>
              <h3>Direct guidance</h3>
              <p>Mentoring-oriented positioning for students who need focused support instead of generic advice.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">GenAI and Codex</p>
              <h3>Hands-on tool familiarity</h3>
              <p>Learning support around modern GenAI tools, Codex-style workflows, and practical AI usage.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">AI-based development</p>
              <h3>Build-oriented mindset</h3>
              <p>Guidance for students who want to move from learning AI concepts to building with them.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">Placement plus growth</p>
              <h3>Connected path</h3>
              <p>Services can connect naturally with placement preparation, internships, and long-term skill building.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
