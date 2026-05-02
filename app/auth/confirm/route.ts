import type { EmailOtpType } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

import { createSupabaseServerClient } from "@/lib/supabase/server";

const DEFAULT_REDIRECT_PATH = "/reset-password";

function buildDefaultRedirect(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = DEFAULT_REDIRECT_PATH;
  url.search = "";
  url.hash = "";
  return url;
}

function getSafeRedirectUrl(request: NextRequest, value: string | null) {
  const fallback = buildDefaultRedirect(request);

  if (!value) {
    return fallback;
  }

  try {
    const url = new URL(value, request.nextUrl.origin);

    if (url.origin !== request.nextUrl.origin) {
      return fallback;
    }

    return url;
  } catch {
    return fallback;
  }
}

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get("code");
  const tokenHash = request.nextUrl.searchParams.get("token_hash");
  const type = request.nextUrl.searchParams.get("type") as EmailOtpType | null;
  const redirectToParam =
    request.nextUrl.searchParams.get("redirect_to") ||
    request.nextUrl.searchParams.get("next");
  const redirectTo = getSafeRedirectUrl(request, redirectToParam);

  const supabase = await createSupabaseServerClient();

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type
    });

    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  const errorRedirect = buildDefaultRedirect(request);
  errorRedirect.searchParams.set("error", "access_denied");
  errorRedirect.searchParams.set("error_code", "otp_expired");
  errorRedirect.searchParams.set(
    "error_description",
    "Email link is invalid or has expired."
  );

  return NextResponse.redirect(errorRedirect);
}
