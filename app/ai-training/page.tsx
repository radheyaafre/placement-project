import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Training, GenAI Training, and AI Development Support",
  description:
    "SamyakLabs.AI is positioning around AI training in Nashik, virtual AI training, GenAI training, Codex support, and AI-based development for students who want practical guided learning.",
  alternates: {
    canonical: "/ai-training"
  }
};

export default function AiTrainingPage() {
  return (
    <div className="marketing-shell public-shell">
      <header className="marketing-header public-header">
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">AI training</p>
            <p className="marketing-header__meta">
              Practical AI, GenAI, and AI-based development support for students in Nashik and virtual mode.
            </p>
          </div>
        </div>
        <div className="hero-actions">
          <Link href="/about" className="button-ghost">About</Link>
          <Link href="/internships" className="button-ghost">Internships</Link>
          <Link href="/services" className="button-ghost">Services</Link>
          <Link href="/placement-prep" className="button">Placement Prep</Link>
        </div>
      </header>

      <section className="section-card public-section">
        <div className="stack">
          <p className="eyebrow">AI training and GenAI</p>
          <h1 className="app-page-title">AI learning with practical direction and build support.</h1>
          <p className="muted">
            Students searching for AI training in Nashik, virtual AI training, GenAI training,
            Codex guidance, or AI-based development usually want something more actionable than
            random tutorials. SamyakLabs.AI is building around practical understanding, guided
            workflows, and real-world orientation.
          </p>
          <div className="public-grid">
            <div className="public-card public-card--static">
              <p className="public-card__tag">Local relevance</p>
              <h3>Nashik-based search intent</h3>
              <p>This page is designed to be relevant to students searching for AI training around Nashik.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">GenAI and Codex</p>
              <h3>Tool-guided learning</h3>
              <p>Students can discover SamyakLabs.AI through GenAI training and Codex-related learning intent.</p>
            </div>
            <div className="public-card public-card--static">
              <p className="public-card__tag">AI-based development</p>
              <h3>From learning to building</h3>
              <p>AI learning becomes stronger when it is linked with real product thinking, development, and placement preparation.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
