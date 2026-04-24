import { NextResponse } from "next/server";

import { isResendConfigured, isSupabaseConfigured } from "@/lib/env";

export async function GET(request: Request) {
  const providedSecret =
    request.headers.get("x-cron-secret") ||
    request.headers.get("authorization")?.replace("Bearer ", "") ||
    "";

  if (!process.env.CRON_SECRET || providedSecret !== process.env.CRON_SECRET) {
    return NextResponse.json(
      { ok: false, error: "Invalid cron secret." },
      { status: 401 }
    );
  }

  if (
    !isSupabaseConfigured() ||
    !isResendConfigured() ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return NextResponse.json({
      ok: true,
      processed: 0,
      skipped:
        "Set Supabase and Resend env vars to enable the weekly reminder sender."
    });
  }

  return NextResponse.json({
    ok: true,
    processed: 0,
    message:
      "Cron route scaffold is ready. Use the service-role key here to load reminder_preferences, build weekly summaries, and send emails."
  });
}
