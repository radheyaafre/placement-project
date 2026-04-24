export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}

export function isResendConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.REMINDER_FROM_EMAIL);
}

export function isBugReportConfigured() {
  return Boolean(process.env.RESEND_API_KEY);
}

export function getResendFromEmail() {
  return process.env.REMINDER_FROM_EMAIL || "Placement Prep <onboarding@resend.dev>";
}

export function getBugReportToEmail() {
  return process.env.BUG_REPORT_TO_EMAIL || "samyaklabs.ai@gmail.com";
}

export function getAppUrl() {
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
}
