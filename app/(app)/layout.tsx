import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AppShell } from "@/components/app-shell";
import { getViewerContext } from "@/lib/auth";
import { getDashboardSnapshot, getViewerStudentPlanState } from "@/lib/data";

export default async function StudentAppLayout({
  children
}: {
  children: ReactNode;
}) {
  const viewer = await getViewerContext();
  const snapshot = await getDashboardSnapshot();
  const planState = await getViewerStudentPlanState();

  if (viewer.mode === "supabase" && !viewer.userId) {
    redirect("/login");
  }

  const setupRequired =
    viewer.mode === "supabase" &&
    Boolean(viewer.userId) &&
    !snapshot &&
    planState === "missing";

  const programMeta = snapshot
    ? (() => {
        const visibleWeeks = Array.from(
          new Set(snapshot.missions.map((mission) => mission.weekNumber))
        );
        const completedSprintCount = visibleWeeks.filter((weekNumber) => {
          const sprintMissions = snapshot.missions.filter(
            (mission) => mission.weekNumber === weekNumber
          );

          return (
            sprintMissions.length > 0 &&
            sprintMissions.every(
              (mission) => snapshot.progressByTaskId[mission.id]?.status === "completed"
            )
          );
        }).length;

        return {
          summaryLabel:
            completedSprintCount > 0
              ? `Finished ${completedSprintCount} sprint${completedSprintCount === 1 ? "" : "s"} till now`
              : ""
        };
      })()
    : null;

  return (
    <AppShell
      displayName={viewer.displayName}
      isAdmin={viewer.isAdmin}
      mode={viewer.mode}
      programMeta={programMeta}
      setupRequired={setupRequired}
    >
      {children}
    </AppShell>
  );
}
