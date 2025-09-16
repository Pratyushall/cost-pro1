"use client";

import { useEffect } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { analytics } from "@/lib/analytics";
import type { BHK, Package } from "@/lib/types";

export function StepBasics() {
  const { basics, setBasics, setCurrentStep, setSingleLine } =
    useEstimatorStore();

  useEffect(() => {
    analytics.estimatorStarted();
  }, []);

  const handleNext = () => {
    // Prefill single line areas with carpet area
    setSingleLine({
      falseCeiling: { enabled: false, areaSqft: basics.carpetAreaSqft },
      ceilingPainting: { enabled: false, areaSqft: basics.carpetAreaSqft },
      electricalWiring: { enabled: false, areaSqft: basics.carpetAreaSqft },
    });

    analytics.stepCompleted(1, "Basics");
    setCurrentStep(2);
  };

  const isValid = basics.carpetAreaSqft > 0;

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">Project Basics</CardTitle>
        <CardDescription className="text-gray-600">
          Let's start with the fundamental details of your interior project
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <div className="space-y-2">
          <Label htmlFor="carpet-area" className="text-black font-medium">
            Carpet Area (sq ft) *
          </Label>
          <Input
            id="carpet-area"
            type="number"
            placeholder="Enter carpet area in square feet"
            value={basics.carpetAreaSqft || ""}
            onChange={(e) =>
              setBasics({ carpetAreaSqft: Number(e.target.value) })
            }
            className="bg-white border-gray-300 text-black"
          />
          <p className="text-sm text-gray-500">
            This is the actual usable floor area of your home
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label className="text-black font-medium">BHK Configuration</Label>
            <Select
              value={basics.bhk}
              onValueChange={(value: BHK) => setBasics({ bhk: value })}
            >
              <SelectTrigger className="bg-white border-gray-300 text-black">
                <SelectValue placeholder="Select BHK" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="2bhk">2 BHK</SelectItem>
                <SelectItem value="3bhk">3 BHK</SelectItem>
                <SelectItem value="4bhk">4 BHK</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-black font-medium">Package Type</Label>
            <Select
              value={basics.pkg}
              onValueChange={(value: Package) => setBasics({ pkg: value })}
            >
              <SelectTrigger className="bg-white border-gray-300 text-black">
                <SelectValue placeholder="Select package" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="Premium">Premium</SelectItem>
                <SelectItem value="Luxury">Luxury</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-500">
              {basics.pkg === "Premium"
                ? "Good quality materials and finishes"
                : "High-end materials and premium finishes"}
            </p>
          </div>
        </div>

        <div className="flex justify-end pt-6">
          <Button
            onClick={handleNext}
            disabled={!isValid}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Next: Single Line Items
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
