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
  total += calcWardrobe(
    rooms.master.size,
    basics.pkg,
    rooms.master.wardrobe?.enabled || false
  );
  total += calcStudyTable(
    rooms.master.size,
    basics.pkg,
    rooms.master.studyTable?.enabled || false
  );
  total += calcTvUnitBedroom(
    rooms.master.size,
    basics.pkg,
    rooms.master.tvUnit?.enabled || false
  );
  total += calcBedBackPanel(
    rooms.master.size,
    rooms.master.bedBackPanel?.enabled || false
  );

  // Children bedroom
  total += calcWardrobe(
    rooms.children.size,
    basics.pkg,
    rooms.children.wardrobe?.enabled || false
  );
  total += calcStudyTable(
    rooms.children.size,
    basics.pkg,
    rooms.children.studyTable?.enabled || false
  );
  total += calcBedBackPanel(
    rooms.children.size,
    rooms.children.bedBackPanel?.enabled || false
  );

  // Guest bedroom
  total += calcWardrobe(
    rooms.guest.size,
    basics.pkg,
    rooms.guest.wardrobe?.enabled || false
  );
  total += calcStudyTable(
    rooms.guest.size,
    basics.pkg,
    rooms.guest.studyTable?.enabled || false
  );
  total += calcBedBackPanel(
    rooms.guest.size,
    rooms.guest.bedBackPanel?.enabled || false
  );

  return total;
}

export function calcLiving(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // TV Drawer Unit
  if (rooms.living.tvDrawerUnit?.enabled) {
    total += rates.tvDrawerUnitPrice[basics.pkg][rooms.living.size];
  }

  // TV Panel
  const tvPanelSqft = rooms.living.tvPanel?.panelSqft || 0;
  if (rooms.living.tvPanel?.enabled && tvPanelSqft > 0) {
    const pricePerSqft =
      rates.tvPanelPricePerSqft[basics.pkg][rooms.living.size];
    total += tvPanelSqft * pricePerSqft;
  }

  return total;
}

export function calcPooja(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // Pooja Unit
  if (rooms.pooja.unit?.enabled && rooms.pooja.size) {
    const area = rates.poojaUnitAreaSqft[rooms.pooja.size];
    const pricePerSqft = rates.poojaPricePerSqft[basics.pkg][rooms.pooja.size];
    total += area * pricePerSqft;
  }

  // Pooja Doors
  const doorsQty = rooms.pooja.doors?.qty || 0;
  if (rooms.pooja.doors?.enabled && doorsQty > 0 && rooms.pooja.size) {
    const doorPrice = rates.poojaDoorPrice[basics.pkg][rooms.pooja.size];
    total += doorsQty * doorPrice;
  }

  return total;
}

export function calcKitchen(state: EstimatorState): number {
  const { rooms, basics } = state;
  let total = 0;

  // Base Unit
  if (
    rooms.kitchen.baseUnit?.enabled &&
    rooms.kitchen.type &&
    rooms.kitchen.size
  ) {
    const area = rates.kitchenAreaSqft[rooms.kitchen.type][rooms.kitchen.size];
    const pricePerSqft = rates.kitchenBasePricePerSqft[basics.pkg];
    total += area * pricePerSqft;
  }

  // Accessories
  const accessories = rates.kitchenAccessories;

  const tandemBasketsQty = rooms.kitchen.tandemBaskets?.qty || 0;
  if (tandemBasketsQty > 0) {
    total += tandemBasketsQty * accessories.tandemBasket[basics.pkg];
  }

  const bottlePulloutQty = rooms.kitchen.bottlePullout?.qty || 0;
  if (bottlePulloutQty > 0) {
    total += bottlePulloutQty * accessories.bottlePullout[basics.pkg];
  }

  if (rooms.kitchen.cornerUnit?.enabled) {
    total += accessories.cornerUnit[basics.pkg];
  }

  if (rooms.kitchen.wickerBasket?.enabled) {
    total += accessories.wickerBasket[basics.pkg];
  }

  return total;
}

export function calcAddons(state: EstimatorState): number {
  const { addons, basics } = state;
  let total = 0;

  Object.entries(addons).forEach(([key, item]) => {
    const quantity =
      typeof item === "object" && item.enabled ? item.qty || 0 : 0;
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
