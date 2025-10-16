"use client";

import type React from "react";
import { resetStore } from "@/store/reset";

import { useEffect, useRef, useState, useCallback } from "react";
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
import { analytics } from "@/lib/analytics";
import type { BHK, Package } from "@/lib/types";
import {
  deriveSqftFromBhk,
  normalizeAreaInput,
  APPROXIMATE_RANGES,
  BHK_OPTIONS,
} from "@/lib/area-utils";
import { RotateCcw } from "lucide-react";

const STORAGE_KEY = "estimator_basics_v1";

export function StepBasics() {
  const { basics, setBasics, setCurrentStep } = useEstimatorStore();
  const [areaInput, setAreaInput] = useState("");
  const [approximateRange, setApproximateRange] = useState("");
  const [estimateMessage, setEstimateMessage] = useState("");
  const [showEstimateHint, setShowEstimateHint] = useState(false);
  const stepStartTime = useRef<number>(Date.now());
  const areaInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    analytics.stepViewed("Basics");
    stepStartTime.current = Date.now();

    // Restore from localStorage
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.carpetAreaSqft) {
          setAreaInput(String(parsed.carpetAreaSqft));
        }
        if (parsed.bhk || parsed.pkg || parsed.carpetAreaSqft) {
          setBasics(parsed);
        }
      } catch (e) {
        console.error("Failed to restore basics from localStorage", e);
      }
    }

    // Set focus to first incomplete field
    if (!basics.carpetAreaSqft && areaInputRef.current) {
      areaInputRef.current.focus();
    }

    return () => {
      // Track time on step when unmounting
      const timeSpent = Date.now() - stepStartTime.current;
      analytics.timeOnStep(1, "Basics", timeSpent);
    };
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(basics));
    }, 300);

    return () => clearTimeout(timer);
  }, [basics]);

  const handleAreaInputChange = useCallback(
    (value: string) => {
      setAreaInput(value);
      setApproximateRange(""); // Clear approximate if manual input

      if (!value.trim()) {
        setBasics({ carpetAreaSqft: 0, areaSource: "estimated" });
        return;
      }

      const normalized = normalizeAreaInput(value);

      if (normalized.error) {
        analytics.inputParseError("carpet_area", value, normalized.error);
      }

      if (normalized.sqft) {
        setBasics({
          carpetAreaSqft: normalized.sqft,
          areaSource: normalized.source,
          derivedSqft: undefined,
        });
        analytics.fieldChanged("carpet_area", normalized.sqft, {
          source: normalized.source,
        });
      } else {
        setBasics({ carpetAreaSqft: 0, areaSource: "estimated" });
      }
    },
    [setBasics]
  );

  const handleApproximateChange = useCallback(
    (value: string) => {
      setApproximateRange(value);
      setAreaInput(""); // Clear manual input

      const range = APPROXIMATE_RANGES.find((r) => r.value === value);

      if (!range) return;

      if (value === "not-sure" || value === "no-idea") {
        analytics.skipAreaClicked(value);
        setBasics({ carpetAreaSqft: 0, areaSource: "estimated" });
        setEstimateMessage(
          "We'll estimate based on your BHK selection or use a default."
        );
        setShowEstimateHint(true);
      } else {
        setBasics({
          carpetAreaSqft: range.midpoint,
          areaSource: "estimated",
        });
        analytics.fieldChanged("carpet_area", range.midpoint, {
          source: "estimated",
          range: value,
        });
        setEstimateMessage("");
        setShowEstimateHint(false);
      }
    },
    [setBasics]
  );

  const handleBhkChange = useCallback(
    (value: BHK) => {
      setBasics({ bhk: value });
      analytics.fieldChanged("bhk", value);

      // If area is unknown or estimated, derive from BHK
      if (
        (!basics.carpetAreaSqft || basics.areaSource === "estimated") &&
        value !== "custom"
      ) {
        const derivedSqft = deriveSqftFromBhk(value);
        if (derivedSqft > 0) {
          setBasics({
            carpetAreaSqft: derivedSqft,
            derivedSqft,
            areaSource: "bhk-derived",
          });
          analytics.deriveAreaFromBhk(value, derivedSqft);
          setEstimateMessage(
            `Using ~${derivedSqft} sq ft for ${value.toUpperCase()}`
          );
          setShowEstimateHint(true);
        }
      }
    },
    [basics.carpetAreaSqft, basics.areaSource, setBasics]
  );

  const handlePackageChange = useCallback(
    (value: Package) => {
      setBasics({ pkg: value });
      analytics.fieldChanged("package", value);
    },
    [setBasics]
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleNext();
    }
  }, []);

  const handleNext = () => {
    let finalArea = basics.carpetAreaSqft;
    let finalBhk = basics.bhk;
    const finalPkg = basics.pkg || "Premium";
    let wasDefaulted = false;

    // If no area and no BHK, assume 2 BHK → 950 sq ft
    if (!finalArea && !finalBhk) {
      finalArea = 950;
      finalBhk = "2bhk";
      wasDefaulted = true;
      setBasics({
        carpetAreaSqft: finalArea,
        bhk: finalBhk,
        pkg: finalPkg,
        areaSource: "estimated",
      });
    } else if (!finalArea && finalBhk) {
      // Derive area from BHK if not set
      finalArea = deriveSqftFromBhk(finalBhk);
      setBasics({
        carpetAreaSqft: finalArea,
        areaSource: "bhk-derived",
      });
    }

    analytics.clickNext({
      step: 1,
      stepName: "Basics",
      is_area_known: basics.areaSource === "manual",
      areaSource: basics.areaSource,
      bhk: finalBhk,
      pkg: finalPkg,
      was_defaulted: wasDefaulted,
    });

    analytics.stepCompleted(1, "Basics", {
      carpet_area: finalArea,
      bhk: finalBhk,
      package: finalPkg,
      area_source: basics.areaSource,
    });

    // Store defaulted message for next step if needed
    if (wasDefaulted) {
      sessionStorage.setItem(
        "estimator_defaulted_message",
        "We assumed 950 sq ft (2 BHK) for now—you can edit anytime."
      );
    }

    setCurrentStep(2);
  };

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetStore();
      analytics.resetClicked("Basics");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="calculator-card rounded-xl overflow-hidden">
        {/* Header Section with Primary Color */}
        <div className="section-header">
          <h2 className="text-4xl font-bold text-primary-foreground mb-3">
            Let's Begin!
          </h2>
          <p className="text-primary-foreground/90 text-lg leading-relaxed">
            Choose a couple of basics and we'll take care of the math.
          </p>
        </div>

        {/* Content Section */}
        <div className="section-content">
          {/* Carpet Area Section */}
          <div className="elegant-card p-8 space-y-5">
            <div className="flex items-center justify-between">
              <Label htmlFor="carpet-area" className="field-label text-xl">
                Carpet Area
              </Label>
            </div>

            <Input
              ref={areaInputRef}
              id="carpet-area"
              type="text"
              placeholder="e.g., 1200, 900-1100, or 85 m²"
              value={areaInput}
              onChange={(e) => handleAreaInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className="calculator-input h-14 text-lg rounded-lg"
            />

            <p className="field-hint text-base">
              Not sure now? Pick an approximate below or we'll guess—you can
              edit later.
            </p>

            {/* Approximate Range Selector */}
            <div className="pt-2 space-y-4">
              <Label className="field-label text-base">
                Or choose approximate range:
              </Label>
              <Select
                value={approximateRange}
                onValueChange={handleApproximateChange}
              >
                <SelectTrigger className="calculator-select h-14 rounded-lg text-lg">
                  <SelectValue placeholder="Select approximate range" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border max-h-[300px] text-popover-foreground">
                  {APPROXIMATE_RANGES.map((range) => (
                    <SelectItem
                      key={range.value}
                      value={range.value}
                      className="py-4 text-lg focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                    >
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Estimate Message */}
            {showEstimateHint && estimateMessage && (
              <div
                className="bg-accent/10 border border-accent/30 text-accent px-5 py-4 rounded-lg text-base font-medium backdrop-blur-sm"
                role="status"
                aria-live="polite"
              >
                {estimateMessage}
              </div>
            )}
          </div>

          <div className="divider" />

          {/* BHK and Package Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* BHK Configuration */}
            <div className="elegant-card p-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-secondary/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-secondary-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                    />
                  </svg>
                </div>
                <Label className="field-label text-lg">BHK Configuration</Label>
              </div>

              <Select value={basics.bhk} onValueChange={handleBhkChange}>
                <SelectTrigger className="calculator-select h-14 rounded-lg text-lg">
                  <SelectValue placeholder="Select BHK" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  {BHK_OPTIONS.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                      className="py-4 text-lg focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Package Type */}
            <div className="elegant-card p-8 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-accent/90 backdrop-blur-sm flex items-center justify-center shadow-lg">
                  <svg
                    className="w-6 h-6 text-accent-foreground"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
                    />
                  </svg>
                </div>
                <Label className="field-label text-lg">Package Type</Label>
              </div>

              <Select value={basics.pkg} onValueChange={handlePackageChange}>
                <SelectTrigger className="calculator-select h-14 rounded-lg text-lg">
                  <SelectValue placeholder="Select package" />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-popover-foreground">
                  <SelectItem
                    value="Premium"
                    className="py-4 text-lg focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                  >
                    Premium
                  </SelectItem>
                  <SelectItem
                    value="Luxury"
                    className="py-4 text-lg focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                  >
                    Luxury
                  </SelectItem>
                </SelectContent>
              </Select>

              <p className="field-hint text-base">
                {basics.pkg === "Premium"
                  ? "Good quality materials and finishes"
                  : basics.pkg === "Luxury"
                  ? "High-end materials and premium finishes"
                  : "Choose your preferred package level"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-6 gap-4">
            {/* Left: Back button - hidden on step 1 */}
            <div className="w-32"></div>

            {/* Right: Next button */}
            <Button
              onClick={handleNext}
              className="btn-enhanced-primary px-12 h-14 rounded-lg text-lg font-semibold"
            >
              Continue
              <svg
                className="w-6 h-6 ml-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
