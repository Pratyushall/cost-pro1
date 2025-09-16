import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EstimatorState,
  Basics,
  SingleLine,
  RoomSet,
  AddOns,
} from "@/lib/types";

interface EstimatorStore extends EstimatorState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setBasics: (basics: Partial<Basics>) => void;
  setSingleLine: (single: Partial<SingleLine>) => void;
  setRooms: (rooms: Partial<RoomSet>) => void;
  setAddons: (addons: Partial<AddOns>) => void;
  setTotals: (totals: EstimatorState["totals"]) => void;
  reset: () => void;
}

const initialState: EstimatorState = {
  basics: {
    carpetAreaSqft: 0,
    bhk: "3bhk",
    pkg: "Premium",
  },
  single: {
    falseCeiling: { enabled: false },
    ceilingPainting: { enabled: false },
    electricalWiring: { enabled: false },
  },
  rooms: {
    master: {
      size: "14x16",
      wardrobe: false,
      studyTable: false,
      tvUnit: false,
      bedBackPanel: false,
    },
    children: {
      size: "10x12",
      wardrobe: false,
      studyTable: false,
      bedBackPanel: false,
    },
    guest: {
      size: "10x10",
      wardrobe: false,
      studyTable: false,
      bedBackPanel: false,
    },
    living: {
      size: "10x13",
      tvDrawerUnit: false,
      tvPanelSqft: 60,
    },
    pooja: {
      size: "9x9",
      unit: false,
      doorsQty: 0,
    },
    kitchen: {
      size: "10x12",
      type: "Parallel",
      baseUnit: false,
      tandemBaskets: 0,
      bottlePullout: 0,
      cornerUnit: false,
      wickerBasket: false,
    },
  },
  addons: {
    sofa: 0,
    diningTable: 0,
    carpets: 0,
    designerLights: 0,
    curtains: 0,
  },
  totals: {
    low: 0,
    high: 0,
    byCategory: {},
  },
};

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentStep: 1,

      setCurrentStep: (step) => set({ currentStep: step }),

      setBasics: (basics) =>
        set((state) => ({
          basics: { ...state.basics, ...basics },
        })),

      setSingleLine: (single) =>
        set((state) => ({
          single: { ...state.single, ...single },
        })),

      setRooms: (rooms) =>
        set((state) => ({
          rooms: { ...state.rooms, ...rooms },
        })),

      setAddons: (addons) =>
        set((state) => ({
          addons: { ...state.addons, ...addons },
        })),

      setTotals: (totals) => set({ totals }),

      reset: () => set({ ...initialState, currentStep: 1 }),
    }),
    {
      name: "interior-estimator-storage",
    }
  )
);
