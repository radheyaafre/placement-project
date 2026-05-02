"use client";

import Link from "next/link";
import type { FormEvent } from "react";
import { useEffect, useState } from "react";

import { LoadingSpinner } from "@/components/loading-spinner";
import { getAuthLinkErrorMessage } from "@/lib/auth-link-messages";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser";

type Phase =
  | "checking"
  | "ready"
  | "submitting"
  | "success"
  | "unsupported"
  | "error";

const SUCCESS_REDIRECT =
  "/login?notice=Password%20updated.%20Sign%20in%20with%20your%20new%20password.";
const READY_NOTICE = "Reset link verified. Choose a new password.";

type BrowserClient = ReturnType<typeof createSupabaseBrowserClient>;

function clearRecoveryUrlState() {
  window.history.replaceState({}, document.title, window.location.pathname);
}

function wait(durationMs: number) {
  return new Promise((resolve) => window.setTimeout(resolve, durationMs));
}

async function waitForSession(client: BrowserClient, attempts = 3) {
  let lastError: string | null = null;

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const {
      data: { session },
      error
    } = await client.auth.getSession();

    if (error) {
      lastError = error.message;
      break;
    }

    if (session) {
      return { session, error: null };
    }

    if (attempt < attempts - 1) {
      await wait(150);
    }
  }

  return {
    session: null,
    error: lastError
  };
}

export function ResetPasswordForm() {
  const [phase, setPhase] = useState<Phase>("checking");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [supabase, setSupabase] =
    useState<ReturnType<typeof createSupabaseBrowserClient> | null>(null);

  useEffect(() => {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setPhase("unsupported");
      setNotice("Supabase auth is not configured in this environment.");
      return;
    }

    try {
      setSupabase(createSupabaseBrowserClient());
    } catch {
      setPhase("unsupported");
      setNotice("Supabase auth is not configured in this environment.");
    }
  }, []);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    const client = supabase;
    let active = true;

    const { data } = client.auth.onAuthStateChange((event) => {
      if (!active) {
        return;
      }

      if (event === "PASSWORD_RECOVERY" || event === "SIGNED_IN") {
        clearRecoveryUrlState();
        setPhase("ready");
        setError("");
        setNotice(READY_NOTICE);
      }
    });

    async function bootstrap() {
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.slice(1));
      const error = searchParams.get("error") || hashParams.get("error");
      const errorCode =
        searchParams.get("error_code") || hashParams.get("error_code");
      const errorDescription =
        searchParams.get("error_description") || hashParams.get("error_description");
      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");
      const accessToken = hashParams.get("access_token");
      const refreshToken = hashParams.get("refresh_token");

      if (error || errorCode || errorDescription) {
        setError(
          getAuthLinkErrorMessage({
            error,
            errorCode,
            errorDescription,
            context: "recovery"
          })
        );
        setPhase("error");
        return;
      }

      if (tokenHash && type === "recovery") {
        const { error: verifyError } = await client.auth.verifyOtp({
          token_hash: tokenHash,
          type: "recovery"
        });

        if (!active) {
          return;
        }

        if (verifyError) {
          setError(
            getAuthLinkErrorMessage({
              errorDescription: verifyError.message,
              context: "recovery"
            })
          );
          setPhase("error");
          return;
        }

        clearRecoveryUrlState();
        setNotice(READY_NOTICE);
        setPhase("ready");
        return;
      }

      if (accessToken && refreshToken) {
        const { error: sessionError } = await client.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (!active) {
          return;
        }

        if (sessionError) {
          setError(
            getAuthLinkErrorMessage({
              errorDescription: sessionError.message,
              context: "recovery"
            })
          );
          setPhase("error");
          return;
        }

        clearRecoveryUrlState();
        setNotice(READY_NOTICE);
        setPhase("ready");
        return;
      }

      if (code) {
        setNotice("Verifying recovery link...");

        const pendingSession = await waitForSession(client);

        if (!active) {
          return;
        }

        if (pendingSession.error) {
          setError(
            getAuthLinkErrorMessage({
              errorDescription: pendingSession.error,
              context: "recovery"
            })
          );
          setPhase("error");
          return;
        }

        if (pendingSession.session) {
          clearRecoveryUrlState();
          setNotice(READY_NOTICE);
          setPhase("ready");
          return;
        }

        const { data: exchangeData, error: exchangeError } =
          await client.auth.exchangeCodeForSession(code);

        if (!active) {
          return;
        }

        if (exchangeError) {
          setError(
            getAuthLinkErrorMessage({
              errorDescription: exchangeError.message,
              context: "recovery"
            })
          );
          setPhase("error");
          return;
        }

        if (exchangeData.session) {
          clearRecoveryUrlState();
          setNotice(READY_NOTICE);
          setPhase("ready");
          return;
        }
      }

      const {
        data: { session },
        error: sessionError
      } = await client.auth.getSession();

      if (!active) {
        return;
      }

      if (sessionError) {
        setError(
          getAuthLinkErrorMessage({
            errorDescription: sessionError.message,
            context: "recovery"
          })
        );
        setPhase("error");
        return;
      }

      if (session) {
        clearRecoveryUrlState();
        setNotice("Choose a new password.");
        setPhase("ready");
        return;
      }

      setError("Open this page from the password reset email to set a new password.");
      setPhase("error");
    }

    void bootstrap();

    return () => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, [supabase]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!supabase) {
      setPhase("unsupported");
      setError("Supabase auth is not configured.");
      return;
    }

    if (password.length < 8) {
      setError("Use at least 8 characters for the new password.");
      return;
    }

    if (password !== confirmPassword) {
      setError("New password and confirm password must match.");
      return;
    }

    setPhase("submitting");
    setError("");
    setNotice("");

    const { error: updateError } = await supabase.auth.updateUser({ password });

    if (updateError) {
      setPhase("ready");
      setError(updateError.message);
      return;
    }

    await supabase.auth.signOut();
    setPhase("success");
    setNotice("Password updated. Sign in with your new password.");
  }

  return (
    <div className="stack">
      <p className="muted">
        Use the recovery link from the email, then set a fresh password here.
      </p>
      {notice ? <div className="notice">{notice}</div> : null}
      {error ? <div className="notice">{error}</div> : null}

      {phase === "checking" ? (
        <div className="notice">Verifying recovery link...</div>
      ) : null}

      {phase === "ready" || phase === "submitting" ? (
        <form onSubmit={handleSubmit} className="stack">
          <div className="field">
            <label htmlFor="newPassword">New password</label>
            <input
              className="input"
              id="newPassword"
              name="newPassword"
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Use at least 8 characters"
            />
          </div>
          <div className="field">
            <label htmlFor="confirmPassword">Confirm password</label>
            <input
              className="input"
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              minLength={8}
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              placeholder="Re-enter the new password"
            />
          </div>
          <button className="button" type="submit" disabled={phase === "submitting"}>
            {phase === "submitting" ? (
              <>
                <LoadingSpinner className="spinner--button" label="Updating password" />
                <span>Updating password...</span>
              </>
            ) : (
              <span>Update password</span>
            )}
          </button>
        </form>
      ) : null}

      {phase === "success" ? (
        <div className="button-row">
          <Link href={SUCCESS_REDIRECT} className="button">
            Return to login
          </Link>
        </div>
      ) : null}

      <p className="muted">
        Remembered it? <Link href="/login">Back to login</Link>
      </p>
    </div>
  );
}
