import Link from "next/link";

export default function NotFound() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Not found</p>
        <h1 style={{ fontSize: "3rem" }}>This page is not in the current MVP build.</h1>
        <p className="muted">
          Head back to the dashboard and continue the placement prep flow.
        </p>
        <div className="button-row">
          <Link href="/dashboard" className="button">
            Go to dashboard
          </Link>
          <Link href="/" className="button-secondary">
            Open home
          </Link>
        </div>
      </div>
    </div>
  );
}
