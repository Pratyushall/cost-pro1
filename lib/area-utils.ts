// Utility functions for area calculations and parsing

import type { BHK, AreaSource } from "./types";

// Map BHK to approximate square footage
const BHK_TO_SQFT: Record<BHK, number> = {
  studio: 450,
  "1bhk": 650,
  "2bhk": 950,
  "3bhk": 1250,
  "4bhk": 1600,
  "5bhk": 1900,
  custom: 0, // Will require manual input
};

export function deriveSqftFromBhk(bhk: BHK): number {
  return BHK_TO_SQFT[bhk] || 0;
}

export interface NormalizedArea {
  sqft?: number;
  source: AreaSource;
  error?: string;
}

export function normalizeAreaInput(raw: string): NormalizedArea {
  if (!raw || raw.trim() === "") {
    return { source: "estimated" };
  }

  const cleaned = raw.trim().toLowerCase();

  // Handle "I'm not sure" or quirky options
  if (
    cleaned.includes("not sure") ||
    cleaned.includes("don't know") ||
    cleaned.includes("does it look like")
  ) {
    return { source: "estimated" };
  }

  // Remove commas
  const normalized = cleaned.replace(/,/g, "");

  // Handle metric conversion (m² to sqft)
  // 1 m² = 10.764 sqft
  if (
    normalized.includes("m²") ||
    normalized.includes("m2") ||
    normalized.includes("sq m")
  ) {
    const match = normalized.match(/(\d+(?:\.\d+)?)/);
    if (match) {
      const sqm = Number.parseFloat(match[1]);
      return { sqft: Math.round(sqm * 10.764), source: "manual" };
    }
  }

  // Handle ranges like "900-1100"
  const rangeMatch = normalized.match(/(\d+)\s*-\s*(\d+)/);
  if (rangeMatch) {
    const min = Number.parseFloat(rangeMatch[1]);
    const max = Number.parseFloat(rangeMatch[2]);
    const midpoint = Math.round((min + max) / 2);
    return { sqft: midpoint, source: "manual" };
  }

  // Handle simple number
  const numberMatch = normalized.match(/(\d+(?:\.\d+)?)/);
  if (numberMatch) {
    const sqft = Math.round(Number.parseFloat(numberMatch[1]));
    if (sqft > 0 && sqft < 50000) {
      // Sanity check
      return { sqft, source: "manual" };
    }
  }

  return {
    source: "estimated",
    error: "Could not parse area input",
  };
}

// Approximate area ranges for the selector
export const APPROXIMATE_RANGES = [
  { label: "1,200 - 1,500 sq ft", value: "1200-1500", midpoint: 1350 },
  { label: "1,500 - 1,800 sq ft", value: "1500-1800", midpoint: 1650 },
  { label: "1,800 - 2,100 sq ft", value: "1800-2100", midpoint: 1950 },
  { label: "2,100 - 2,400 sq ft", value: "2100-2400", midpoint: 2250 },
  { label: "2,400 - 2,700 sq ft", value: "2400-2700", midpoint: 2550 },
  { label: "2,700 - 3,000 sq ft", value: "2700-3000", midpoint: 2850 },
  { label: "3,000 - 3,500 sq ft", value: "3000-3500", midpoint: 3250 },
  { label: "3,500 - 4,000 sq ft", value: "3500-4000", midpoint: 3750 },
  { label: "4,000 - 4,500 sq ft", value: "4000-4500", midpoint: 4250 },
  { label: "4,500 - 5,000 sq ft", value: "4500-5000", midpoint: 4750 },
  { label: "5,000 - 5,500 sq ft", value: "5000-5500", midpoint: 5250 },
  { label: "5,500 - 6,000 sq ft", value: "5500-6000", midpoint: 5750 },
  { label: "6,000 - 6,500 sq ft", value: "6000-6500", midpoint: 6250 },
  { label: "6,500 - 7,000 sq ft", value: "6500-7000", midpoint: 6750 },
  { label: "7,000 - 7,500 sq ft", value: "7000-7500", midpoint: 7250 },
  { label: "7,500+ sq ft", value: "7500+", midpoint: 8000 },
  { label: "I'm not sure yet", value: "not-sure", midpoint: 0 },
];

export const BHK_OPTIONS = [
  { label: "Studio", value: "studio" as BHK },
  { label: "1 BHK", value: "1bhk" as BHK },
  { label: "2 BHK", value: "2bhk" as BHK },
  { label: "3 BHK", value: "3bhk" as BHK },
  { label: "4 BHK", value: "4bhk" as BHK },
  { label: "5+ BHK", value: "5bhk" as BHK },
  { label: "Custom", value: "custom" as BHK },
];
