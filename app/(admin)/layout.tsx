import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getViewerContext } from "@/lib/auth";

export default async function AdminLayout({
  children
}: {
  children: ReactNode;
}) {
  const viewer = await getViewerContext();

  if (viewer.mode === "supabase" && !viewer.userId) {
    redirect("/login");
  }

  return (
    <AppShell
      displayName={viewer.displayName}
      isAdmin={viewer.isAdmin}
      mode={viewer.mode}
    >
      {children}
    </AppShell>
  );
}
