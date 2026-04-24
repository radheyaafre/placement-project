import { NextResponse } from "next/server";

import { parsePlanImport } from "@/lib/admin-import";

export async function GET() {
  return NextResponse.json({
    ok: true,
    message:
      "POST CSV text or JSON { \"csv\": \"...\" } to validate an import payload."
  });
}

export async function POST(request: Request) {
  const contentType = request.headers.get("content-type") || "";
  let csv = "";

  if (contentType.includes("application/json")) {
    const body = await request.json();
    csv = typeof body.csv === "string" ? body.csv : "";
  } else {
    csv = await request.text();
  }

  const result = parsePlanImport(csv);

  return NextResponse.json(result, {
    status: result.ok ? 200 : 400
  });
}
