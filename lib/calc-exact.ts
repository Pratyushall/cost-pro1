import { rates } from "./pricing";
import type { EstimatorState, Package } from "./types";

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
  details?: string;
  amount: number;
};

export type ExactBreakdown = {
  lines: ExactLine[];
  totalsByCategory: Record<ExactLine["category"], number>;
  grandTotal: number;
};

const fmt = (n: number) =>
  new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);

const pkgFor = (over: Package | null | undefined, globalPkg: Package) =>
  (over ?? globalPkg) as Package;

export function computeExactBreakdown(state: EstimatorState): ExactBreakdown {
  const lines: ExactLine[] = [];
  const catTotal: ExactBreakdown["totalsByCategory"] = {
    "Single Line Items": 0,
    Bedrooms: 0,
    "Living Room": 0,
    Kitchen: 0,
    "Pooja Room": 0,
    "Add-ons": 0,
  };

  const add = (
    category: ExactLine["category"],
    item: string,
    pkg: Package,
    amount: number,
    details?: string
  ) => {
    lines.push({ category, item, pkg, details, amount });
    catTotal[category] += amount;
  };

  const G = state.basics.pkg as Package;

  // -------- Single Line --------
  const SL = state.single;
  const areaDefault = state.basics.carpetAreaSqft || 0;

  if (SL.falseCeiling?.enabled) {
    const pkg = pkgFor(SL.falseCeiling.pkgOverride, G);
    const area = SL.falseCeiling.areaSqft ?? areaDefault;
    const rate = rates.singleLinePerSqft[pkg].falseCeiling;
    add(
      "Single Line Items",
      "False Ceiling",
      pkg,
      area * rate,
      `${fmt(area)} sqft × ₹${fmt(rate)}`
    );
  }
  if (SL.painting?.enabled) {
    const pkg = pkgFor(SL.painting.pkgOverride, G);
    const area = SL.painting.areaSqft ?? areaDefault;
    const rate = rates.singleLinePerSqft[pkg].ceilingPainting;
    add(
      "Single Line Items",
      "Painting",
      pkg,
      area * rate,
      `${fmt(area)} sqft × ₹${fmt(rate)}`
    );
  }
  if (SL.electricalWiring?.enabled) {
    const pkg = pkgFor(SL.electricalWiring.pkgOverride, G);
    const area = SL.electricalWiring.areaSqft ?? areaDefault;
    const rate = rates.singleLinePerSqft[pkg].electricalWiring;
    add(
      "Single Line Items",
      "Electrical & Wiring",
      pkg,
      area * rate,
      `${fmt(area)} sqft × ₹${fmt(rate)}`
    );
  }

  // bedroom helper
  const addBedroom = (
    label: string,
    size: "14x16" | "10x12" | "10x10" | "11.5x11.5",
    room: any
  ) => {
    if (room.wardrobe?.enabled) {
      const pkg = pkgFor(room.wardrobe.pkgOverride, G);
      const area = rates.wardrobeArea[pkg][size];
      const rate = rates.wardrobePricePerSqft[pkg][size];
      add(
        "Bedrooms",
        `${label} • Wardrobe`,
        pkg,
        area * rate,
        `${size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
      );
    }
    if (room.studyTable?.enabled) {
      const pkg = pkgFor(room.studyTable.pkgOverride, G);
      const area = rates.studyTableAreaSqft[size];
      const rate = rates.studyTablePricePerSqft[pkg][size];
      add(
        "Bedrooms",
        `${label} • Study Table`,
        pkg,
        area * rate,
        `${size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
      );
    }
    if (room.tvUnit?.enabled) {
      const pkg = pkgFor(room.tvUnit.pkgOverride, G);
      const area = rates.tvUnitAreaSqftBedroom[size];
      const rate = rates.tvUnitPricePerSqftBedroom[pkg][size];
      add(
        "Bedrooms",
        `${label} • TV Unit`,
        pkg,
        area * rate,
        `${size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
      );
    }
    if (room.bedBackPanel?.enabled) {
      const pkg = pkgFor(room.bedBackPanel.pkgOverride, G);
      const area = rates.bedBackPanelAreaSqft[size];
      const rate = rates.bedBackPanelPricePerSqft[size];
      add(
        "Bedrooms",
        `${label} • Bed Back Panel`,
        pkg,
        area * rate,
        `${size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
      );
    }
  };

  addBedroom("Master Bedroom", state.rooms.master.size, state.rooms.master);
  addBedroom(
    "Children Bedroom",
    state.rooms.children.size,
    state.rooms.children
  );
  addBedroom("Guest Bedroom", state.rooms.guest.size, state.rooms.guest);

  // -------- Living --------
  const L = state.rooms.living;
  if (L?.tvDrawerUnit?.enabled) {
    const pkg = pkgFor(L.tvDrawerUnit.pkgOverride, G);
    const rate = rates.tvDrawerUnitPrice[pkg][L.size];
    add("Living Room", "TV Drawer Unit", pkg, rate, `${L.size}`);
  }
  if (L?.tvPanel?.enabled) {
    const pkg = pkgFor(L.tvPanel.pkgOverride, G);
    const sqft = Number(L.tvPanel.panelSqft || 0);
    const rate = rates.tvPanelPricePerSqft[pkg][L.size];
    if (sqft > 0)
      add(
        "Living Room",
        "TV Unit Panelling",
        pkg,
        sqft * rate,
        `${L.size} • ${fmt(sqft)} sqft × ₹${fmt(rate)}`
      );
  }

  // -------- Kitchen --------
  const K = state.rooms.kitchen;
  if (K?.enabled && K.size && K.type) {
    const area = rates.kitchenAreaSqft[K.type][K.size];

    if (K.baseUnit?.enabled) {
      const pkg = pkgFor(K.baseUnit.pkgOverride, G);
      const rate = rates.kitchenBasePricePerSqft[pkg];
      add(
        "Kitchen",
        "Base Unit",
        pkg,
        area * rate,
        `${K.type} • ${K.size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
      );
    }
    if (K.tandemBaskets?.enabled) {
      const pkg = pkgFor(K.tandemBaskets.pkgOverride, G);
      const qty = Number(K.tandemBaskets.qty || 0);
      const rate = rates.kitchenAccessories.tandemBasket[pkg];
      if (qty > 0)
        add(
          "Kitchen",
          "Tandem Baskets",
          pkg,
          qty * rate,
          `${qty} × ₹${fmt(rate)}`
        );
    }
    if (K.bottlePullout?.enabled) {
      const pkg = pkgFor(K.bottlePullout.pkgOverride, G);
      const qty = Number(K.bottlePullout.qty || 0);
      const rate = rates.kitchenAccessories.bottlePullout[pkg];
      if (qty > 0)
        add(
          "Kitchen",
          "Bottle Pullout",
          pkg,
          qty * rate,
          `${qty} × ₹${fmt(rate)}`
        );
    }
    if (K.cornerUnit?.enabled) {
      const pkg = pkgFor(K.cornerUnit.pkgOverride, G);
      const rate = rates.kitchenAccessories.cornerUnit[pkg];
      add("Kitchen", "Corner Unit", pkg, rate);
    }
    if (K.wickerBasket?.enabled) {
      const pkg = pkgFor(K.wickerBasket.pkgOverride, G);
      const rate = rates.kitchenAccessories.wickerBasket[pkg];
      add("Kitchen", "Wicker Basket", pkg, rate);
    }
  }

  // -------- Pooja --------
  const P = state.rooms.pooja;
  if (P?.unit?.enabled) {
    const pkg = pkgFor(P.unit.pkgOverride, G);
    const area = rates.poojaUnitAreaSqft[P.size];
    const rate = rates.poojaPricePerSqft[pkg][P.size];
    add(
      "Pooja Room",
      "Pooja Unit",
      pkg,
      area * rate,
      `${P.size} • ${fmt(area)} sqft × ₹${fmt(rate)}`
    );
  }
  if (P?.doors?.enabled) {
    const pkg = pkgFor(P.doors.pkgOverride, G);
    const qty = Number(P.doors.qty || 0);
    const rate = rates.poojaDoorPrice[pkg][P.size];
    if (qty > 0)
      add("Pooja Room", "Doors", pkg, qty * rate, `${qty} × ₹${fmt(rate)}`);
  }

  // -------- Add-ons --------
  const A = state.addons;
  const bhk = state.basics.bhk as "2bhk" | "3bhk" | "4bhk";
  const addOn = (key: keyof typeof rates.addOns, label: string, node: any) => {
    if (!node?.enabled) return;
    const pkg = pkgFor(node.pkgOverride, G);
    const qty = Number(node.qty || 0);
    const price = (rates.addOns as any)[key]?.[bhk]?.[pkg] ?? 0;
    if (qty > 0)
      add("Add-ons", label, pkg, qty * price, `${qty} × ₹${fmt(price)}`);
  };
  addOn("sofa", "Sofa", A.sofa);
  addOn("diningTable", "Dining Table", A.diningTable);
  addOn("carpets", "Carpets", A.carpets);
  addOn("designerLights", "Designer Lights", A.designerLights);
  addOn("curtains", "Curtains", A.curtains);

  const grandTotal = Object.values(catTotal).reduce((a, b) => a + b, 0);
  return { lines, totalsByCategory: catTotal, grandTotal };
}
