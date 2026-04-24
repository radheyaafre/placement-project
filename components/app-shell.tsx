import type { ReactNode } from "react";
import Link from "next/link";

import { signOutAction } from "@/app/actions";
import { AppNav } from "@/components/app-nav";

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
        <div className="brand-lockup">
          <Link href="/" className="brand-mark">
            <span className="brand-mark__dot" aria-hidden="true" />
            <span className="brand-mark__text">SamyakLabs.AI</span>
          </Link>
          <div>
            <p className="eyebrow">Placement prep, one focused hour a day for 90 days</p>
            <p className="muted">
              {mode === "demo"
                ? "Explore the student flow in demo mode."
                : `Welcome back, ${displayName}`}
            </p>
          </div>
        </div>

        <div className="app-shell__actions">
          {mode === "supabase" ? (
            <form action={signOutAction} className="app-shell__signout">
              <button className="button-ghost" type="submit">
                Logout
              </button>
            </form>
          ) : (
            <Link href="/" className="button-ghost">
              Back home
            </Link>
          )}
        </div>
      </header>

      <div className="app-shell__content">
        <aside className="app-sidebar">
          <AppNav isAdmin={isAdmin} />
        </aside>
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
