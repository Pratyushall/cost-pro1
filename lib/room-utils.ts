// Utilities for room size parsing, presets, and BHK-based prefilling

import type {
  BHK,
  BedroomSize,
  LivingSize,
  KitchenSize,
  PoojaSize,
  Bedroom,
  RoomPreset,
  Rooms,
  BedroomItems,
} from "./types";

/**
 * Normalize room size input to square feet
 * Accepts: "10x12", "11.5 x 11.5", "85 m²", "85m2"
 */
export function normalizeRoomSize(raw: string): number {
  const trimmed = raw.trim().toLowerCase();

  // Handle metric (m² or m2)
  const metricMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*m[²2]?$/);
  if (metricMatch) {
    const sqm = Number.parseFloat(metricMatch[1]);
    return Math.round(sqm * 10.764); // Convert m² to sqft
  }

  // Handle dimensions (10x12, 11.5 x 11.5)
  const dimMatch = trimmed.match(/^(\d+(?:\.\d+)?)\s*[x×]\s*(\d+(?:\.\d+)?)$/);
  if (dimMatch) {
    const width = Number.parseFloat(dimMatch[1]);
    const height = Number.parseFloat(dimMatch[2]);
    return Math.round(width * height);
  }

  // Fallback: try to parse as number
  const num = Number.parseFloat(trimmed);
  return isNaN(num) ? 0 : Math.round(num);
}

/**
 * Convert standard size strings to sqft
 */
export function sizeToSqft(
  size: BedroomSize | LivingSize | KitchenSize | PoojaSize,
  customSize?: string
): number {
  if (size === "custom" && customSize) {
    return normalizeRoomSize(customSize);
  }

  // Parse standard sizes like "10x12"
  return normalizeRoomSize(size);
}

/**
 * Room presets that toggle multiple items
 */
export const ROOM_PRESETS: Record<
  RoomPreset,
  Partial<Record<keyof BedroomItems, boolean>>
> = {
  Bare: {
    wardrobe: false,
    studyTable: false,
    tvUnit: false,
    bedBackPanel: false,
  },
  Essentials: {
    wardrobe: true,
    studyTable: false,
    tvUnit: false,
    bedBackPanel: false,
  },
  "Storage+Study": {
    wardrobe: true,
    studyTable: true,
    tvUnit: false,
    bedBackPanel: false,
  },
  "Feature Wall": {
    wardrobe: true,
    studyTable: false,
    tvUnit: false,
    bedBackPanel: true,
  },
};

/**
 * Apply a preset to bedroom items
 */
export function applyRoomPreset(
  currentItems: BedroomItems,
  preset: RoomPreset
): BedroomItems {
  const presetConfig = ROOM_PRESETS[preset];
  const updated = { ...currentItems };

  Object.entries(presetConfig).forEach(([key, enabled]) => {
    const itemKey = key as keyof BedroomItems;
    if (updated[itemKey]) {
      updated[itemKey] = { ...updated[itemKey], enabled };
    }
  });

  return updated;
}

/**
 * Get typical bedroom count and sizes based on BHK
 */
export function getTypicalBedroomsForBHK(bhk?: BHK): Bedroom[] {
  if (!bhk || bhk === "custom") return [];

  const bhkNum = bhk === "studio" ? 0 : Number.parseInt(bhk.replace("bhk", ""));

  if (bhkNum === 0) {
    // Studio: no separate bedrooms
    return [];
  }

  const bedrooms: Bedroom[] = [];

  // Master bedroom (always present for 1+ BHK)
  bedrooms.push({
    id: crypto.randomUUID(),
    role: "Master",
    size: "14x16",
    items: {
      wardrobe: { enabled: true },
      studyTable: { enabled: false },
      tvUnit: { enabled: false },
      bedBackPanel: { enabled: false },
    },
  });

  // Additional bedrooms
  for (let i = 1; i < bhkNum; i++) {
    bedrooms.push({
      id: crypto.randomUUID(),
      role: i === 1 ? "Kid" : "Guest",
      size: "10x12",
      items: {
        wardrobe: { enabled: true },
        studyTable: { enabled: false },
        bedBackPanel: { enabled: false },
      },
    });
  }

  return bedrooms;
}

/**
 * Get typical living room size based on BHK
 */
export function getTypicalLivingSizeForBHK(bhk?: BHK): LivingSize {
  if (!bhk || bhk === "custom") return "10x13";

  const bhkNum = bhk === "studio" ? 0 : Number.parseInt(bhk.replace("bhk", ""));

  if (bhkNum === 0) return "7x10"; // Studio
  if (bhkNum <= 2) return "10x13";
  if (bhkNum <= 3) return "12x18";
  return "15x20";
}

/**
 * Get typical kitchen size based on BHK
 */
export function getTypicalKitchenSizeForBHK(bhk?: BHK): KitchenSize {
  if (!bhk || bhk === "custom") return "10x12";

  const bhkNum = bhk === "studio" ? 0 : Number.parseInt(bhk.replace("bhk", ""));

  if (bhkNum === 0 || bhkNum === 1) return "8x10";
  if (bhkNum <= 3) return "10x12";
  return "12x14";
}

/**
 * Prefill rooms based on BHK
 */
export function prefillRoomsForBHK(bhk?: BHK): Partial<Rooms> {
  return {
    bedrooms: getTypicalBedroomsForBHK(bhk),
    living: {
      size: getTypicalLivingSizeForBHK(bhk),
      tvDrawerUnit: { enabled: true },
      tvPanel: {
        enabled: false,
        mode: "sqft",
        panelSqft: 60,
      },
    },
    kitchen: {
      type: "L-shaped",
      size: getTypicalKitchenSizeForBHK(bhk),
      baseUnit: { enabled: true },
      tandemBaskets: { enabled: false, qty: 0 },
      bottlePullout: { enabled: false, qty: 0 },
      cornerUnit: { enabled: false },
      wickerBasket: { enabled: false },
    },
    pooja: {
      size: "3x3",
      doors: { enabled: false, qty: 0 },
    },
    prefilled: true,
  };
}

/**
 * Get suggested accessory kit for kitchen based on type/size
 */
export function getSuggestedKitchenAccessories(
  type: string,
  size: KitchenSize
): { tandemBaskets: number; bottlePullout: number } {
  const sizeNum = sizeToSqft(size, undefined);

  // Larger kitchens get more accessories
  if (sizeNum >= 140) {
    return { tandemBaskets: 3, bottlePullout: 2 };
  } else if (sizeNum >= 100) {
    return { tandemBaskets: 2, bottlePullout: 1 };
  } else {
    return { tandemBaskets: 1, bottlePullout: 1 };
  }
}

/**
 * Validate room size with soft bounds
 */
export function validateRoomSize(
  sqft: number,
  roomType: "bedroom" | "living" | "kitchen" | "pooja"
): { valid: boolean; warning?: string } {
  const bounds = {
    bedroom: { min: 80, max: 400 },
    living: { min: 70, max: 600 },
    kitchen: { min: 60, max: 300 },
    pooja: { min: 9, max: 150 },
  };

  const { min, max } = bounds[roomType];

  if (sqft < min) {
    return {
      valid: true,
      warning: `Unusually small (${sqft} sq ft). Typical minimum is ${min} sq ft.`,
    };
  }

  if (sqft > max) {
    return {
      valid: true,
      warning: `Unusually large (${sqft} sq ft). Typical maximum is ${max} sq ft.`,
    };
  }

  return { valid: true };
}
