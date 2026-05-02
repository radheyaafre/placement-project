import { NextRequest, NextResponse } from "next/server";

import { getViewerContext } from "@/lib/auth";
import { getViewerStudentPlanState } from "@/lib/data";
import { buildRedirect, getSafeNextPath } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const nextPath = getSafeNextPath(
    request.nextUrl.searchParams.get("next"),
    "/dashboard"
  );
  const viewer = await getViewerContext();

  if (viewer.mode === "supabase" && !viewer.userId) {
    return NextResponse.redirect(
      new URL(buildRedirect("/login", { next: nextPath }), request.url)
    );
  }

  const planState = await getViewerStudentPlanState();
  const destination = planState === "missing" ? "/onboarding" : nextPath;

  return NextResponse.redirect(new URL(destination, request.url));
}
