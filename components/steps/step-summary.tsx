"use client";

import { useEffect, useState } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Share2, RotateCcw, Loader2 } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { generatePDF, openPDFForPrint } from "@/lib/pdf-generator";
import type { PriceRange } from "@/lib/types";

interface CalculationResult {
  singleLine: PriceRange;
  bedrooms: PriceRange;
  living: PriceRange;
  pooja: PriceRange;
  kitchen: PriceRange;
  addons: PriceRange;
  grandTotal: PriceRange;
}

export function StepSummary() {
  const { basics, single, rooms, addons, setCurrentStep, reset } =
    useEstimatorStore();
  const [calculation, setCalculation] = useState<CalculationResult | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateEstimate = async () => {
      try {
        setLoading(true);
        setError(null);

        const state = {
          basics,
          single,
          rooms,
          addons,
          totals: { low: 0, high: 0, byCategory: {} },
        };

        const response = await fetch("/api/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(state),
        });

        if (!response.ok) {
          throw new Error("Failed to calculate estimate");
        }

        const result = await response.json();

        if (result.success) {
          setCalculation(result.ranges);
          analytics.estimateGenerated(basics, result.ranges.grandTotal);
        } else {
          throw new Error(result.error || "Calculation failed");
        }
      } catch (err) {
        console.error("Calculation error:", err);
        setError("Failed to calculate estimate. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    calculateEstimate();
  }, [basics, single, rooms, addons]);

  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleDownloadPDF = async () => {
    if (!calculation) return;

    try {
      const state = {
        basics,
        single,
        rooms,
        addons,
        totals: { low: 0, high: 0, byCategory: {} },
      };
      const pdfBlob = await generatePDF({ state, calculation });

      const filename = `interior-estimate-${basics.bhk}-${
        basics.pkg
      }-${Date.now()}.html`;
      openPDFForPrint(pdfBlob);

      analytics.pdfDownloaded(basics);
    } catch (error) {
      console.error("PDF generation error:", error);
    }
  };

  const handleShareLink = () => {
    try {
      const stateData = { basics, single, rooms, addons };
      const encodedState = btoa(JSON.stringify(stateData));
      const shareUrl = `${window.location.origin}/summary#${encodedState}`;

      navigator.clipboard.writeText(shareUrl).then(() => {
        console.log("[v0] Share link copied:", shareUrl);
        analytics.shareLinkCopied(basics);
        // TODO: Show toast notification
      });
    } catch (error) {
      console.error("Share link error:", error);
    }
  };

  const handleStartOver = () => {
    reset();
  };

  // ... existing code for loading, error, and render logic ...

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Calculating your estimate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 mb-4">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-primary hover:bg-primary/90"
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (!calculation) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No calculation data available</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">
          Cost Estimate Summary
        </CardTitle>
        <p className="text-gray-600">
          Here's your approximate cost estimate for a {basics.bhk.toUpperCase()}{" "}
          {basics.pkg} package
        </p>
      </CardHeader>

      <div className="space-y-4">
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
                  {basics.carpetAreaSqft} sq ft
                </p>
              </div>
              <div>
                <span className="text-gray-500">Configuration:</span>
                <p className="font-medium text-black">
                  {basics.bhk.toUpperCase()}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Package:</span>
                <p className="font-medium text-black">{basics.pkg}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cost Breakdown */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Cost Breakdown</CardTitle>
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
                { key: "pooja", label: "Pooja Room", range: calculation.pooja },
                { key: "addons", label: "Add-ons", range: calculation.addons },
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

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(4)}
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Add-Ons
          </Button>

          <div className="flex flex-1 gap-2">
            <Button
              onClick={handleDownloadPDF}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Download className="w-4 h-4 mr-2" />
              Download PDF
            </Button>

            <Button
              variant="outline"
              onClick={handleShareLink}
              className="flex-1 border-gray-300 text-black hover:bg-gray-50 bg-transparent"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Copy Share Link
            </Button>

            <Button
              variant="outline"
              onClick={handleStartOver}
              className="border-gray-300 text-black hover:bg-gray-50 bg-transparent"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Start Over
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
