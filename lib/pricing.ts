// Hidden pricing configuration - NEVER expose to client
export const rates = {
  singleLinePerSqft: {
    Premium: { falseCeiling: 900, ceilingPainting: 200, electricalWiring: 250 },
    Luxury: { falseCeiling: 1250, ceilingPainting: 300, electricalWiring: 350 },
  },

  wardrobeArea: {
    Luxury: { "14x16": 60, "10x12": 40, "10x10": 30, "11.5x11.5": 35 },
    Premium: { "14x16": 35, "10x12": 25, "10x10": 20, "11.5x11.5": 15 },
  },
  wardrobePricePerSqft: {
    Luxury: { "14x16": 6000, "10x12": 5000, "10x10": 4800, "11.5x11.5": 4300 },
    Premium: { "14x16": 2800, "10x12": 3000, "10x10": 2850, "11.5x11.5": 2500 },
  },

  studyTablePricePerSqft: {
    Luxury: {
      "14x16": 4500,
      "12x14": 3500,
      "10x12": 2850,
      "10x10": 2500,
      "11.5x11.5": 3000,
    },
    Premium: {
      "14x16": 2850,
      "12x14": 2650,
      "10x12": 2050,
      "10x10": 2050,
      "11.5x11.5": 2250,
    },
  },
  studyTableAreaSqft: {
    "14x16": 18,
    "12x14": 16,
    "10x12": 12,
    "10x10": 8,
    "11.5x11.5": 10,
  },

  tvUnitPricePerSqftBedroom: {
    Luxury: { "14x16": 3000, "10x12": 1600, "10x10": 1500, "11.5x11.5": 2000 },
    Premium: { "14x16": 2000, "10x12": 1300, "10x10": 1250, "11.5x11.5": 1800 },
  },
  tvUnitAreaSqftBedroom: {
    "14x16": 12,
    "10x12": 10,
    "10x10": 8,
    "11.5x11.5": 10,
  },

  bedBackPanelPricePerSqft: {
    "14x16": 4200,
    "10x12": 3700,
    "10x10": 3000,
    "11.5x11.5": 3400,
  },
  bedBackPanelAreaSqft: {
    "14x16": 36,
    "10x12": 30,
    "10x10": 24,
    "11.5x11.5": 27,
  },

  tvDrawerUnitPrice: {
    Premium: { "7x10": 18500, "10x13": 21500, "12x18": 24500, "15x20": 29500 },
    Luxury: { "7x10": 21500, "10x13": 24500, "12x18": 29500, "15x20": 32500 },
  },
  tvPanelPricePerSqft: {
    Premium: { "7x10": 750, "10x13": 850, "12x18": 950, "15x20": 1250 },
    Luxury: { "7x10": 1150, "10x13": 1350, "12x18": 1750, "15x20": 2500 },
  },

  poojaUnitAreaSqft: { "9x9": 6, "3x3": 2 },
  poojaPricePerSqft: {
    Premium: { "9x9": 4000, "3x3": 4000 },
    Luxury: { "9x9": 5000, "3x3": 7500 },
  },
  poojaDoorPrice: {
    Premium: { "9x9": 10000, "3x3": 13000 },
    Luxury: { "9x9": 13000, "3x3": 16000 },
  },

  kitchenAreaSqft: {
    Parallel: { "8x10": 100, "10x12": 120, "12x14": 130 },
    "L-shaped": { "8x10": 120, "10x12": 130, "12x14": 148 },
    Island: { "8x10": 90, "10x12": 100, "12x14": 110 },
  },
  kitchenBasePricePerSqft: { Premium: 2050, Luxury: 2850 },
  kitchenAccessories: {
    tandemBasket: { Premium: 5000, Luxury: 6000 },
    bottlePullout: { Premium: 7500, Luxury: 12000 },
    cornerUnit: { Premium: 20500, Luxury: 27500 },
    wickerBasket: { Premium: 6500, Luxury: 8500 },
  },

  addOns: {
    sofa: {
      "2bhk": { Premium: 75000, Luxury: 90000 },
      "3bhk": { Premium: 110000, Luxury: 150000 },
      "4bhk": { Premium: 140000, Luxury: 180000 },
    },
    diningTable: {
      "2bhk": { Premium: 60000, Luxury: 80000 },
      "3bhk": { Premium: 95000, Luxury: 125000 },
      "4bhk": { Premium: 120000, Luxury: 160000 },
    },
    carpets: {
      "2bhk": { Premium: 8000, Luxury: 12000 },
      "3bhk": { Premium: 10000, Luxury: 15000 },
      "4bhk": { Premium: 12000, Luxury: 18000 },
    },
    designerLights: {
      "2bhk": { Premium: 6000, Luxury: 12000 },
      "3bhk": { Premium: 8000, Luxury: 15000 },
      "4bhk": { Premium: 10000, Luxury: 18000 },
    },
    curtains: {
      "2bhk": { Premium: 8000, Luxury: 12000 },
      "3bhk": { Premium: 10000, Luxury: 15000 },
      "4bhk": { Premium: 12000, Luxury: 18000 },
    },
  },
};
