import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  EstimatorState,
  Basics,
  SingleLine,
  RoomSet,
  AddOns,
  Package,
} from "@/lib/types";

interface EstimatorStore extends EstimatorState {
  currentStep: number;
  setCurrentStep: (step: number) => void;
  setBasics: (basics: Partial<Basics>) => void;
  setSingleLine: (single: Partial<SingleLine>) => void;
  updateSingleLine: (item: keyof SingleLine, updates: any) => void;
  updateRooms: (room: keyof RoomSet, updates: any) => void;
  updateAddons: (addon: keyof AddOns, updates: any) => void;
  setTotals: (totals: EstimatorState["totals"]) => void;
  setSingleLinePackageOverride: (
    item: keyof SingleLine,
    pkg: Package | null
  ) => void;
  setRoomPackageOverride: (
    room: keyof RoomSet,
    item: string,
    pkg: Package | null
  ) => void;
  setAddonPackageOverride: (addon: keyof AddOns, pkg: Package | null) => void;
  toggleSingleLineItem: (item: keyof SingleLine, enabled: boolean) => void;
  toggleRoomItem: (room: keyof RoomSet, item: string, enabled: boolean) => void;
  toggleAddonItem: (addon: keyof AddOns, enabled: boolean) => void;
  toggleKitchen: (enabled: boolean) => void;
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
    painting: { enabled: false },
    electricalWiring: { enabled: false },
  },
  rooms: {
    master: {
      size: "14x16",
      wardrobe: { enabled: false },
      studyTable: { enabled: false },
      tvUnit: { enabled: false },
      bedBackPanel: { enabled: false },
    },
    children: {
      size: "10x12",
      wardrobe: { enabled: false },
      studyTable: { enabled: false },
      bedBackPanel: { enabled: false },
    },
    guest: {
      size: "10x10",
      wardrobe: { enabled: false },
      studyTable: { enabled: false },
      bedBackPanel: { enabled: false },
    },
    living: {
      size: "10x13",
      tvDrawerUnit: { enabled: false },
      tvPanel: { enabled: false, panelSqft: 60 },
    },
    pooja: {
      size: "9x9",
      unit: { enabled: false },
      doors: { enabled: false, qty: 0 },
    },
    kitchen: {
      enabled: false,
      type: "Parallel",
      size: "10x12",
      baseUnit: { enabled: true },
      tandemBaskets: { enabled: false, qty: 0 },
      bottlePullout: { enabled: false, qty: 0 },
      cornerUnit: { enabled: false },
      wickerBasket: { enabled: false },
    },
  },
  addons: {
    sofa: { enabled: false, qty: 0 },
    diningTable: { enabled: false, qty: 0 },
    carpets: { enabled: false, qty: 0 },
    designerLights: { enabled: false, qty: 0 },
    curtains: { enabled: false, qty: 0 },
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

      updateSingleLine: (item, updates) =>
        set((state) => ({
          single: {
            ...state.single,
            [item]: {
              ...state.single[item],
              ...updates,
            },
          },
        })),

      updateRooms: (room, updates) =>
        set((state) => ({
          rooms: {
            ...state.rooms,
            [room]: {
              ...state.rooms[room],
              ...updates,
            },
          },
        })),

      updateAddons: (addon, updates) =>
        set((state) => ({
          addons: {
            ...state.addons,
            [addon]: {
              ...state.addons[addon],
              ...updates,
            },
          },
        })),

      setTotals: (totals) => set({ totals }),

      setSingleLinePackageOverride: (item, pkg) =>
        set((state) => ({
          single: {
            ...state.single,
            [item]: {
              ...state.single[item],
              pkgOverride: pkg,
            },
          },
        })),

      setRoomPackageOverride: (room, item, pkg) =>
        set((state) => {
          const currentRoom = state.rooms[room];
          const currentItem = currentRoom[item as keyof typeof currentRoom];

          return {
            rooms: {
              ...state.rooms,
              [room]: {
                ...currentRoom,
                [item]: {
                  ...(typeof currentItem === "object"
                    ? currentItem
                    : { enabled: false }),
                  pkgOverride: pkg,
                },
              },
            },
          };
        }),

      setAddonPackageOverride: (addon, pkg) =>
        set((state) => ({
          addons: {
            ...state.addons,
            [addon]: {
              ...state.addons[addon],
              pkgOverride: pkg,
            },
          },
        })),

      toggleSingleLineItem: (item, enabled) =>
        set((state) => {
          const newItem = { ...state.single[item], enabled };
          // Prefill areaSqft with carpetAreaSqft when enabling
          if (enabled && !newItem.areaSqft) {
            newItem.areaSqft = state.basics.carpetAreaSqft;
          }
          return {
            single: {
              ...state.single,
              [item]: newItem,
            },
          };
        }),

      toggleRoomItem: (room, item, enabled) =>
        set((state) => {
          const currentRoom = state.rooms[room];
          const currentItem = currentRoom[item as keyof typeof currentRoom];

          return {
            rooms: {
              ...state.rooms,
              [room]: {
                ...currentRoom,
                [item]: {
                  ...(typeof currentItem === "object"
                    ? currentItem
                    : { enabled: false }),
                  enabled,
                },
              },
            },
          };
        }),

      toggleAddonItem: (addon, enabled) =>
        set((state) => ({
          addons: {
            ...state.addons,
            [addon]: {
              ...state.addons[addon],
              enabled,
              qty: enabled ? 1 : 0,
            },
          },
        })),

      toggleKitchen: (enabled) =>
        set((state) => ({
          rooms: {
            ...state.rooms,
            kitchen: {
              ...state.rooms.kitchen,
              enabled,
              // Reset baseUnit to enabled when kitchen is enabled
              baseUnit: {
                ...state.rooms.kitchen.baseUnit,
                enabled: enabled
                  ? true
                  : state.rooms.kitchen.baseUnit?.enabled || false,
              },
            },
          },
        })),

      reset: () => set({ ...initialState, currentStep: 1 }),
    }),
    {
      name: "interior-estimator-storage",
    }
  )
);
