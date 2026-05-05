import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About",
  description:
    "About SamyakLabs.AI, a student-focused platform for placement preparation, AI training, GenAI training, diploma and degree classes, 1:1 mentoring, internships, and practical learning support in Nashik and online.",
  alternates: {
    canonical: "/about"
  }
};

export default function AboutPage() {
  return (
    <div className="marketing-shell public-shell">
      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">About us</p>
            <p className="marketing-header__meta">
              Practical learning support across placement prep, AI training, mentoring, classes, and internships.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/internships" className="button-ghost">Internships</Link>
          <Link href="/ai-training" className="button-ghost">AI Training</Link>
          <Link href="/services" className="button-ghost">Services</Link>
          <Link href="/placement-prep" className="button">Placement Prep</Link>
        </div>
      </header>

      <section className="section-card public-section">
        <div className="stack">
          <p className="eyebrow">SamyakLabs.AI</p>
          <h1 className="app-page-title">A practical platform for student growth.</h1>
          <p className="muted">
            SamyakLabs.AI is being shaped as a platform around placement preparation,
            AI learning, GenAI training, analytics thinking, diploma and degree classes,
            1:1 mentoring, and internship-oriented exposure.
          </p>
          <p className="muted">
            The goal is not just to create more content. The goal is to reduce confusion
            and help students move through a clearer path whether they are searching for
            placement prep in Nashik, AI training in virtual mode, or internship opportunities.
          </p>
          <p className="muted">
            We are especially thinking about students who often search using terms like
            internship in Nashik, AI internship in Nashik, diploma internships, degree internships,
            diploma classes, degree classes, 1:1 mentoring, or opportunities around KKW and nearby colleges.
          </p>
        </div>
      </section>
    </div>
  );
}
