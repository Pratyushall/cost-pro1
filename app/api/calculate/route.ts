import { type NextRequest, NextResponse } from "next/server";
import { calculateExactTotals, convertToRanges } from "@/lib/calc";
import type { EstimatorState } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const state: EstimatorState = await request.json();

    // Calculate exact totals server-side (never exposed to client)
    const exactTotals = calculateExactTotals(state);

    // Convert to ranges for client display
    const ranges = convertToRanges(exactTotals);

    // Log for analytics (no exact prices)
    console.log("[v0] Estimate generated:", {
      bhk: state.basics.bhk,
      pkg: state.basics.pkg,
      carpetArea: state.basics.carpetAreaSqft,
      rangeTotal: `${ranges.grandTotal.low} - ${ranges.grandTotal.high}`,
    });

    return NextResponse.json({
      success: true,
      ranges,
      // Never return exact totals to client
    });
  } catch (error) {
    console.error("Calculation error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to calculate estimate" },
      { status: 500 }
    );
  }
}
