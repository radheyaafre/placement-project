import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getViewerContext } from "@/lib/auth";
import { getDashboardSnapshot } from "@/lib/data";
import { formatPlanDate, parseLocalDate, shiftDays } from "@/lib/utils";

export default async function StudentAppLayout({
  children
}: {
  children: ReactNode;
}) {
  const viewer = await getViewerContext();
  const snapshot = await getDashboardSnapshot();

  if (viewer.mode === "supabase" && !viewer.userId) {
    redirect("/login");
  }

  const programMeta = snapshot
    ? {
        startLabel: formatPlanDate(parseLocalDate(snapshot.startDate)),
        endLabel: formatPlanDate(
          shiftDays(parseLocalDate(snapshot.startDate), snapshot.totalDays - 1)
        ),
        dayLabel: `Day ${snapshot.currentDay} of ${snapshot.totalDays}`
      }
    : null;

  return (
    <AppShell
      displayName={viewer.displayName}
      isAdmin={viewer.isAdmin}
      mode={viewer.mode}
      programMeta={programMeta}
    >
      {children}
    </AppShell>
  );
}
