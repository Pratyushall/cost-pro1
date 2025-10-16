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
import { Badge } from "@/components/ui/badge";
import {
  ChevronRight,
  MoreVertical,
  X,
  ArrowLeft,
  RotateCcw,
} from "lucide-react";
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

export function StepSingleLine() {
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

    if (enabled) {
      setTimeout(() => {
        document.getElementById(`${key}-area`)?.focus();
      }, 100);
    }
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

  const handleReset = () => {
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
    <div className="max-w-4xl mx-auto">
      <div className="calculator-card rounded-xl overflow-hidden">
        <div className="section-header">
          <h2 className="text-3xl font-bold text-primary-foreground mb-2">
            Quick scope
          </h2>
          <p className="text-primary-foreground/90 text-base leading-relaxed">
            Enable what you need and set coverage, we'll handle the
            calculations.
          </p>
          {isEstimated && totalSqft > 0 && (
            <div className="mt-3 inline-block bg-primary-foreground/10 border border-primary-foreground/20 px-3 py-1.5 rounded-lg">
              <span className="text-sm text-primary-foreground font-medium">
                Using ~{totalSqft.toLocaleString()} sq ft (estimated)
              </span>
            </div>
          )}
        </div>

        <div className="section-content">
          <div className="elegant-card p-6 space-y-4">
            <Label className="field-label text-base">Room shortcuts</Label>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(ROOM_SHORTCUTS) as RoomShortcut[]).map(
                (shortcut) => (
                  <Button
                    key={shortcut}
                    variant="outline"
                    size="sm"
                    onClick={() => handleRoomShortcut(shortcut)}
                    className={`text-sm transition-colors ${
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

          <div className="divider" />

          <div className="flex items-center justify-between mb-6">
            <Label className="field-label text-base">Bulk actions</Label>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-secondary/10"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border text-popover-foreground"
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

          <div className="space-y-4">
            {(Object.keys(singleLine) as SingleLineKey[]).map((key) => {
              const item = singleLine[key];
              const isOverridden =
                item.pkgOverride && item.pkgOverride !== basics.pkg;

              return (
                <div key={key} className="elegant-card p-6 space-y-4">
                  {/* Header - clickable to toggle */}
                  <div
                    className="flex cursor-pointer items-center justify-between"
                    onClick={() => handleToggle(key, !item.enabled)}
                  >
                    <div className="flex items-center gap-3">
                      <Switch
                        checked={item.enabled}
                        onCheckedChange={(checked) =>
                          handleToggle(key, checked)
                        }
                      />
                      <Label className="cursor-pointer text-lg font-semibold text-foreground">
                        {getItemLabel(key)}
                      </Label>
                      {isOverridden && (
                        <Badge
                          variant="secondary"
                          className="text-xs bg-accent/20 text-accent border-accent/30"
                        >
                          Overridden
                        </Badge>
                      )}
                    </div>
                    {isOverridden && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="hover:bg-secondary/10 text-muted-foreground hover:text-foreground"
                        onClick={(e) => {
                          e.stopPropagation();
                          handlePackageOverride(key, "reset");
                        }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reset to Global
                      </Button>
                    )}
                  </div>

                  {/* Controls - only show when enabled */}
                  {item.enabled && (
                    <div className="space-y-4 pl-10 pt-2">
                      {/* Scope Presets */}
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
                            className={`text-sm ${
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
                          className={`text-sm ${
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

                      {/* Area Input */}
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
                            className="calculator-input h-11 rounded-lg"
                          />
                        </div>
                        <Select
                          value={item.areaMode || "percent"}
                          onValueChange={(value: "percent" | "sqft") =>
                            handleAreaModeChange(key, value)
                          }
                        >
                          <SelectTrigger className="calculator-select w-28 h-11 rounded-lg">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-popover-foreground">
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

                      {/* Calculated Area Display */}
                      <p className="field-hint">
                        = {item.areaSqft.toLocaleString()} sq ft
                        {item.areaMode === "percent" &&
                          ` (${item.areaPercent}% of total)`}
                      </p>

                      {/* Package Override */}
                      <div className="flex items-center gap-3">
                        <Label
                          htmlFor={`${key}-pkg`}
                          className="field-label text-sm"
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
                            className="calculator-select w-40 h-11 rounded-lg"
                          >
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover border-border text-popover-foreground">
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
                        {!item.pkgOverride && basics.pkg && (
                          <span className="text-sm text-muted-foreground"></span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-6 gap-4">
            {/* Left: Back button */}
            <Button
              variant="outline"
              onClick={handleBack}
              className="bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-14 px-8 rounded-lg text-base font-semibold shadow-md"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>

            {/* Center: Reset button */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-14 px-8 rounded-lg text-base font-semibold shadow-md"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>

            {/* Right: Next button */}
            <Button
              onClick={handleNext}
              className="btn-enhanced-primary px-10 h-12 rounded-lg text-base font-semibold"
            >
              Next
              <ChevronRight className="h-5 w-5 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
