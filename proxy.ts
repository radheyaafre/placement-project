import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const CANONICAL_HOST = "www.samyaklabsai.com";
const APEX_HOST = "samyaklabsai.com";

export function proxy(request: NextRequest) {
  const hostname = request.nextUrl.hostname.toLowerCase();
  const isCanonicalHost = hostname === CANONICAL_HOST;
  const isApexHost = hostname === APEX_HOST;
  const isProductionVercelHost =
    process.env.VERCEL_ENV === "production" && hostname.endsWith(".vercel.app");

  if (isCanonicalHost || (!isApexHost && !isProductionVercelHost)) {
    return NextResponse.next();
  }

  const redirectUrl = request.nextUrl.clone();
  redirectUrl.protocol = "https:";
  redirectUrl.host = CANONICAL_HOST;

  return NextResponse.redirect(redirectUrl, 308);
}
