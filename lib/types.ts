export type Package = "Premium" | "Luxury";
export type BHK = "2bhk" | "3bhk" | "4bhk";

export type Basics = {
  carpetAreaSqft: number;
  bhk: BHK;
  pkg: Package;
};

export type SingleLine = {
  falseCeiling: {
    enabled: boolean;
    areaSqft?: number;
    pkgOverride?: Package | null;
  };
  painting: {
    enabled: boolean;
    areaSqft?: number;
    pkgOverride?: Package | null;
  };
  electricalWiring: {
    enabled: boolean;
    areaSqft?: number;
    pkgOverride?: Package | null;
  };
};

export type BedroomSize = "14x16" | "10x12" | "10x10" | "11.5x11.5";
export type LivingSize = "7x10" | "10x13" | "12x18" | "15x20";
export type KitchenSize = "8x10" | "10x12" | "12x14";
export type KitchenType = "Parallel" | "L-shaped" | "Island";
export type PoojaSize = "9x9" | "3x3";

export type RoomSet = {
  master: {
    size: BedroomSize;
    wardrobe: { enabled: boolean; pkgOverride?: Package | null };
    studyTable: { enabled: boolean; pkgOverride?: Package | null };
    tvUnit: { enabled: boolean; pkgOverride?: Package | null };
    bedBackPanel: { enabled: boolean; pkgOverride?: Package | null };
  };
  children: {
    size: BedroomSize;
    wardrobe: { enabled: boolean; pkgOverride?: Package | null };
    studyTable: { enabled: boolean; pkgOverride?: Package | null };
    bedBackPanel: { enabled: boolean; pkgOverride?: Package | null };
  };
  guest: {
    size: BedroomSize;
    wardrobe: { enabled: boolean; pkgOverride?: Package | null };
    studyTable: { enabled: boolean; pkgOverride?: Package | null };
    bedBackPanel: { enabled: boolean; pkgOverride?: Package | null };
  };
  living: {
    size: LivingSize;
    tvDrawerUnit: { enabled: boolean; pkgOverride?: Package | null };
    tvPanel: {
      enabled: boolean;
      panelSqft?: number;
      pkgOverride?: Package | null;
    };
  };
  pooja: {
    size: PoojaSize;
    unit: { enabled: boolean; pkgOverride?: Package | null };
    doors: { enabled: boolean; qty?: number; pkgOverride?: Package | null };
  };
  kitchen: {
    enabled: boolean;
    type?: KitchenType;
    size?: KitchenSize;
    baseUnit: { enabled: boolean; pkgOverride?: Package | null };
    tandemBaskets: {
      enabled: boolean;
      qty?: number;
      pkgOverride?: Package | null;
    };
    bottlePullout: {
      enabled: boolean;
      qty?: number;
      pkgOverride?: Package | null;
    };
    cornerUnit: { enabled: boolean; pkgOverride?: Package | null };
    wickerBasket: { enabled: boolean; pkgOverride?: Package | null };
  };
};

export type AddOns = {
  sofa: { enabled: boolean; qty?: number; pkgOverride?: Package | null };
  diningTable: { enabled: boolean; qty?: number; pkgOverride?: Package | null };
  carpets: { enabled: boolean; qty?: number; pkgOverride?: Package | null };
  designerLights: {
    enabled: boolean;
    qty?: number;
    pkgOverride?: Package | null;
  };
  curtains: { enabled: boolean; qty?: number; pkgOverride?: Package | null };
};

export type EstimatorState = {
  basics: Basics;
  single: SingleLine;
  rooms: RoomSet;
  addons: AddOns;
  totals: {
    low: number;
    high: number;
    byCategory: Record<string, { low: number; high: number }>;
  };
};

export type PriceRange = {
  low: number;
  high: number;
};

export type ExactLine = {
  category:
    | "Single Line Items"
    | "Bedrooms"
    | "Living Room"
    | "Kitchen"
    | "Pooja Room"
    | "Add-ons";
  item: string;
  pkg: Package;
  details?: string; // e.g., "10x12 • 25 sqft × ₹3,000"
  quantity?: number; // optional count
  amount: number; // exact ₹
};

export type ExactBreakdown = {
  lines: ExactLine[];
  totalsByCategory: Record<ExactLine["category"], number>;
  grandTotal: number;
};

export const pkgFor = (
  override: Package | null | undefined,
  globalPkg: Package
): Package => override ?? globalPkg;
