import type { ReactNode } from "react";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { AppNav } from "@/components/app-nav";
import { SubmitButton } from "@/components/submit-button";

export function AppShell({
  children,
  displayName,
  isAdmin,
  mode
}: {
  children: ReactNode;
  displayName: string;
  isAdmin: boolean;
  mode: "demo" | "supabase";
}) {
  return (
    <div className="app-shell">
      <header className="app-shell__header">
        <div className="app-shell__bar">
          <div className="brand-lockup">
            <Link href="/" className="brand-mark" data-loading-label="Opening home">
              <span className="brand-mark__dot" aria-hidden="true" />
              <span className="brand-mark__text">SamyakLabs.AI</span>
            </Link>
            <div className="app-shell__intro">
              <p className="app-shell__tag">Placement prep, only one focused hour daily for 90 days</p>
              <p className="muted">
                {mode === "demo"
                  ? "Problem-first demo mode."
                  : `Logged in as ${displayName}`}
              </p>
            </div>
          </div>

          <div className="app-shell__actions">
            {mode === "supabase" ? (
              <form action={signOutAction} className="app-shell__signout">
                <SubmitButton
                  className="button-ghost"
                  label="Logout"
                  pendingLabel="Logging out..."
                />
              </form>
            ) : (
              <Link href="/" className="button-ghost">
                Back home
              </Link>
            )}
          </div>
        </div>

        <div className="app-shell__navrow">
          <AppNav isAdmin={isAdmin} />
        </div>
      </header>

      <main className="app-main">{children}</main>
    </div>
  );
}
