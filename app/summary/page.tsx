"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";
import Link from "next/link";
import type { EstimatorState, PriceRange } from "@/lib/types";

interface CalculationResult {
  singleLine: PriceRange;
  bedrooms: PriceRange;
  living: PriceRange;
  pooja: PriceRange;
  kitchen: PriceRange;
  addons: PriceRange;
  grandTotal: PriceRange;
}

export default function SummaryPage() {
  const [state, setState] = useState<EstimatorState | null>(null);
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadFromHash = () => {
      try {
        const hash = window.location.hash.slice(1);
        if (!hash) {
          setError("No estimate data found in URL");
          setLoading(false);
          return;
        }

        const decodedState = JSON.parse(atob(hash));
        setState(decodedState);

        // Calculate ranges for this shared state
        calculateEstimate(decodedState);
      } catch (err) {
        console.error("Failed to load shared estimate:", err);
        setError("Invalid share link");
        setLoading(false);
      }
    };

    const calculateEstimate = async (estimatorState: EstimatorState) => {
      try {
        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(estimatorState),
        });

        if (!response.ok) {
          throw new Error("Failed to calculate estimate");
        }

        const result = await response.json();

        if (result.success) {
          setCalculation(result.ranges);
        } else {
          throw new Error(result.error || "Calculation failed");
        }
      } catch (err) {
        console.error("Calculation error:", err);
        setError("Failed to calculate estimate");
      } finally {
        setLoading(false);
      }
    };

    loadFromHash();
  }, []);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading estimate...</p>
        </div>
      </div>
    );
  }

  if (error || !state || !calculation) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">
            {error || "Failed to load estimate"}
          </p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary/90">
              <Home className="w-4 h-4 mr-2" />
              Create New Estimate
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Shared Cost Estimate
          </h1>
          <p className="text-gray-600 text-lg">
            Interior design project estimate
          </p>
        </div>

        <div className="space-y-6">
          {/* Project Details */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-black">
                Project Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Carpet Area:</span>
                  <p className="font-medium text-black">
                    {state.basics.carpetAreaSqft} sq ft
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Configuration:</span>
                  <p className="font-medium text-black">
                    {state.basics.bhk.toUpperCase()}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500">Package:</span>
                  <p className="font-medium text-black">{state.basics.pkg}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cost Breakdown */}
          <Card className="border border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg text-black">
                Cost Breakdown
              </CardTitle>
              <p className="text-sm text-gray-600">
                All amounts are approximate ranges
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    key: "singleLine",
                    label: "Single Line Items",
                    range: calculation.singleLine,
                  },
                  {
                    key: "bedrooms",
                    label: "Bedrooms",
                    range: calculation.bedrooms,
                  },
                  {
                    key: "living",
                    label: "Living Room",
                    range: calculation.living,
                  },
                  {
                    key: "kitchen",
                    label: "Kitchen",
                    range: calculation.kitchen,
                  },
                  {
                    key: "pooja",
                    label: "Pooja Room",
                    range: calculation.pooja,
                  },
                  {
                    key: "addons",
                    label: "Add-ons",
                    range: calculation.addons,
                  },
                ].map(({ key, label, range }) => (
                  <div
                    key={key}
                    className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0"
                  >
                    <span className="text-black font-medium">{label}</span>
                    <span className="text-black font-medium">
                      {range.low === 0 && range.high === 0
                        ? "Not included"
                        : `≈ ${formatPrice(range.low)} - ${formatPrice(
                            range.high
                          )}`}
                    </span>
                  </div>
                ))}

                <div className="flex justify-between items-center py-3 border-t-2 border-gray-300 mt-4">
                  <span className="text-xl font-bold text-black">
                    Grand Total
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ≈ {formatPrice(calculation.grandTotal.low)} -{" "}
                    {formatPrice(calculation.grandTotal.high)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="text-center pt-6">
            <Link href="/">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground px-8">
                <Home className="w-4 h-4 mr-2" />
                Create Your Own Estimate
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
