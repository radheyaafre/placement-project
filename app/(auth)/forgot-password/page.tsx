import Link from "next/link";

import { requestPasswordResetAction } from "@/app/actions";
import { SubmitButton } from "@/components/submit-button";
import { isSupabaseConfigured } from "@/lib/env";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function ForgotPasswordPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const error = typeof params.error === "string" ? params.error : "";
  const notice = typeof params.notice === "string" ? params.notice : "";

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Forgot password</p>
        <h1 style={{ fontSize: "3.2rem" }}>Send a recovery link.</h1>
        <p className="muted">
          {isSupabaseConfigured()
            ? "Enter the student's email and Supabase will send a password reset email."
            : "Supabase is not configured in this environment, so reset emails are unavailable in demo mode."}
        </p>
        {notice ? <div className="notice">{notice}</div> : null}
        {error ? <div className="notice">{error}</div> : null}
        <form action={requestPasswordResetAction} className="stack">
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              className="input"
              id="email"
              name="email"
              type="email"
              placeholder="student@example.com"
            />
          </div>
          <SubmitButton
            label="Send reset email"
            pendingLabel="Sending reset email..."
          />
        </form>
        <p className="muted">
          Need to sign in? <Link href="/login">Back to login</Link>
        </p>
      </div>
    </div>
  );
}
