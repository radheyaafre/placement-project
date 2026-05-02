import { redirect } from "next/navigation";

import { getViewerContext } from "@/lib/auth";
import { getViewerStudentPlanState } from "@/lib/data";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

type SearchParams = Promise<Record<string, string | string[] | undefined>>;

export default async function PostLoginPage({
  searchParams
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const nextPath = getSafeNextPath(
    typeof params.next === "string" ? params.next : "",
    "/dashboard"
  );
  const viewer = await getViewerContext();

  if (viewer.mode === "supabase" && !viewer.userId) {
    redirect(buildRedirect("/login", { next: nextPath }));
  }

  const planState = await getViewerStudentPlanState();

  if (planState === "missing") {
    redirect("/onboarding");
  }

  redirect(nextPath);
}
