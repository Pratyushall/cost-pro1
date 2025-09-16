export type Package = "Premium" | "Luxury";
export type BHK = "2bhk" | "3bhk" | "4bhk";

export type Basics = {
  carpetAreaSqft: number;
  bhk: BHK;
  pkg: Package;
};

export type SingleLine = {
  falseCeiling: { enabled: boolean; areaSqft?: number };
  ceilingPainting: { enabled: boolean; areaSqft?: number };
  electricalWiring: { enabled: boolean; areaSqft?: number };
};

export type BedroomSize = "14x16" | "10x12" | "10x10" | "11.5x11.5";
export type LivingSize = "7x10" | "10x13" | "12x18" | "15x20";
export type KitchenSize = "8x10" | "10x12" | "12x14";
export type KitchenType = "Parallel" | "L-shaped" | "Island";
export type PoojaSize = "9x9" | "3x3";

export type RoomSet = {
  master: {
    size: BedroomSize;
    wardrobe: boolean;
    studyTable: boolean;
    tvUnit: boolean;
    bedBackPanel: boolean;
  };
  children: {
    size: BedroomSize;
    wardrobe: boolean;
    studyTable: boolean;
    bedBackPanel: boolean;
  };
  guest: {
    size: BedroomSize;
    wardrobe: boolean;
    studyTable: boolean;
    bedBackPanel: boolean;
  };
  living: {
    size: LivingSize;
    tvDrawerUnit: boolean;
    tvPanelSqft?: number;
  };
  pooja: {
    size: PoojaSize;
    unit: boolean;
    doorsQty: number;
  };
  kitchen: {
    size: KitchenSize;
    type: KitchenType;
    baseUnit: boolean;
    tandemBaskets: number;
    bottlePullout: number;
    cornerUnit: boolean;
    wickerBasket: boolean;
  };
};

export type AddOns = {
  sofa: number;
  diningTable: number;
  carpets: number;
  designerLights: number;
  curtains: number;
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
