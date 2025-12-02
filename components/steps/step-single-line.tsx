"use client";

import { useState, useEffect, useRef } from "react";
import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronRight, MoreVertical, ArrowLeft, RotateCcw } from "lucide-react";
import { analytics } from "@/lib/analytics";
import { normalizeAreaInput } from "@/lib/area-utils";
import {
  ROOM_SHORTCUTS,
  SCOPE_PRESETS,
  percentToSqft,
  sqftToPercent,
  getItemLabel,
  type RoomShortcut,
} from "@/lib/single-line-utils";
import type { Package, SingleLineItem } from "@/lib/types";

type SingleLineKey = "falseCeiling" | "painting" | "electricalWiring";

export function StepSingleLineMobile() {
  const { basics, singleLine, setSingleLine, setCurrentStep, resetStore } =
    useEstimatorStore();
  const [startTime] = useState(Date.now());
  const debounceTimers = useRef<Record<string, NodeJS.Timeout>>({});
  const [selectedShortcut, setSelectedShortcut] = useState<RoomShortcut | null>(
    null
  );
  const [selectedPresets, setSelectedPresets] = useState<
    Record<SingleLineKey, number | null>
  >({
    falseCeiling: null,
    painting: null,
    electricalWiring: null,
  });

  const totalSqft = basics.carpetAreaSqft || basics.derivedSqft || 0;
  const isEstimated = basics.areaSource === "estimated";

  useEffect(() => {
    analytics.stepViewed("single_line");
  }, []);

  const handleToggle = (key: SingleLineKey, enabled: boolean) => {
    const item = singleLine[key];
    const newItem: SingleLineItem = {
      ...item,
      enabled,
      areaMode: item.areaMode || "percent",
      areaPercent: item.areaPercent || 100,
      areaSqft: enabled ? percentToSqft(item.areaPercent || 100, totalSqft) : 0,
    };

    setSingleLine({ [key]: newItem });
    analytics.singleScopeToggled(key, enabled);
  };

  const handlePresetClick = (key: SingleLineKey, percent: number) => {
    const item = singleLine[key];
    const newItem: SingleLineItem = {
      ...item,
      areaMode: "percent",
      areaPercent: percent,
      areaSqft: percentToSqft(percent, totalSqft),
    };

    setSingleLine({ [key]: newItem });
    setSelectedPresets((prev) => ({ ...prev, [key]: percent }));
    analytics.singleScopePresetClicked(key, `${percent}%`);
  };

  const handleAreaModeChange = (
    key: SingleLineKey,
    mode: "percent" | "sqft"
  ) => {
    const item = singleLine[key];
    setSingleLine({
      [key]: { ...item, areaMode: mode },
    });
    analytics.singleAreaModeChanged(key, mode);
  };

  const handleAreaChange = (
    key: SingleLineKey,
    value: string,
    mode: "percent" | "sqft"
  ) => {
    if (debounceTimers.current[key]) {
      clearTimeout(debounceTimers.current[key]);
    }

    debounceTimers.current[key] = setTimeout(() => {
      const item = singleLine[key];

      if (mode === "percent") {
        const percent = Math.max(0, Math.min(100, Number.parseInt(value) || 0));
        const sqft = percentToSqft(percent, totalSqft);
        setSingleLine({
          [key]: { ...item, areaPercent: percent, areaSqft: sqft },
        });
        analytics.singleAreaChanged(key, `${percent}%`);
      } else {
        const normalized = normalizeAreaInput(value);
        const sqft = Math.max(50, Math.min(20000, normalized.sqft || 0));
        const percent = sqftToPercent(sqft, totalSqft);
        setSingleLine({
          [key]: { ...item, areaSqft: sqft, areaPercent: percent },
        });
        analytics.singleAreaChanged(key, `${sqft} sqft`);
      }
    }, 300);
  };

  const handlePackageOverride = (
    key: SingleLineKey,
    pkg: Package | "reset"
  ) => {
    const item = singleLine[key];
    if (pkg === "reset") {
      setSingleLine({
        [key]: { ...item, pkgOverride: undefined },
      });
      analytics.pkgOverrideReset(key);
    } else {
      setSingleLine({
        [key]: { ...item, pkgOverride: pkg },
      });
      analytics.pkgOverrideSet(key, pkg);
    }
  };

  const handleRoomShortcut = (shortcut: RoomShortcut) => {
    const config = ROOM_SHORTCUTS[shortcut];
    const updates: Partial<typeof singleLine> = {};

    Object.keys(singleLine).forEach((key) => {
      const k = key as SingleLineKey;
      const item = singleLine[k];
      const percent = config[k];
      updates[k] = {
        ...item,
        areaMode: "percent",
        areaPercent: percent,
        areaSqft: percentToSqft(percent, totalSqft),
      };
    });

    setSingleLine(updates);
    setSelectedShortcut(shortcut);
    analytics.roomShortcutClicked(shortcut);
  };

  const handleBulkApply = (
    action: "100%" | "80%" | "copy-pkg" | "reset-all"
  ) => {
    const updates: Partial<typeof singleLine> = {};

    if (action === "100%" || action === "80%") {
      const percent = action === "100%" ? 100 : 80;
      Object.keys(singleLine).forEach((key) => {
        const k = key as SingleLineKey;
        const item = singleLine[k];
        if (item.enabled) {
          updates[k] = {
            ...item,
            areaMode: "percent",
            areaPercent: percent,
            areaSqft: percentToSqft(percent, totalSqft),
          };
        }
      });
    } else if (action === "copy-pkg") {
      const globalPkg = basics.pkg;
      if (globalPkg) {
        Object.keys(singleLine).forEach((key) => {
          const k = key as SingleLineKey;
          const item = singleLine[k];
          if (item.enabled) {
            updates[k] = { ...item, pkgOverride: globalPkg };
          }
        });
      }
    } else if (action === "reset-all") {
      Object.keys(singleLine).forEach((key) => {
        const k = key as SingleLineKey;
        const item = singleLine[k];
        if (item.enabled) {
          updates[k] = { ...item, pkgOverride: undefined };
        }
      });
    }

    setSingleLine(updates);
    analytics.applyToAllClicked(action);
  };

  const handleNext = () => {
    const enabledCount = Object.values(singleLine).filter(
      (item) => item.enabled
    ).length;
    const overridesCount = Object.values(singleLine).filter(
      (item) => item.enabled && item.pkgOverride
    ).length;

    analytics.nextClicked("single_line", {
      enabledCount,
      estimatedArea: isEstimated,
      overridesCount,
      timeOnStep: Date.now() - startTime,
    });

    setCurrentStep(3);
  };

  const handleResetAll = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetStore();
      analytics.resetClicked("SingleLine");
    }
  };

  const handleBack = () => {
    setCurrentStep(1);
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-24 md:hidden">
      <div className="calculator-card rounded-2xl overflow-hidden shadow-lg">
        {/* Header */}
        <div className="section-header px-4 py-4 sm:px-5">
          <h2 className="text-2xl font-bold text-primary-foreground mb-1">
            Quick scope
          </h2>
          <p className="text-primary-foreground/90 text-sm leading-relaxed">
            Enable what you need and set coverage, we&apos;ll handle the
            calculations.
          </p>
          {isEstimated && totalSqft > 0 && (
            <div className="mt-3 inline-block bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1 rounded-lg">
              <span className="text-xs text-primary-foreground font-medium">
                Using ~{totalSqft.toLocaleString()} sq ft (estimated)
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="section-content px-4 pb-4 pt-1 space-y-5">
          {/* Room shortcuts */}
          <div className="elegant-card rounded-xl p-4 space-y-3">
            <Label className="field-label text-sm">Room shortcuts</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROOM_SHORTCUTS) as RoomShortcut[]).map(
                (shortcut) => (
                  <Button
                    key={shortcut}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoomShortcut(shortcut)}
                    className={`text-xs px-3 py-1.5 transition-colors ${
                      selectedShortcut === shortcut
                        ? "bg-secondary text-secondary-foreground border-secondary"
                        : "border-secondary/30 hover:bg-secondary/10 hover:border-secondary"
                    }`}
                  >
                    {ROOM_SHORTCUTS[shortcut].label}
                  </Button>
                )
              )}
            </div>
          </div>

          {/* Bulk actions */}
          <div className="flex items-center justify-between">
            <Label className="field-label text-sm">Bulk actions</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-secondary/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border text-popover-foreground text-sm"
              >
                <DropdownMenuItem
                  onClick={() => handleBulkApply("100%")}
                  className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                >
                  Set all to 100%
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkApply("80%")}
                  className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                >
                  Set all to 80%
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkApply("copy-pkg")}
                  className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                >
                  Copy package to all
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleBulkApply("reset-all")}
                  className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                >
                  Reset all to global
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Single line items */}
          <div className="space-y-4">
            {(Object.keys(singleLine) as SingleLineKey[]).map((key) => {
              const item = singleLine[key];

              return (
                <div
                  key={key}
                  className="elegant-card rounded-xl p-4 space-y-3"
                >
                  {/* Header / toggle */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) =>
                          handleToggle(key, checked)
                        }
                      />
                      <Label className="text-sm font-semibold text-foreground">
                        {getItemLabel(key)}
                      </Label>
                    </div>
                  </div>

                  {/* Controls when enabled */}
                  {item.enabled && (
                    <div className="space-y-3 pt-1">
                      {/* Scope presets */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {SCOPE_PRESETS.map((preset) => (
                          <Button
                            key={preset.label}
                            variant={
                              selectedPresets[key] === preset.value
                                ? "default"
                                : "outline"
                            }
                            size="sm"
                            onClick={() => handlePresetClick(key, preset.value)}
                            className={`text-xs ${
                              selectedPresets[key] === preset.value
                                ? "bg-secondary text-secondary-foreground hover:bg-secondary/90"
                                : "border-secondary/30 hover:bg-secondary/10 hover:border-secondary"
                            }`}
                          >
                            {preset.label}
                          </Button>
                        ))}
                        <Button
                          variant={
                            item.areaMode === "sqft" ||
                            (item.areaPercent !== 100 &&
                              item.areaPercent !== 80 &&
                              item.areaPercent !== 50)
                              ? "default"
                              : "outline"
                          }
                          size="sm"
                          onClick={() => handleAreaModeChange(key, "sqft")}
                          className={`text-xs ${
                            item.areaMode === "sqft" ||
                            (item.areaPercent !== 100 &&
                              item.areaPercent !== 80 &&
                              item.areaPercent !== 50)
                              ? "bg-accent text-accent-foreground hover:bg-accent/90"
                              : "border-accent/30 hover:bg-accent/10 hover:border-accent"
                          }`}
                        >
                          Custom
                        </Button>
                      </div>

                      {/* Area input */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <Input
                            id={`${key}-area`}
                            type="text"
                            value={
                              item.areaMode === "percent"
                                ? item.areaPercent || ""
                                : item.areaSqft || ""
                            }
                            onChange={(e) =>
                              handleAreaChange(
                                key,
                                e.target.value,
                                item.areaMode || "percent"
                              )
                            }
                            onKeyDown={(e) => {
                              if (e.key === "Enter") {
                                document.getElementById(`${key}-pkg`)?.focus();
                              }
                            }}
                            placeholder={
                              item.areaMode === "percent" ? "%" : "sq ft"
                            }
                            className="calculator-input h-10 rounded-lg text-sm"
                          />
                        </div>
                        <Select
                          value={item.areaMode || "percent"}
                          onValueChange={(value: "percent" | "sqft") =>
                            handleAreaModeChange(key, value)
                          }
                        >
                          <SelectTrigger className="calculator-select w-24 h-10 rounded-lg text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                            <SelectItem
                              value="percent"
                              className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                            >
                              %
                            </SelectItem>
                            <SelectItem
                              value="sqft"
                              className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                            >
                              sq ft
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Calculated area display */}
                      <p className="field-hint text-xs text-muted-foreground">
                        = {item.areaSqft.toLocaleString()} sq ft
                        {item.areaMode === "percent" &&
                          ` (${item.areaPercent}% of total)`}
                      </p>

                      {/* Package override */}
                      <div className="flex items-center gap-2">
                        <Label
                          htmlFor={`${key}-pkg`}
                          className="field-label text-xs"
                        >
                          Package:
                        </Label>
                        <Select
                          value={item.pkgOverride || basics.pkg || ""}
                          onValueChange={(value: Package) =>
                            handlePackageOverride(key, value)
                          }
                        >
                          <SelectTrigger
                            id={`${key}-pkg`}
                            className="calculator-select w-32 h-10 rounded-lg text-xs"
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                            <SelectItem
                              value="Premium"
                              className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                            >
                              Premium
                            </SelectItem>
                            <SelectItem
                              value="Luxury"
                              className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                            >
                              Luxury
                            </SelectItem>
                          </SelectContent>
                        </Select>
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
            className="flex-1 h-10 rounded-lg text-xs font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back
          </Button>
          <Button
            variant="outline"
            onClick={handleResetAll}
            className="flex-1 h-10 rounded-lg text-xs font-medium"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Reset
          </Button>
          <Button
            onClick={handleNext}
            className="flex-[1.4] btn-enhanced-primary h-10 rounded-lg text-xs font-semibold"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
