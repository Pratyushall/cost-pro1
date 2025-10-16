import type { AddonKey } from "@/lib/types";

// Extend AddonKey with "doors" locally since it's not in the global type
type AddonKeyWithDoors = Extract<
  AddonKey | "doors",
  "sofa" | "diningTable" | "curtains" | "doors" | "lights"
>;

type RoomsLike = Partial<
  Record<"master" | "children" | "guest" | "living" | "kitchen", unknown>
>;

export const ADDON_LABELS: Record<AddonKeyWithDoors, string> = {
  sofa: "Sofa Set",
  diningTable: "Dining Table",
  curtains: "Curtains (Windows)",
  doors: "Curtains (Doors)",
  lights: "Decorative Lights",
};

export const ADDON_UNITS: Record<AddonKeyWithDoors, string> = {
  sofa: "sets",
  diningTable: "sets",
  curtains: "windows",
  doors: "doors",
  lights: "fixtures",
};

export const ADDON_PRESETS: Record<
  AddonKeyWithDoors,
  Array<{ label: string; qty: number }>
> = {
  sofa: [
    { label: "1 Set", qty: 1 },
    { label: "2 Sets", qty: 2 },
  ],
  diningTable: [
    { label: "4-Seater", qty: 1 },
    { label: "6-Seater", qty: 1 },
  ],
  curtains: [
    { label: "Living Room", qty: 2 },
    { label: "Whole Home (derive)", qty: 0 },
  ],
  doors: [
    { label: "Main Door", qty: 1 },
    { label: "Bedroom Doors", qty: 3 },
    { label: "All Doors", qty: 5 },
  ],
  lights: [
    { label: "Basic (4)", qty: 4 },
    { label: "Full (8)", qty: 8 },
  ],
};

export const ADDON_BUNDLES: Array<{
  label: string;
  items: Partial<Record<AddonKeyWithDoors, number>>;
}> = [
  {
    label: "Living Essentials",
    items: { sofa: 1, diningTable: 1, curtains: 2, lights: 4 },
  },
  {
    label: "Complete Home Lite",
    items: {
      sofa: 1,
      diningTable: 1,
      curtains: 4,
      doors: 3,
      lights: 8,
    },
  },
];

// 2 windows per bedroom + 2 living + 1 kitchen (fallback if rooms missing)
export function deriveWholeHomeCurtains(rooms: RoomsLike): number {
  const bedroomKeys = ["master", "children", "guest"] as const;
  const bedroomCount =
    bedroomKeys.filter((k) => rooms && rooms[k] !== undefined).length || 2;
  return bedroomCount * 2 + 2 + 1;
}
