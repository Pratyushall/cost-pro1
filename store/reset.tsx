import { useEstimatorStore } from "./estimator";

export function resetStore() {
  const store = useEstimatorStore.getState();

  // Reset to initial state
  store.setCurrentStep(1);

  store.setBasics({
    carpetAreaSqft: 0,
    bhk: undefined,
    pkg: "Premium",
    areaSource: "estimated",
    derivedSqft: undefined,
  });

  store.setSingleLine({
    falseCeiling: {
      enabled: false,
      areaMode: "percent",
      areaPercent: 100,
      areaSqft: 0,
    },
    painting: {
      enabled: false,
      areaMode: "percent",
      areaPercent: 100,
      areaSqft: 0,
    },
    electricalWiring: {
      enabled: false,
      areaMode: "percent",
      areaPercent: 100,
      areaSqft: 0,
    },
  });

  store.setRooms({
    prefilled: false,
    bedrooms: [],
    living: {
      size: "12x18",
      tvDrawerUnit: { enabled: false },
      tvPanel: { enabled: false, mode: "sqft", panelSqft: 60 },
    },
    kitchen: {
      type: "L-shaped",
      size: "10x12",
      baseUnit: { enabled: false },
      tandemBaskets: { enabled: false, qty: 0 },
      bottlePullout: { enabled: false, qty: 0 },
      cornerUnit: { enabled: false },
      wickerBasket: { enabled: false },
    },
    pooja: {
      size: "3x3",
      doors: { enabled: false, qty: 0 },
    },
  });

  store.setAddons({
    sofa: { enabled: false, qty: 0 },
    diningTable: { enabled: false, qty: 0 },
    curtains: { enabled: false, qty: 0 },
    lights: { enabled: false, qty: 0 },
  });

  // Clear localStorage
  localStorage.removeItem("estimator_basics_v1");
  sessionStorage.removeItem("estimator_defaulted_message");
}
