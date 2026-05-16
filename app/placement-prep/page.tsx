import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Best Placement Preparation App for Students in Nashik",
  description:
    "Explore the SamyakLabs.AI placement preparation portal, a weekly sprint-style guided flow for aptitude, DSA, SQL, HR, and revision designed for students in Nashik and beyond.",
  alternates: {
    canonical: "/placement-prep"
  }
};

export default function PlacementPrepPage() {
  return (
    <div className="marketing-shell public-shell">
      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Placement preparation</p>
            <p className="marketing-header__meta">
              A guided placement preparation portal for students.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/about" className="button-ghost">About</Link>
          <Link href="/internships" className="button-ghost">Internships</Link>
          <Link href="/services" className="button-ghost">Services</Link>
          <Link href="/dashboard" className="button">Open Portal</Link>
        </div>
      </header>

      <section className="section-card public-section">
        <div className="stack">
          <p className="eyebrow">Placement prep app</p>
          <h1 className="app-page-title">A structured placement sprint for students.</h1>
          <p className="muted">
            If a student searches for the best placement preparation app in Nashik,
            what they usually need is not another overwhelming course. They need a clear,
            daily system they can actually follow.
          </p>
          <p className="muted">
            The SamyakLabs.AI placement portal gives one focused task per day across
            aptitude, DSA, SQL, HR, and revision. That makes it useful for students
            preparing steadily instead of trying to manage everything at once. It can
            also sit alongside AI training, mentoring, and classes when students want a broader growth path.
          </p>
          <div className="public-grid">
            <div className="public-card public-card--static">
              <p className="public-card__tag">Daily flow</p>
              <h3>One task at a time</h3>
              <p>Students always know what to do next without planning from scratch.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">Core topics</p>
              <h3>Aptitude, DSA, SQL, HR</h3>
              <p>The portal covers common placement preparation areas in a balanced format.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">Consistency</p>
              <h3>Built for momentum</h3>
              <p>Small daily wins make the preparation process easier to continue.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
