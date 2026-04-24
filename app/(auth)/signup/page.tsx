import Link from "next/link";
import { redirect } from "next/navigation";

import { signUpAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { getViewerContext } from "@/lib/auth";
import { isSupabaseConfigured } from "@/lib/env";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function SignupPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const viewer = await getViewerContext();
  const nextPath = getSafeNextPath(
    typeof params.next === "string" ? params.next : "",
    "/onboarding"
  );

  if (viewer.mode === "supabase" && viewer.userId) {
    redirect(nextPath);
  }

  const error = typeof params.error === "string" ? params.error : "";
  const loginHref = buildRedirect("/login", { next: nextPath });

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Create account</p>
        <h1 style={{ fontSize: "3.4rem" }}>Launch a student into Day 1.</h1>
        <p className="muted">
          {isSupabaseConfigured()
            ? "Capture the basics, then route the student into onboarding."
            : "In demo mode this will skip straight into onboarding with sample data."}
        </p>
        {error ? <div className="notice">{error}</div> : null}
        <form action={signUpAction} className="stack">
          <input type="hidden" name="next" value={nextPath} />
          <div className="field">
            <label htmlFor="fullName">Full name</label>
            <input className="input" id="fullName" name="fullName" type="text" placeholder="Aarav Sharma" />
          </div>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input className="input" id="email" name="email" type="email" placeholder="student@example.com" />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input className="input" id="password" name="password" type="password" placeholder="Create a password" />
          </div>
          <div className="field">
            <label htmlFor="timezone">Timezone</label>
            <input className="input" id="timezone" name="timezone" type="text" defaultValue="Asia/Kolkata" />
          </div>
          <SubmitButton
            label={isSupabaseConfigured() ? "Create account" : "Open demo onboarding"}
            pendingLabel={
              isSupabaseConfigured() ? "Creating account..." : "Opening onboarding..."
            }
          />
        </form>
        <p className="muted">
          Already have an account? <Link href={loginHref}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
