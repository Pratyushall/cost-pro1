import { rates } from "./pricing";
import type { EstimatorState, PriceRange, Package, BedroomSize } from "./types";

// Server-side calculation functions - never expose exact prices to client
export function calcSingleLine(state: EstimatorState): number {
  const { single, basics } = state;
  let total = 0;

  Object.entries(single).forEach(([key, item]) => {
    if (item.enabled && item.areaSqft) {
      const rateKey = key as keyof typeof rates.singleLinePerSqft.Premium;
      const rate = rates.singleLinePerSqft[basics.pkg][rateKey];
      total += item.areaSqft * rate;
    }
  });

  return total;
}

export function calcWardrobe(
  roomSize: BedroomSize,
  pkg: Package,
  enabled: boolean
): number {
  if (!enabled) return 0;

  const area = rates.wardrobeArea[pkg][roomSize];
  const pricePerSqft = rates.wardrobePricePerSqft[pkg][roomSize];
  return area * pricePerSqft;
}

export function calcStudyTable(
  roomSize: BedroomSize,
  pkg: Package,
  enabled: boolean
): number {
  if (!enabled) return 0;

  const area = rates.studyTableAreaSqft[roomSize];
  const pricePerSqft = rates.studyTablePricePerSqft[pkg][roomSize];
  return area * pricePerSqft;
}

export function calcTvUnitBedroom(
  roomSize: BedroomSize,
  pkg: Package,
  enabled: boolean
): number {
  if (!enabled) return 0;

  const area = rates.tvUnitAreaSqftBedroom[roomSize];
  const pricePerSqft = rates.tvUnitPricePerSqftBedroom[pkg][roomSize];
  return area * pricePerSqft;
}

export function calcBedBackPanel(
  roomSize: BedroomSize,
  enabled: boolean
): number {
  if (!enabled) return 0;

  const area = rates.bedBackPanelAreaSqft[roomSize];
  const pricePerSqft = rates.bedBackPanelPricePerSqft[roomSize];
  return area * pricePerSqft;
}

export function calcBedrooms(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // Master bedroom
  total += calcWardrobe(rooms.master.size, basics.pkg, rooms.master.wardrobe);
  total += calcStudyTable(
    rooms.master.size,
    basics.pkg,
    rooms.master.studyTable
  );
  total += calcTvUnitBedroom(
    rooms.master.size,
    basics.pkg,
    rooms.master.tvUnit
  );
  total += calcBedBackPanel(rooms.master.size, rooms.master.bedBackPanel);

  // Children bedroom
  total += calcWardrobe(
    rooms.children.size,
    basics.pkg,
    rooms.children.wardrobe
  );
  total += calcStudyTable(
    rooms.children.size,
    basics.pkg,
    rooms.children.studyTable
  );
  total += calcBedBackPanel(rooms.children.size, rooms.children.bedBackPanel);

  // Guest bedroom
  total += calcWardrobe(rooms.guest.size, basics.pkg, rooms.guest.wardrobe);
  total += calcStudyTable(rooms.guest.size, basics.pkg, rooms.guest.studyTable);
  total += calcBedBackPanel(rooms.guest.size, rooms.guest.bedBackPanel);

  return total;
}

export function calcLiving(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // TV Drawer Unit
  if (rooms.living.tvDrawerUnit) {
    total += rates.tvDrawerUnitPrice[basics.pkg][rooms.living.size];
  }

  // TV Panel
  if (rooms.living.tvPanelSqft && rooms.living.tvPanelSqft > 0) {
    const pricePerSqft =
      rates.tvPanelPricePerSqft[basics.pkg][rooms.living.size];
    total += rooms.living.tvPanelSqft * pricePerSqft;
  }

  return total;
}

export function calcPooja(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // Pooja Unit
  if (rooms.pooja.unit) {
    const area = rates.poojaUnitAreaSqft[rooms.pooja.size];
    const pricePerSqft = rates.poojaPricePerSqft[basics.pkg][rooms.pooja.size];
    total += area * pricePerSqft;
  }

  // Pooja Doors
  if (rooms.pooja.doorsQty > 0) {
    const doorPrice = rates.poojaDoorPrice[basics.pkg][rooms.pooja.size];
    total += rooms.pooja.doorsQty * doorPrice;
  }

  return total;
}

export function calcKitchen(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // Base Unit
  if (rooms.kitchen.baseUnit) {
    const area = rates.kitchenAreaSqft[rooms.kitchen.type][rooms.kitchen.size];
    const pricePerSqft = rates.kitchenBasePricePerSqft[basics.pkg];
    total += area * pricePerSqft;
  }

  // Accessories
  const accessories = rates.kitchenAccessories;

  if (rooms.kitchen.tandemBaskets > 0) {
    total += rooms.kitchen.tandemBaskets * accessories.tandemBasket[basics.pkg];
  }

  if (rooms.kitchen.bottlePullout > 0) {
    total +=
      rooms.kitchen.bottlePullout * accessories.bottlePullout[basics.pkg];
  }

  if (rooms.kitchen.cornerUnit) {
    total += accessories.cornerUnit[basics.pkg];
  }

  if (rooms.kitchen.wickerBasket) {
    total += accessories.wickerBasket[basics.pkg];
  }

  return total;
}

export function calcAddons(state: EstimatorState): number {
  const { addons, basics } = state;
  let total = 0;

  Object.entries(addons).forEach(([key, quantity]) => {
    if (quantity > 0) {
      const addonKey = key as keyof typeof rates.addOns;
      const price = rates.addOns[addonKey][basics.bhk][basics.pkg];
      total += quantity * price;
    }
  });

  return total;
}

export function calculateExactTotals(state: EstimatorState) {
  const singleLine = calcSingleLine(state);
  const bedrooms = calcBedrooms(state);
  const living = calcLiving(state);
  const pooja = calcPooja(state);
  const kitchen = calcKitchen(state);
  const addons = calcAddons(state);

  const grandTotal = singleLine + bedrooms + living + pooja + kitchen + addons;

  return {
    singleLine,
    bedrooms,
    living,
    pooja,
    kitchen,
    addons,
    grandTotal,
    byCategory: {
      singleLine: { exact: singleLine },
      bedrooms: { exact: bedrooms },
      living: { exact: living },
      pooja: { exact: pooja },
      kitchen: { exact: kitchen },
      addons: { exact: addons },
    },
  };
}

// Convert exact totals to ranges for client display
export function convertToRanges(
  exactTotals: ReturnType<typeof calculateExactTotals>
) {
  const createRange = (exact: number): PriceRange => ({
    low: Math.round(exact * 0.92),
    high: Math.round(exact * 1.08),
  });

  return {
    singleLine: createRange(exactTotals.singleLine),
    bedrooms: createRange(exactTotals.bedrooms),
    living: createRange(exactTotals.living),
    pooja: createRange(exactTotals.pooja),
    kitchen: createRange(exactTotals.kitchen),
    addons: createRange(exactTotals.addons),
    grandTotal: createRange(exactTotals.grandTotal),
    byCategory: Object.fromEntries(
      Object.entries(exactTotals.byCategory).map(([key, value]) => [
        key,
        createRange(value.exact),
      ])
    ),
  };
}
