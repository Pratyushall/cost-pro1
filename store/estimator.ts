// Zustand store for the interior estimator

import { create } from "zustand";
import type { Basics, SingleLine, Rooms, Addons } from "@/lib/types";

interface EstimatorStore {
  currentStep: number;
  basics: Basics;
  singleLine: SingleLine;
  rooms: Rooms;
  addons: Addons;
  setCurrentStep: (step: number) => void;
  setBasics: (basics: Partial<Basics>) => void;
  setSingleLine: (singleLine: Partial<SingleLine>) => void;
  setRooms: (rooms: Partial<Rooms>) => void;
  setAddons: (addons: Partial<Addons>) => void;
  updateBedroom: (id: string, updates: any) => void;
  addBedroom: () => void;
  removeBedroom: (id: string) => void;
  resetStore: () => void;
}

const defaultBasics: Basics = {
  carpetAreaSqft: 0,
  bhk: undefined,
  pkg: undefined,
  areaSource: "manual",
};

const defaultSingleLine: SingleLine = {
  falseCeiling: { enabled: false, areaSqft: 0 },
  painting: { enabled: false, areaSqft: 0 },
  electricalWiring: { enabled: false, areaSqft: 0 },
};

const defaultAddons: Addons = {
  sofa: { enabled: false, qty: 0 },
  diningTable: { enabled: false, qty: 0 },
  curtains: { enabled: false, qty: 0 },
  lights: { enabled: false, qty: 0 },
  wallpaper: { enabled: false, qty: 0 },
  mirrors: { enabled: false, qty: 0 },
  plants: { enabled: false, qty: 0 },
};

const defaultRooms: Rooms = {
  bedrooms: [],
  living: {
    size: "10x13",
    tvDrawerUnit: { enabled: false },
    tvPanel: {
      enabled: false,
      mode: "sqft",
      panelSqft: 60,
    },
  },
  pooja: {
    size: "3x3",
    doors: { enabled: false, qty: 0 },
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
  prefilled: false,
};

export const useEstimatorStore = create<EstimatorStore>((set) => ({
  currentStep: 1,
  basics: defaultBasics,
  singleLine: defaultSingleLine,
  rooms: defaultRooms,
  addons: defaultAddons,

  setCurrentStep: (step) => set({ currentStep: step }),

  setBasics: (newBasics) =>
    set((state) => ({
      basics: { ...state.basics, ...newBasics },
    })),

  setSingleLine: (newSingleLine) =>
    set((state) => ({
      singleLine: { ...state.singleLine, ...newSingleLine },
    })),

  setRooms: (newRooms) =>
    set((state) => ({
      rooms: { ...state.rooms, ...newRooms },
    })),

  setAddons: (newAddons) =>
    set((state) => ({
      addons: { ...state.addons, ...newAddons },
    })),

  updateBedroom: (id, updates) =>
    set((state) => ({
      rooms: {
        ...state.rooms,
        bedrooms: state.rooms.bedrooms.map((br) =>
          br.id === id ? { ...br, ...updates } : br
        ),
      },
    })),

  addBedroom: () =>
    set((state) => ({
      rooms: {
        ...state.rooms,
        bedrooms: [
          ...state.rooms.bedrooms,
          {
            id: crypto.randomUUID(),
            role: "Other" as const,
            size: "10x12" as const,
            items: {
              wardrobe: { enabled: false },
              studyTable: { enabled: false },
              bedBackPanel: { enabled: false },
            },
          },
        ],
      },
    })),

  removeBedroom: (id) =>
    set((state) => ({
      rooms: {
        ...state.rooms,
        bedrooms: state.rooms.bedrooms.filter((br) => br.id !== id),
      },
    })),

  resetStore: () =>
    set({
      currentStep: 1,
      basics: defaultBasics,
      singleLine: defaultSingleLine,
      rooms: defaultRooms,
      addons: defaultAddons,
    }),
}));
