export type ScopePreset = "100%" | "80%" | "50%" | "custom";
export type RoomShortcut =
  | "all"
  | "exclude-bathrooms"
  | "bedrooms"
  | "living-dining";

export interface RoomShortcutConfig {
  label: string;
  falseCeiling: number;
  painting: number;
  electricalWiring: number;
}

export const ROOM_SHORTCUTS: Record<RoomShortcut, RoomShortcutConfig> = {
  all: {
    label: "All",
    falseCeiling: 100,
    painting: 100,
    electricalWiring: 100,
  },
  "exclude-bathrooms": {
    label: "Exclude bathrooms",
    falseCeiling: 85,
    painting: 85,
    electricalWiring: 90,
  },
  bedrooms: {
    label: "Bedrooms only",
    falseCeiling: 40,
    painting: 40,
    electricalWiring: 50,
  },
  "living-dining": {
    label: "Living + Dining",
    falseCeiling: 35,
    painting: 35,
    electricalWiring: 40,
  },
};

export const SCOPE_PRESETS: { value: number; label: ScopePreset }[] = [
  { value: 100, label: "100%" },
  { value: 80, label: "80%" },
  { value: 50, label: "50%" },
];

export function percentToSqft(percent: number, totalSqft: number): number {
  return Math.round((percent / 100) * totalSqft);
}

export function sqftToPercent(sqft: number, totalSqft: number): number {
  if (totalSqft === 0) return 0;
  return Math.round((sqft / totalSqft) * 100);
}

export function getItemLabel(key: string): string {
  const labels: Record<string, string> = {
    falseCeiling: "False Ceiling",
    painting: "Painting",
    electricalWiring: "Electrical Wiring",
  };
  return labels[key] || key;
}
