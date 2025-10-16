// app/api/calculate/route.ts
import { type NextRequest, NextResponse } from "next/server";
import { computeExactBreakdown } from "@/lib/compute-exact-breakdown";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function toRanges(exact: ReturnType<typeof computeExactBreakdown>) {
  const band = 0.1;
  const byCategory = Object.fromEntries(
    Object.entries(exact.totalsByCategory).map(([k, v]) => [
      k,
      {
        low: Math.max(0, Math.round(v * (1 - band))),
        high: Math.round(v * (1 + band)),
      },
    ])
  );
  const grandTotal = {
    low: Math.max(0, Math.round(exact.grandTotal * (1 - band))),
    high: Math.round(exact.grandTotal * (1 + band)),
  };
  return { byCategory, grandTotal };
}

export async function POST(request: NextRequest) {
  try {
    const state = await request.json();
    if (!state || typeof state !== "object") {
      return NextResponse.json(
        { success: false, error: "bad_input" },
        { status: 400 }
      );
    }
    const exact = computeExactBreakdown(state);
    const ranges = toRanges(exact);
    return NextResponse.json({ success: true, breakdown: exact, ranges });
  } catch (e: any) {
    return NextResponse.json(
      { success: false, error: "server_error", detail: e?.message },
      { status: 500 }
    );
  }
}
