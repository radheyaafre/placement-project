import Link from "next/link";

import { ResetPasswordForm } from "@/components/reset-password-form";
import { isSupabaseConfigured } from "@/lib/env";

export default function ResetPasswordPage() {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <p className="eyebrow">Reset password</p>
        <h1 style={{ fontSize: "3.2rem" }}>Choose a new password.</h1>
        <p className="muted">
          {isSupabaseConfigured()
            ? "Open the link from the recovery email, then finish the password reset here."
            : "This flow needs Supabase auth to be configured."}
        </p>
        <ResetPasswordForm />
        <p className="muted">
          Need a fresh recovery link? <Link href="/forgot-password">Request another one</Link>
        </p>
      </div>
    </div>
  );
}
