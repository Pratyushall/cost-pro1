import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
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

const STORAGE_KEY = "ICP_STATE"; // <- must match prehydrate cleanup
const LAST_ACTIVE_KEY = "ICP_LAST_ACTIVE"; // <- updated by SessionGuard
const TIMEOUT_MIN = Number(process.env.NEXT_PUBLIC_SESSION_TIMEOUT_MIN ?? 30);
const TIMEOUT_MS = TIMEOUT_MIN * 60 * 1000;

const initialState: EstimatorState = {
  basics: { carpetAreaSqft: 0, bhk: "3bhk", pkg: "Premium" },
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
  totals: { low: 0, high: 0, byCategory: {} },
};

// Guarded localStorage: if expired, pretend there's nothing stored.
const guardedStorage = {
  getItem: (name: string) => {
    try {
      const t = Number(localStorage.getItem(LAST_ACTIVE_KEY) || 0);
      const expired = !t || Date.now() - t > TIMEOUT_MS;
      if (expired) {
        localStorage.removeItem(name);
        localStorage.removeItem(LAST_ACTIVE_KEY);
        return null; // <- forces fresh state (step 0)
      }
      return localStorage.getItem(name);
    } catch {
      return null;
    }
  },
  setItem: (name: string, value: string) => {
    try {
      localStorage.setItem(name, value);
    } catch {}
  },
  removeItem: (name: string) => {
    try {
      localStorage.removeItem(name);
    } catch {}
  },
} as Storage;

export const useEstimatorStore = create<EstimatorStore>()(
  persist(
    (set, get) => ({
      ...initialState,
      currentStep: 0, // <- start from step 0

      setCurrentStep: (step) => set({ currentStep: step }),
      setBasics: (basics) =>
        set((s) => ({ basics: { ...s.basics, ...basics } })),
      setSingleLine: (single) =>
        set((s) => ({ single: { ...s.single, ...single } })),
      updateSingleLine: (item, updates) =>
        set((s) => ({
          single: { ...s.single, [item]: { ...s.single[item], ...updates } },
        })),
      updateRooms: (room, updates) =>
        set((s) => ({
          rooms: { ...s.rooms, [room]: { ...s.rooms[room], ...updates } },
        })),
      updateAddons: (addon, updates) =>
        set((s) => ({
          addons: { ...s.addons, [addon]: { ...s.addons[addon], ...updates } },
        })),
      setTotals: (totals) => set({ totals }),
      setSingleLinePackageOverride: (item, pkg) =>
        set((s) => ({
          single: {
            ...s.single,
            [item]: { ...s.single[item], pkgOverride: pkg },
          },
        })),
      setRoomPackageOverride: (room, item, pkg) =>
        set((s) => {
          const r = s.rooms[room];
          const cur = r[item as keyof typeof r];
          return {
            rooms: {
              ...s.rooms,
              [room]: {
                ...r,
                [item]: {
                  ...(typeof cur === "object" ? cur : { enabled: false }),
                  pkgOverride: pkg,
                },
              },
            },
          };
        }),
      setAddonPackageOverride: (addon, pkg) =>
        set((s) => ({
          addons: {
            ...s.addons,
            [addon]: { ...s.addons[addon], pkgOverride: pkg },
          },
        })),
      toggleSingleLineItem: (item, enabled) =>
        set((s) => {
          const next = { ...s.single[item], enabled };
          if (enabled && !next.areaSqft)
            next.areaSqft = s.basics.carpetAreaSqft;
          return { single: { ...s.single, [item]: next } };
        }),
      toggleRoomItem: (room, item, enabled) =>
        set((s) => {
          const r = s.rooms[room];
          const cur = r[item as keyof typeof r];
          return {
            rooms: {
              ...s.rooms,
              [room]: {
                ...r,
                [item]: {
                  ...(typeof cur === "object" ? cur : { enabled: false }),
                  enabled,
                },
              },
            },
          };
        }),
      toggleAddonItem: (addon, enabled) =>
        set((s) => ({
          addons: {
            ...s.addons,
            [addon]: { ...s.addons[addon], enabled, qty: enabled ? 1 : 0 },
          },
        })),
      toggleKitchen: (enabled) =>
        set((s) => ({
          rooms: {
            ...s.rooms,
            kitchen: {
              ...s.rooms.kitchen,
              enabled,
              baseUnit: {
                ...s.rooms.kitchen.baseUnit,
                enabled: enabled
                  ? true
                  : s.rooms.kitchen.baseUnit?.enabled || false,
              },
            },
          },
        })),
      reset: () => set({ ...initialState, currentStep: 0 }),
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => guardedStorage), // <- the key fix
      version: 1,
      migrate: (persisted: any) => {
        if (typeof persisted?.currentStep !== "number")
          persisted.currentStep = 0;
        return persisted;
      },
    }
  )
);
