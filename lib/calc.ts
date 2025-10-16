// lib/calc.ts
import { computeExactBreakdown } from "@/lib/compute-exact-breakdown";

export type EstimatorState = {
  basics: any;
  singleLine: any;
  rooms: any;
  addons: any;
};

export type ExactBreakdown = {
  totalsByCategory: Record<string, number>;
  grandTotal: number;
};

/**
 * Return the exact totals for the given estimator state.
 * Delegates to your proven computeExactBreakdown().
 */
export function calculateExactTotals(state: EstimatorState): ExactBreakdown {
  // If computeExactBreakdown already returns the exact shape, just pass it through.
  // Otherwise, map it into { totalsByCategory, grandTotal }.
  // @ts-ignore – align types as needed inside your project
  return computeExactBreakdown(state) as ExactBreakdown;
}

/**
 * Convert exact totals into low/high ranges for UI.
 * Tweak the band (±%) if you prefer.
 */
export function convertToRanges(exact: ExactBreakdown) {
  const band = 0.1; // ±10%
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
