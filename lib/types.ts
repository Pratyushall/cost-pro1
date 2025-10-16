export type BHK =
  | "studio"
  | "1bhk"
  | "2bhk"
  | "3bhk"
  | "4bhk"
  | "5bhk"
  | "custom";
export type Package = "Premium" | "Luxury";
export type AreaSource = "manual" | "estimated" | "bhk-derived";

export type BedroomSize = "14x16" | "10x12" | "10x10" | "11.5x11.5" | "custom";
export type LivingSize = "7x10" | "10x13" | "12x18" | "15x20" | "custom";
export type KitchenSize = "8x10" | "10x12" | "12x14" | "custom";
export type KitchenType = "Parallel" | "L-shaped" | "Island";
export type PoojaSize = "9x9" | "3x3" | "custom";
export type BedroomRole = "Master" | "Kid" | "Guest" | "Other";
export type RoomPreset =
  | "Bare"
  | "Essentials"
  | "Storage+Study"
  | "Feature Wall";
export type TVPanelMode = "percent" | "sqft";
export type TVPanelPreset = "Small" | "Medium" | "Feature";

export interface RoomItem {
  enabled: boolean;
  pkgOverride?: Package;
}

export interface RoomItemWithQty extends RoomItem {
  qty: number;
}

export interface BedroomItems {
  wardrobe: RoomItem;
  studyTable: RoomItem;
  tvUnit?: RoomItem;
  bedBackPanel: RoomItem;
}

export interface Bedroom {
  id: string;
  role: BedroomRole;
  size: BedroomSize;
  customSize?: string;
  items: BedroomItems;
}

export interface LivingRoom {
  size: LivingSize;
  customSize?: string;
  tvDrawerUnit: RoomItem;
  tvPanel: {
    enabled: boolean;
    mode: TVPanelMode;
    panelPercent?: number;
    panelSqft?: number;
    pkgOverride?: Package;
  };
}

export interface PoojaRoom {
  size: PoojaSize;
  customSize?: string;
  doors: RoomItemWithQty;
}

export interface Kitchen {
  type: KitchenType;
  size: KitchenSize;
  customSize?: string;
  baseUnit: RoomItem;
  tandemBaskets: RoomItemWithQty;
  bottlePullout: RoomItemWithQty;
  cornerUnit: RoomItem;
  wickerBasket: RoomItem;
}

export interface RoomsState {
  prefilled: boolean;
  bedrooms: Bedroom[];
  living: LivingRoom;
  kitchen: Kitchen;
  pooja: PoojaRoom;
}

export interface SingleLineItem {
  enabled: boolean;
  areaMode?: "percent" | "sqft";
  areaPercent?: number;
  areaSqft: number;
  pkgOverride?: Package;
}

export type AddonKey =
  | "sofa"
  | "diningTable"
  | "curtains"
  | "lights"
  | "wallpaper"
  | "mirrors"
  | "plants";

export interface AddonItem {
  enabled: boolean;
  qty: number;
  pkgOverride?: Package;
}

export type AddonsState = Record<AddonKey, AddonItem>;

export interface Basics {
  carpetAreaSqft: number;
  bhk?: BHK;
  pkg?: Package;
  areaSource: AreaSource;
  derivedSqft?: number;
}

export interface SingleLine {
  falseCeiling: SingleLineItem;
  painting: SingleLineItem;
  electricalWiring: SingleLineItem;
}

export interface Addons {
  sofa: AddonItem;
  diningTable: AddonItem;
  curtains: AddonItem;
  lights: AddonItem;
  wallpaper: AddonItem;
  mirrors: AddonItem;
  plants: AddonItem;
}

export interface Rooms {
  bedrooms: Bedroom[];
  living: LivingRoom;
  pooja: PoojaRoom;
  kitchen: Kitchen;
  prefilled: boolean;
}

export interface EstimatorState {
  basics: Basics;
  singleLine: SingleLine;
  rooms: Rooms;
  addons: Addons;
}

export interface LineItem {
  label: string;
  low: number;
  high: number;
}

export interface CategoryBreakdown {
  label: string;
  low: number;
  high: number;
  items: LineItem[];
}

export interface RangeBreakdown {
  categories: CategoryBreakdown[];
  grandLow: number;
  grandHigh: number;
}
