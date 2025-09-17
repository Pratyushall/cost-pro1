// Sample script to demonstrate database seeding functionality
// This would typically create and populate tables for the estimator

console.log("[v0] Creating sample data for Interior Cost Estimator...");

// Sample rate configurations that could be stored in a database
const sampleRates = {
  version: "1.0.0",
  lastUpdated: new Date().toISOString(),
  rates: {
    singleLinePerSqft: {
      Premium: {
        falseCeiling: 900,
        ceilingPainting: 200,
        electricalWiring: 250,
      },
      Luxury: {
        falseCeiling: 1250,
        ceilingPainting: 300,
        electricalWiring: 350,
      },
    },
    wardrobeArea: {
      Luxury: { "14x16": 60, "10x12": 40, "10x10": 30, "11.5x11.5": 35 },
      Premium: { "14x16": 35, "10x12": 25, "10x10": 20, "11.5x11.5": 15 },
    },
    // ... other rates would be included here
  },
};

// In a real implementation, this would:
// 1. Connect to the database
// 2. Create necessary tables
// 3. Insert sample data
// 4. Set up indexes for performance

console.log(
  "[v0] Sample data structure:",
  JSON.stringify(sampleRates, null, 2)
);
console.log("[v0] Sample data creation completed!");

// Export for potential use
if (typeof module !== "undefined" && module.exports) {
  module.exports = { sampleRates };
}
