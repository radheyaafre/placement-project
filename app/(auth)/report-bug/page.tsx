import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { BugReportForm } from "@/components/bug-report-form";
import { AuthTabs } from "@/components/auth-tabs";
import { SectionCard } from "@/components/section-card";
import { getViewerContext } from "@/lib/auth";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReportBugPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const viewer = await getViewerContext();
  const nextPath = getSafeNextPath(
    typeof params.next === "string" ? params.next : "",
    "/dashboard"
  );
  const loginHref = buildRedirect("/login", { next: nextPath });
  const reportBugHref = buildRedirect("/report-bug", { next: nextPath });

  if (viewer.userId) {
    return (
      <AppShell
        displayName={viewer.displayName}
        isAdmin={viewer.isAdmin}
        mode={viewer.mode}
      >
        <SectionCard title="Report a bug" eyebrow="Support">
          <p className="muted">
            Something not working? Send the issue directly to
            {" "}
            <strong>samyaklabs.ai@gmail.com</strong>.
          </p>
          <BugReportForm source="Signed-in app" textareaId="signed-in-report" />
        </SectionCard>
      </AppShell>
    );
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link href="/" className="brand-mark auth-card__brand" data-loading-label="Opening home">
          <span className="brand-mark__dot" aria-hidden="true" />
          <span className="brand-mark__text">SamyakLabs.AI</span>
        </Link>
        <AuthTabs
          items={[
            { href: loginHref, label: "Login" },
            { href: reportBugHref, label: "Report bug", active: true }
          ]}
        />
        <p className="eyebrow">Report a bug</p>
        <h1 style={{ fontSize: "3.1rem" }}>Tell us what broke.</h1>
        <p className="muted">
          Type the issue here and it will be sent directly to
          {" "}
          <strong>samyaklabs.ai@gmail.com</strong>.
        </p>
        <BugReportForm source="Login page" textareaId="login-page-report" />
        <p className="muted">
          Need to sign in instead? <Link href={loginHref}>Go to login</Link>
        </p>
      </div>
    </div>
  );
}
