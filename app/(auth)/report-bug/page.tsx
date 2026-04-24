import Link from "next/link";

import { BugReportForm } from "@/components/bug-report-form";
import { AuthTabs } from "@/components/auth-tabs";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ReportBugPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(
    typeof params.next === "string" ? params.next : "",
    "/dashboard"
  );
  const loginHref = buildRedirect("/login", { next: nextPath });
  const reportBugHref = buildRedirect("/report-bug", { next: nextPath });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <AuthTabs
          items={[
            { href: loginHref, label: "Login" },
            { href: reportBugHref, label: "Report bug", active: true }
          ]}
        />
        <p className="eyebrow">Report a bug</p>
        <h1 style={{ fontSize: "3.4rem" }}>Tell us what broke.</h1>
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
