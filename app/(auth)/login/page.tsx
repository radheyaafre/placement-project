import Link from "next/link";
import { redirect } from "next/navigation";

import { signInAction } from "@/app/actions";
import { AuthTabs } from "@/components/auth-tabs";
import { SubmitButton } from "@/components/submit-button";
import { getViewerContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function LoginPage({
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

  if (viewer.mode === "supabase" && viewer.userId) {
    redirect(nextPath);
  }

  const error = typeof params.error === "string" ? params.error : "";
  const notice = typeof params.notice === "string" ? params.notice : "";
  const signupHref = buildRedirect("/signup", { next: nextPath });
  const loginHref = buildRedirect("/login", { next: nextPath });
  const reportBugHref = buildRedirect("/report-bug", { next: nextPath });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <AuthTabs
          items={[
            { href: loginHref, label: "Login", active: true },
            { href: reportBugHref, label: "Report bug" }
          ]}
        />
        <p className="eyebrow">Student login</p>
        <h1 style={{ fontSize: "3.4rem" }}>Return to today&apos;s mission.</h1>
        <p className="muted">
          {isSupabaseConfigured()
            ? "Use your email and password to continue the plan."
            : "Supabase is not configured yet, so this screen works as a gateway into demo mode."}
        </p>
        {notice ? <div className="notice">{notice}</div> : null}
        {error ? <div className="notice">{error}</div> : null}
        <form action={signInAction} className="stack">
          <input type="hidden" name="next" value={nextPath} />
          <div className="field">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="student@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="••••••••" />
          </div>
          <SubmitButton
            label={isSupabaseConfigured() ? "Sign in" : "Continue to demo"}
            pendingLabel={isSupabaseConfigured() ? "Signing in..." : "Opening demo..."}
          />
        </form>
        <p className="muted">
          Forgot your password? <Link href="/forgot-password">Reset it</Link>
        </p>
        <p className="muted">
          Need an account? <Link href={signupHref}>Create one</Link>
        </p>
        <p className="muted">
          Something broken? <Link href={reportBugHref}>Report a bug</Link>
        </p>
      </div>
    </div>
  );
}
