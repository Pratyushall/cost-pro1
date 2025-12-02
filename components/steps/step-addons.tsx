"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { analytics } from "@/lib/analytics";
import {
  ADDON_LABELS,
  ADDON_UNITS,
  ADDON_PRESETS,
  ADDON_BUNDLES,
  deriveWholeHomeCurtains,
} from "@/lib/addon-utils";
import type { Package } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PackagePicker } from "@/components/package-picker";
import { X, ArrowLeft, RotateCcw } from "lucide-react";
import { resetStore } from "@/store/reset";

const ADDON_KEYS = [
  "sofa",
  "diningTable",
  "curtains",
  "doors",
  "lights",
] as const;
type AddonKeyLocal = (typeof ADDON_KEYS)[number];

export function StepAddonsMobile() {
  const { addons, basics, rooms, setAddons, setCurrentStep } =
    useEstimatorStore();
  const [startTime] = useState(Date.now());

  const qtyTimeouts = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const [selectedPresets, setSelectedPresets] = useState<
    Record<AddonKeyLocal, string | null>
  >({
    sofa: null,
    diningTable: null,
    curtains: null,
    doors: null,
    lights: null,
  });
  const [selectedBundle, setSelectedBundle] = useState<string | null>(null);

  useEffect(() => {
    analytics.addonsStepViewed();
  }, []);

  const handleQtyChange = useCallback(
    (key: AddonKeyLocal, rawValue: string) => {
      const parsed = Number.parseInt(rawValue, 10);
      const qty = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(20, parsed));

      if (parsed > 20) {
        console.log(`[v0] Qty clamped to 20 for ${key}`);
      }

      const enabled = qty > 0;

      setAddons({
        [key]: {
          ...addons[key as keyof typeof addons],
          qty,
          enabled,
        },
      });

      if (qtyTimeouts.current[key]) clearTimeout(qtyTimeouts.current[key]);
      qtyTimeouts.current[key] = setTimeout(() => {
        analytics.addonQtyChanged(key, qty);
        if (addons[key as keyof typeof addons]?.enabled !== enabled) {
          analytics.addonToggled(key, enabled);
        }
      }, 300);
    },
    [addons, setAddons]
  );

  const handleToggle = useCallback(
    (key: AddonKeyLocal, enabled: boolean) => {
      const currentAddon = addons[key as keyof typeof addons];
      setAddons({
        [key]: {
          ...currentAddon,
          enabled,
          qty: enabled ? Math.max(1, currentAddon?.qty || 0) : 0,
        },
      });
      analytics.addonToggled(key, enabled);
    },
    [addons, setAddons]
  );

  const handlePresetClick = useCallback(
    (key: AddonKeyLocal, preset: { label: string; qty: number }) => {
      let qty = preset.qty;
      if (key === "curtains" && preset.label.includes("derive")) {
        qty = deriveWholeHomeCurtains(rooms);
      }
      const currentAddon = addons[key as keyof typeof addons];
      setAddons({
        [key]: {
          ...currentAddon,
          qty,
          enabled: qty > 0,
        },
      });
      setSelectedPresets((prev) => ({ ...prev, [key]: preset.label }));
      analytics.addonPresetClicked(key, preset.label);
    },
    [addons, rooms, setAddons]
  );

  const handleBundleClick = useCallback(
    (bundle: (typeof ADDON_BUNDLES)[number]) => {
      const updates: Record<string, any> = {};
      Object.entries(bundle.items).forEach(([key, qty]) => {
        const currentAddon = addons[key as keyof typeof addons];
        updates[key] = {
          ...currentAddon,
          qty,
          enabled: true,
        };
      });
      setAddons(updates);
      setSelectedBundle(bundle.label);
      analytics.bundleClicked(bundle.label);
    },
    [addons, setAddons]
  );

  const handlePkgOverride = useCallback(
    (key: AddonKeyLocal, pkg: Package | undefined) => {
      const currentAddon = addons[key as keyof typeof addons];
      setAddons({
        [key]: {
          ...currentAddon,
          pkgOverride: pkg,
        },
      });
      if (pkg) analytics.addonPkgOverrideSet(key, pkg);
      else analytics.addonPkgOverrideReset(key);
    },
    [addons, setAddons]
  );

  const handleNext = useCallback(() => {
    const enabledCount = ADDON_KEYS.filter(
      (k) => addons[k as keyof typeof addons]?.enabled
    ).length;
    const totalQty = ADDON_KEYS.reduce(
      (sum, k) => sum + (addons[k as keyof typeof addons]?.qty || 0),
      0
    );
    const overridesCount = ADDON_KEYS.filter(
      (k) => addons[k as keyof typeof addons]?.pkgOverride
    ).length;

    analytics.nextClicked("addons", { enabledCount, totalQty, overridesCount });
    analytics.timeOnStep(4, "addons", Date.now() - startTime);

    setCurrentStep(5);
  }, [addons, startTime, setCurrentStep]);

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetStore();
      analytics.resetClicked("Addons");
    }
  };

  const handleBack = () => {
    setCurrentStep(3);
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-24 md:hidden">
      <div className="calculator-card rounded-2xl overflow-hidden shadow-lg">
        {/* Header Section */}
        <div className="section-header px-4 py-4">
          <h2 className="text-2xl font-bold text-primary-foreground mb-1">
            Add-ons &amp; Furnishings
          </h2>
          <p className="text-primary-foreground/90 text-sm leading-relaxed">
            Optional extras to complete your space. Skip if not needed—you can
            add later.
          </p>
        </div>

        {/* Content Section */}
        <div className="section-content px-4 pb-4 pt-1 space-y-5">
          {/* Bundle buttons */}
          <div className="flex flex-wrap gap-2">
            {ADDON_BUNDLES.map((bundle) => (
              <Button
                key={bundle.label}
                variant={
                  selectedBundle === bundle.label ? "default" : "outline"
                }
                size="sm"
                onClick={() => handleBundleClick(bundle)}
                className={`h-9 px-3 rounded-lg border text-xs font-medium transition-all ${
                  selectedBundle === bundle.label
                    ? "bg-secondary text-secondary-foreground border-secondary"
                    : "border-secondary/30 bg-white hover:bg-secondary/10 hover:border-secondary text-foreground"
                }`}
              >
                {bundle.label}
              </Button>
            ))}
          </div>

          {/* Addon items */}
          <div className="space-y-4">
            {ADDON_KEYS.map((key) => {
              const addon = addons[key as keyof typeof addons];
              if (!addon) return null;

              const isOverridden =
                addon.pkgOverride && addon.pkgOverride !== basics.pkg;

              return (
                <div
                  key={key}
                  className="elegant-card rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={addon.enabled}
                        onCheckedChange={(c) => handleToggle(key, c)}
                      />
                      <div>
                        <Label className="text-sm font-semibold text-foreground">
                          {ADDON_LABELS[key]}
                        </Label>
                      </div>
                    </div>
                  </div>

                  {/* Controls - only show when enabled */}
                  {addon.enabled && (
                    <div className="space-y-3 pl-9">
                      {/* Qty input with unit label */}
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          min={0}
                          max={20}
                          value={addon.qty}
                          onChange={(e) => handleQtyChange(key, e.target.value)}
                          className="calculator-input w-20 h-9 rounded-lg text-sm"
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === "Enter") {
                              e.preventDefault();
                              const pkgPicker = e.currentTarget
                                .closest(".space-y-3")
                                ?.querySelector<HTMLButtonElement>("button");
                              pkgPicker?.focus();
                            }
                          }}
                        />
                        <span className="text-xs text-muted-foreground font-medium">
                          {ADDON_UNITS[key]}
                        </span>
                        {addon.qty > 15 && (
                          <span className="text-[11px] text-amber-600 font-medium">
                            That&apos;s quite a lot! Consider if you need this
                            many.
                          </span>
                        )}
                      </div>

                      {/* Presets */}
                      <div className="flex flex-wrap gap-2">
                        {ADDON_PRESETS[key].map((preset) => (
                          <Button
                            key={preset.label}
                            variant={
                              selectedPresets[key] === preset.label
                                ? "default"
                                : "ghost"
                            }
                            size="sm"
                            onClick={() => handlePresetClick(key, preset)}
                            className={`h-8 px-3 rounded-lg text-[11px] font-medium transition-colors ${
                              selectedPresets[key] === preset.label
                                ? "bg-secondary text-secondary-foreground"
                                : "text-muted-foreground hover:bg-secondary/10 hover:text-foreground"
                            }`}
                          >
                            {preset.label}
                          </Button>
                        ))}
                      </div>

                      {/* Package override */}
                      <div className="flex flex-wrap items-center gap-2">
                        <PackagePicker
                          globalPkg={basics.pkg || "Premium"}
                          currentPackage={addon.pkgOverride}
                          onPackageChange={(pkg) => handlePkgOverride(key, pkg)}
                          itemName={ADDON_LABELS[key]}
                        />
                        {isOverridden && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handlePkgOverride(key, undefined)}
                            className="h-8 px-2 rounded-lg text-[11px] text-muted-foreground hover:bg-secondary/10 hover:text-foreground font-medium transition-colors"
                          >
                            <X className="mr-1 h-3 w-3" />
                            Reset to Global
                          </Button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sticky bottom actions for mobile */}
      <div className="fixed inset-x-0 bottom-0 z-20 bg-background/95 backdrop-blur border-t border-border px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-2">
          <Button
            variant="outline"
            onClick={handleBack}
            className="flex-1 h-10 rounded-lg text-xs font-medium bg-white/40 backdrop-blur-md border-white/40 hover:bg-white/70"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>

          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1 h-10 rounded-lg text-xs font-medium bg-white/40 backdrop-blur-md border-white/40 hover:bg-white/70"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>

          <Button
            onClick={handleNext}
            className="flex-[1.6] btn-enhanced-primary h-10 rounded-lg text-xs font-semibold"
          >
            Generate Estimate
            <svg
              className="w-4 h-4 ml-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}
