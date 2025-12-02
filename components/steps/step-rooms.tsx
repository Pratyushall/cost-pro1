"use client";

import { useEffect, useState, useCallback } from "react";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePicker } from "@/components/package-picker";
import { analytics } from "@/lib/analytics";
import {
  prefillRoomsForBHK,
  applyRoomPreset,
  normalizeRoomSize,
  getSuggestedKitchenAccessories,
  validateRoomSize,
} from "@/lib/room-utils";
import type {
  BedroomSize,
  LivingSize,
  KitchenSize,
  KitchenType,
  PoojaSize,
  BedroomRole,
  RoomPreset,
  TVPanelPreset,
} from "@/lib/types";
import {
  ArrowLeft,
  Plus,
  Trash2,
  ChevronDown,
  AlertCircle,
  RotateCcw,
} from "lucide-react";

export function StepRoomsMobile() {
  const {
    rooms,
    setRooms,
    updateBedroom,
    addBedroom,
    removeBedroom,
    setCurrentStep,
    basics,
    resetStore,
  } = useEstimatorStore();
  const [startTime] = useState(Date.now());
  const [customSizes, setCustomSizes] = useState<Record<string, string>>({});
  const [sizeWarnings, setSizeWarnings] = useState<Record<string, string>>({});

  // State for selected presets
  const [selectedPresets, setSelectedPresets] = useState<
    Record<string, RoomPreset | null>
  >({});
  const [selectedTVPreset, setSelectedTVPreset] =
    useState<TVPanelPreset | null>(null);

  // Prefill rooms based on BHK on first load
  useEffect(() => {
    if (!rooms.prefilled && basics.bhk) {
      const prefilled = prefillRoomsForBHK(basics.bhk);
      setRooms(prefilled);
      analytics.roomsStepViewed();
    } else if (!rooms.prefilled) {
      analytics.roomsStepViewed();
    }
  }, [basics.bhk, rooms.prefilled, setRooms]);

  // Debounced autosave
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem("estimator_rooms", JSON.stringify(rooms));
    }, 300);
    return () => clearTimeout(timer);
  }, [rooms]);

  const handleBedroomSizeChange = useCallback(
    (id: string, size: BedroomSize, customValue?: string) => {
      const bedroom = rooms.bedrooms.find((br) => br.id === id);
      if (!bedroom) return;

      if (size === "custom" && customValue) {
        const sqft = normalizeRoomSize(customValue);
        const validation = validateRoomSize(sqft, "bedroom");
        if (validation.warning) {
          setSizeWarnings((prev) => ({
            ...prev,
            [`bedroom-${id}`]: validation.warning!,
          }));
        } else {
          setSizeWarnings((prev) => {
            const updated = { ...prev };
            delete updated[`bedroom-${id}`];
            return updated;
          });
        }
        updateBedroom(id, { size, customSize: customValue });
        analytics.roomSizeChanged(bedroom.role, `custom:${customValue}`);
      } else {
        updateBedroom(id, { size, customSize: undefined });
        analytics.roomSizeChanged(bedroom.role, size);
      }
    },
    [rooms.bedrooms, updateBedroom]
  );

  const handleRoomPreset = useCallback(
    (id: string, preset: RoomPreset) => {
      const bedroom = rooms.bedrooms.find((br) => br.id === id);
      if (!bedroom) return;

      const updatedItems = applyRoomPreset(bedroom.items, preset);
      updateBedroom(id, { items: updatedItems });
      setSelectedPresets((prev) => ({ ...prev, [id]: preset }));
      analytics.roomPresetClicked(bedroom.role, preset);
    },
    [rooms.bedrooms, updateBedroom]
  );

  const handleTVPanelPreset = useCallback(
    (preset: TVPanelPreset) => {
      const presetValues = {
        Small: 40,
        Medium: 60,
        Feature: 100,
      };
      setRooms({
        living: {
          ...rooms.living,
          tvPanel: {
            ...rooms.living.tvPanel,
            enabled: true,
            panelSqft: presetValues[preset],
          },
        },
      });
      setSelectedTVPreset(preset);
      analytics.tvPanelPresetClicked(preset);
    },
    [rooms.living, setRooms]
  );

  const handleKitchenTypeOrSizeChange = useCallback(
    (type?: KitchenType, size?: KitchenSize) => {
      const newType = type || rooms.kitchen.type;
      const newSize = size || rooms.kitchen.size;

      const suggested = getSuggestedKitchenAccessories(newType, newSize);

      setRooms({
        kitchen: {
          ...rooms.kitchen,
          ...(type && { type }),
          ...(size && { size }),
          tandemBaskets: {
            ...rooms.kitchen.tandemBaskets,
            qty: suggested.tandemBaskets,
            enabled: suggested.tandemBaskets > 0,
          },
          bottlePullout: {
            ...rooms.kitchen.bottlePullout,
            qty: suggested.bottlePullout,
            enabled: suggested.bottlePullout > 0,
          },
        },
      });

      if (size) {
        analytics.roomSizeChanged("Kitchen", size);
      }
    },
    [rooms.kitchen, setRooms]
  );

  const handleBulkAction = useCallback(
    (action: string) => {
      analytics.bulkActionClicked(action);

      switch (action) {
        case "enable-essentials":
          rooms.bedrooms.forEach((br) => {
            updateBedroom(br.id, {
              items: {
                ...br.items,
                wardrobe: { ...br.items.wardrobe, enabled: true },
              },
            });
          });
          break;

        case "set-typical-sizes":
          if (basics.bhk) {
            const prefilled = prefillRoomsForBHK(basics.bhk);
            setRooms(prefilled);
          }
          break;

        case "reset-packages":
          rooms.bedrooms.forEach((br) => {
            const resetItems = { ...br.items };
            Object.keys(resetItems).forEach((key) => {
              const itemKey = key as keyof typeof resetItems;
              if (resetItems[itemKey]) {
                resetItems[itemKey] = {
                  ...resetItems[itemKey],
                  pkgOverride: undefined,
                };
              }
            });
            updateBedroom(br.id, { items: resetItems });
          });
          setRooms({
            living: {
              ...rooms.living,
              tvDrawerUnit: {
                ...rooms.living.tvDrawerUnit,
                pkgOverride: undefined,
              },
              tvPanel: { ...rooms.living.tvPanel, pkgOverride: undefined },
            },
            kitchen: {
              ...rooms.kitchen,
              baseUnit: { ...rooms.kitchen.baseUnit, pkgOverride: undefined },
              tandemBaskets: {
                ...rooms.kitchen.tandemBaskets,
                pkgOverride: undefined,
              },
              bottlePullout: {
                ...rooms.kitchen.bottlePullout,
                pkgOverride: undefined,
              },
              cornerUnit: {
                ...rooms.kitchen.cornerUnit,
                pkgOverride: undefined,
              },
              wickerBasket: {
                ...rooms.kitchen.wickerBasket,
                pkgOverride: undefined,
              },
            },
            pooja: {
              ...rooms.pooja,
              doors: { ...rooms.pooja.doors, pkgOverride: undefined },
            },
          });
          break;
      }
    },
    [basics.bhk, rooms, updateBedroom, setRooms]
  );

  const handleNext = useCallback(() => {
    const timeOnStep = Date.now() - startTime;
    const roomsEnabled = rooms.bedrooms.length;
    const itemsEnabled = rooms.bedrooms.reduce((acc, br) => {
      return (
        acc +
        Object.values(br.items).filter((item) => item && item.enabled).length
      );
    }, 0);
    const overridesCount = rooms.bedrooms.reduce((acc, br) => {
      return (
        acc +
        Object.values(br.items).filter(
          (item) => item && item.pkgOverride !== undefined
        ).length
      );
    }, 0);

    analytics.nextClicked("rooms", {
      roomsEnabled,
      itemsEnabled,
      overridesCount,
    });
    analytics.timeOnStep(3, "rooms", timeOnStep);
    setCurrentStep(4);
  }, [startTime, rooms, setCurrentStep]);

  const handleReset = () => {
    if (
      confirm("Are you sure you want to reset all data? This cannot be undone.")
    ) {
      resetStore();
      analytics.resetClicked("Rooms");
    }
  };

  const handleBack = () => {
    setCurrentStep(2);
  };

  const countOverrides = () => {
    let count = 0;
    rooms.bedrooms.forEach((br) => {
      Object.values(br.items).forEach((item) => {
        if (item && item.pkgOverride !== undefined) count++;
      });
    });
    if (rooms.living.tvDrawerUnit.pkgOverride) count++;
    if (rooms.living.tvPanel.pkgOverride) count++;
    if (rooms.kitchen.baseUnit.pkgOverride) count++;
    if (rooms.kitchen.tandemBaskets.pkgOverride) count++;
    if (rooms.kitchen.bottlePullout.pkgOverride) count++;
    if (rooms.kitchen.cornerUnit.pkgOverride) count++;
    if (rooms.kitchen.wickerBasket.pkgOverride) count++;
    if (rooms.pooja.doors.pkgOverride) count++;
    return count;
  };

  return (
    <div className="mx-auto max-w-md px-4 pt-4 pb-24 md:hidden">
      <div className="calculator-card mobile-card rounded-2xl overflow-hidden shadow-lg">
        <div className="section-header px-4 py-4">
          <div className="flex flex-col gap-4">
            <div>
              <CardTitle className="text-2xl font-bold text-primary-foreground mb-1">
                Rooms &amp; Items
              </CardTitle>
              <p className="text-primary-foreground/90 text-sm leading-relaxed">
                Configure each room and select the items you want to include.
              </p>
              {rooms.prefilled && (
                <p className="text-xs text-primary-foreground/80 mt-2">
                  We pre-filled common choices—you can change anything.
                </p>
              )}
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full bg-primary-foreground/10 text-primary-foreground border-primary-foreground/20 hover:bg-primary-foreground/20"
                >
                  Bulk Actions
                  <ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-popover border-border w-64 text-popover-foreground text-sm"
              >
                <DropdownMenuItem
                  onClick={() => handleBulkAction("enable-essentials")}
                  className="cursor-pointer focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                >
                  Enable essentials for all rooms
                </DropdownMenuItem>
                {basics.bhk && (
                  <DropdownMenuItem
                    onClick={() => handleBulkAction("set-typical-sizes")}
                    className="cursor-pointer focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                  >
                    Set typical sizes for {basics.bhk.toUpperCase()}
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem
                  onClick={() => handleBulkAction("reset-packages")}
                  className="cursor-pointer focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                >
                  Reset all packages to Global ({countOverrides()} overrides)
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="section-content px-4 pb-4 pt-1">
          <div className="space-y-6">
            {/* Bedrooms */}
            {rooms.bedrooms.map((bedroom) => (
              <Card key={bedroom.id} className="elegant-card">
                <CardHeader className="pb-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-4 h-4 text-secondary-foreground"
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
                      <CardTitle className="text-sm font-semibold truncate">
                        {bedroom.role} Bedroom
                      </CardTitle>
                      <Select
                        value={bedroom.role}
                        onValueChange={(value: BedroomRole) => {
                          analytics.bedroomRoleChanged(bedroom.role, value);
                          updateBedroom(bedroom.id, { role: value });
                        }}
                      >
                        <SelectTrigger className="calculator-select w-28 h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                          <SelectItem
                            value="Master"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            Master
                          </SelectItem>
                          <SelectItem
                            value="Kid"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            Kid
                          </SelectItem>
                          <SelectItem
                            value="Guest"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            Guest
                          </SelectItem>
                          <SelectItem
                            value="Other"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {rooms.bedrooms.length > 1 && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          analytics.bedroomRemoved(bedroom.role);
                          removeBedroom(bedroom.id);
                        }}
                        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Room Size */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="field-label text-xs">Room Size</Label>
                      <Select
                        value={bedroom.size}
                        onValueChange={(value: BedroomSize) =>
                          handleBedroomSizeChange(bedroom.id, value)
                        }
                      >
                        <SelectTrigger className="calculator-select mt-1 h-9 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                          <SelectItem
                            value="14x16"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            14&apos; × 16&apos;
                          </SelectItem>
                          <SelectItem
                            value="10x12"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            10&apos; × 12&apos;
                          </SelectItem>
                          <SelectItem
                            value="10x10"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            10&apos; × 10&apos;
                          </SelectItem>
                          <SelectItem
                            value="11.5x11.5"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            11.5&apos; × 11.5&apos;
                          </SelectItem>
                          <SelectItem
                            value="custom"
                            className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                          >
                            Custom
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {bedroom.size === "custom" && (
                      <div>
                        <Label className="field-label text-xs">
                          Custom Size
                        </Label>
                        <Input
                          placeholder="e.g., 10x12 or 85 m²"
                          value={bedroom.customSize || ""}
                          onChange={(e) =>
                            handleBedroomSizeChange(
                              bedroom.id,
                              "custom",
                              e.target.value
                            )
                          }
                          className="calculator-input mt-1 h-9 text-xs"
                        />
                        {sizeWarnings[`bedroom-${bedroom.id}`] && (
                          <p className="text-[11px] text-amber-600 mt-1 flex items-center gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {sizeWarnings[`bedroom-${bedroom.id}`]}
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Room Presets */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <Label className="text-[11px] text-muted-foreground">
                      Quick presets:
                    </Label>
                    {(
                      [
                        "Bare",
                        "Essentials",
                        "Storage+Study",
                        "Feature Wall",
                      ] as RoomPreset[]
                    ).map((preset) => (
                      <Button
                        key={preset}
                        variant={
                          selectedPresets[bedroom.id] === preset
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleRoomPreset(bedroom.id, preset)}
                        className={`h-7 px-2 text-[11px] ${
                          selectedPresets[bedroom.id] === preset
                            ? "bg-secondary text-secondary-foreground"
                            : "calculator-button-secondary"
                        }`}
                      >
                        {preset}
                      </Button>
                    ))}
                  </div>

                  {/* Items */}
                  <div className="grid grid-cols-1 gap-3 pt-1">
                    {Object.entries(bedroom.items).map(([itemKey, item]) => {
                      if (!item) return null;
                      const itemLabels: Record<string, string> = {
                        wardrobe: "Wardrobe",
                        studyTable: "Study Table",
                        tvUnit: "TV Unit",
                        bedBackPanel: "Bed Back Panel",
                      };

                      return (
                        <div
                          key={itemKey}
                          className="border border-border rounded-lg p-3 bg-muted/30"
                        >
                          <div className="flex flex-col gap-2">
                            <div
                              className="flex items-center space-x-3 cursor-pointer"
                              onClick={() => {
                                const newEnabled = !item.enabled;
                                updateBedroom(bedroom.id, {
                                  items: {
                                    ...bedroom.items,
                                    [itemKey]: { ...item, enabled: newEnabled },
                                  },
                                });
                                analytics.itemToggled(
                                  bedroom.role,
                                  itemLabels[itemKey],
                                  newEnabled
                                );
                              }}
                            >
                              <Switch checked={item.enabled} />
                              <Label className="field-label cursor-pointer text-xs">
                                {itemLabels[itemKey]}
                              </Label>
                            </div>

                            {item.enabled && (
                              <PackagePicker
                                globalPkg={basics.pkg}
                                currentPackage={item.pkgOverride}
                                onPackageChange={(pkg) => {
                                  updateBedroom(bedroom.id, {
                                    items: {
                                      ...bedroom.items,
                                      [itemKey]: {
                                        ...item,
                                        pkgOverride: pkg,
                                      },
                                    },
                                  });
                                  if (pkg) {
                                    analytics.itemPkgOverrideSet(
                                      bedroom.role,
                                      itemLabels[itemKey],
                                      pkg
                                    );
                                  } else {
                                    analytics.itemPkgOverrideReset(
                                      bedroom.role,
                                      itemLabels[itemKey]
                                    );
                                  }
                                }}
                                itemName={itemLabels[itemKey]}
                              />
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add Bedroom Button */}
            <Button
              variant="outline"
              onClick={() => {
                addBedroom();
                analytics.bedroomAdded("Other");
              }}
              className="w-full border-dashed border-2 border-border hover:bg-muted/50 h-11 text-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Bedroom
            </Button>

            {/* Living Room */}
            <Card className="elegant-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-accent-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    Living Room
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="field-label text-xs">Room Size</Label>
                    <Select
                      value={rooms.living.size}
                      onValueChange={(value: LivingSize) => {
                        setRooms({ living: { ...rooms.living, size: value } });
                        analytics.roomSizeChanged("Living", value);
                      }}
                    >
                      <SelectTrigger className="calculator-select mt-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                        <SelectItem
                          value="7x10"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          7&apos; × 10&apos;
                        </SelectItem>
                        <SelectItem
                          value="10x13"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          10&apos; × 13&apos;
                        </SelectItem>
                        <SelectItem
                          value="12x18"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          12&apos; × 18&apos;
                        </SelectItem>
                        <SelectItem
                          value="15x20"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          15&apos; × 20&apos;
                        </SelectItem>
                        <SelectItem
                          value="custom"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rooms.living.size === "custom" && (
                    <div>
                      <Label className="field-label text-xs">Custom Size</Label>
                      <Input
                        placeholder="e.g., 12x18"
                        value={rooms.living.customSize || ""}
                        onChange={(e) =>
                          setRooms({
                            living: {
                              ...rooms.living,
                              customSize: e.target.value,
                            },
                          })
                        }
                        className="calculator-input mt-1 h-9 text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {/* TV Drawer Unit */}
                  <div className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled = !rooms.living.tvDrawerUnit.enabled;
                          setRooms({
                            living: {
                              ...rooms.living,
                              tvDrawerUnit: {
                                ...rooms.living.tvDrawerUnit,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled(
                            "Living",
                            "TV Drawer Unit",
                            newEnabled
                          );
                        }}
                      >
                        <Switch checked={rooms.living.tvDrawerUnit.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          TV Drawer Unit
                        </Label>
                      </div>

                      {rooms.living.tvDrawerUnit.enabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={rooms.living.tvDrawerUnit.pkgOverride}
                          onPackageChange={(pkg) => {
                            setRooms({
                              living: {
                                ...rooms.living,
                                tvDrawerUnit: {
                                  ...rooms.living.tvDrawerUnit,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Living",
                                "TV Drawer Unit",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Living",
                                "TV Drawer Unit"
                              );
                            }
                          }}
                          itemName="TV Drawer Unit"
                        />
                      )}
                    </div>
                  </div>

                  {/* TV Panel */}
                  <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-3">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled = !rooms.living.tvPanel.enabled;
                          setRooms({
                            living: {
                              ...rooms.living,
                              tvPanel: {
                                ...rooms.living.tvPanel,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled(
                            "Living",
                            "TV Panel",
                            newEnabled
                          );
                        }}
                      >
                        <Switch checked={rooms.living.tvPanel.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          TV Unit Panelling
                        </Label>
                      </div>

                      {rooms.living.tvPanel.enabled && (
                        <>
                          <PackagePicker
                            globalPkg={basics.pkg}
                            currentPackage={rooms.living.tvPanel.pkgOverride}
                            onPackageChange={(pkg) => {
                              setRooms({
                                living: {
                                  ...rooms.living,
                                  tvPanel: {
                                    ...rooms.living.tvPanel,
                                    pkgOverride: pkg,
                                  },
                                },
                              });
                              if (pkg) {
                                analytics.itemPkgOverrideSet(
                                  "Living",
                                  "TV Panel",
                                  pkg
                                );
                              } else {
                                analytics.itemPkgOverrideReset(
                                  "Living",
                                  "TV Panel"
                                );
                              }
                            }}
                            itemName="TV Panel"
                          />

                          {/* TV Panel presets */}
                          <div className="flex flex-wrap gap-2 items-center">
                            <Label className="text-[11px] text-muted-foreground">
                              Quick presets:
                            </Label>
                            {(
                              ["Small", "Medium", "Feature"] as TVPanelPreset[]
                            ).map((preset) => (
                              <Button
                                key={preset}
                                variant={
                                  selectedTVPreset === preset
                                    ? "default"
                                    : "outline"
                                }
                                size="sm"
                                onClick={() => handleTVPanelPreset(preset)}
                                className={`h-7 px-2 text-[11px] ${
                                  selectedTVPreset === preset
                                    ? "bg-accent text-accent-foreground"
                                    : "calculator-button-secondary"
                                }`}
                              >
                                {preset}
                              </Button>
                            ))}
                          </div>

                          <div>
                            <Label className="field-label text-xs">
                              Panel Area (sq ft)
                            </Label>
                            <Input
                              type="number"
                              value={rooms.living.tvPanel.panelSqft || ""}
                              onChange={(e) =>
                                setRooms({
                                  living: {
                                    ...rooms.living,
                                    tvPanel: {
                                      ...rooms.living.tvPanel,
                                      panelSqft: Number(e.target.value),
                                    },
                                  },
                                })
                              }
                              className="calculator-input mt-1 h-9 text-xs"
                              placeholder="60"
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pooja Room */}
            <Card className="elegant-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-secondary-foreground"
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
                  <CardTitle className="text-sm font-semibold">
                    Pooja Room
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="field-label text-xs">Room Size</Label>
                    <Select
                      value={rooms.pooja.size}
                      onValueChange={(value: PoojaSize) => {
                        setRooms({ pooja: { ...rooms.pooja, size: value } });
                        analytics.roomSizeChanged("Pooja", value);
                      }}
                    >
                      <SelectTrigger className="calculator-select mt-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                        <SelectItem
                          value="9x9"
                          className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                        >
                          9&apos; × 9&apos;
                        </SelectItem>
                        <SelectItem
                          value="3x3"
                          className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                        >
                          3&apos; × 3&apos;
                        </SelectItem>
                        <SelectItem
                          value="custom"
                          className="focus:bg-secondary/10 focus:text-foreground text-popover-foreground"
                        >
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rooms.pooja.size === "custom" && (
                    <div>
                      <Label className="field-label text-xs">Custom Size</Label>
                      <Input
                        placeholder="e.g., 5x6"
                        value={rooms.pooja.customSize || ""}
                        onChange={(e) =>
                          setRooms({
                            pooja: {
                              ...rooms.pooja,
                              customSize: e.target.value,
                            },
                          })
                        }
                        className="calculator-input mt-1 h-9 text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  <div className="border border-border rounded-lg p-3 bg-muted/30 space-y-3">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled = !rooms.pooja.doors.enabled;
                          setRooms({
                            pooja: {
                              ...rooms.pooja,
                              doors: {
                                ...rooms.pooja.doors,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled("Pooja", "Doors", newEnabled);
                        }}
                      >
                        <Switch checked={rooms.pooja.doors.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          Doors
                        </Label>
                      </div>

                      {rooms.pooja.doors.enabled && (
                        <>
                          <PackagePicker
                            globalPkg={basics.pkg}
                            currentPackage={rooms.pooja.doors.pkgOverride}
                            onPackageChange={(pkg) => {
                              setRooms({
                                pooja: {
                                  ...rooms.pooja,
                                  doors: {
                                    ...rooms.pooja.doors,
                                    pkgOverride: pkg,
                                  },
                                },
                              });
                              if (pkg) {
                                analytics.itemPkgOverrideSet(
                                  "Pooja",
                                  "Doors",
                                  pkg
                                );
                              } else {
                                analytics.itemPkgOverrideReset(
                                  "Pooja",
                                  "Doors"
                                );
                              }
                            }}
                            itemName="Doors"
                          />

                          <div>
                            <Label className="field-label text-xs">
                              Number of Doors
                            </Label>
                            <Input
                              type="number"
                              value={rooms.pooja.doors.qty || ""}
                              onChange={(e) =>
                                setRooms({
                                  pooja: {
                                    ...rooms.pooja,
                                    doors: {
                                      ...rooms.pooja.doors,
                                      qty: Number(e.target.value),
                                    },
                                  },
                                })
                              }
                              className="calculator-input mt-1 h-9 text-xs"
                              placeholder="0"
                              min={0}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Kitchen */}
            <Card className="elegant-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-4 h-4 text-accent-foreground"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 6h18M3 12h18M3 18h18"
                      />
                    </svg>
                  </div>
                  <CardTitle className="text-sm font-semibold">
                    Kitchen
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-3">
                  <div>
                    <Label className="field-label text-xs">Kitchen Type</Label>
                    <Select
                      value={rooms.kitchen.type}
                      onValueChange={(value: KitchenType) =>
                        handleKitchenTypeOrSizeChange(value, undefined)
                      }
                    >
                      <SelectTrigger className="calculator-select mt-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                        <SelectItem
                          value="Parallel"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          Parallel
                        </SelectItem>
                        <SelectItem
                          value="L-shaped"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          L-shaped
                        </SelectItem>
                        <SelectItem
                          value="Island"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          Island
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="field-label text-xs">Kitchen Size</Label>
                    <Select
                      value={rooms.kitchen.size}
                      onValueChange={(value: KitchenSize) =>
                        handleKitchenTypeOrSizeChange(undefined, value)
                      }
                    >
                      <SelectTrigger className="calculator-select mt-1 h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-popover border-border text-popover-foreground text-xs">
                        <SelectItem
                          value="8x10"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          8&apos; × 10&apos;
                        </SelectItem>
                        <SelectItem
                          value="10x12"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          10&apos; × 12&apos;
                        </SelectItem>
                        <SelectItem
                          value="12x14"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          12&apos; × 14&apos;
                        </SelectItem>
                        <SelectItem
                          value="custom"
                          className="focus:bg-accent/10 focus:text-foreground text-popover-foreground"
                        >
                          Custom
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {rooms.kitchen.size === "custom" && (
                    <div>
                      <Label className="field-label text-xs">Custom Size</Label>
                      <Input
                        placeholder="e.g., 10x14"
                        value={rooms.kitchen.customSize || ""}
                        onChange={(e) =>
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              customSize: e.target.value,
                            },
                          })
                        }
                        className="calculator-input mt-1 h-9 text-xs"
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-3 pt-1">
                  {/* Base Unit */}
                  <div className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled = !rooms.kitchen.baseUnit.enabled;
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              baseUnit: {
                                ...rooms.kitchen.baseUnit,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled(
                            "Kitchen",
                            "Base Unit",
                            newEnabled
                          );
                        }}
                      >
                        <Switch checked={rooms.kitchen.baseUnit.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          Base Unit
                        </Label>
                      </div>

                      {rooms.kitchen.baseUnit.enabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={rooms.kitchen.baseUnit.pkgOverride}
                          onPackageChange={(pkg) => {
                            setRooms({
                              kitchen: {
                                ...rooms.kitchen,
                                baseUnit: {
                                  ...rooms.kitchen.baseUnit,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Kitchen",
                                "Base Unit",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Kitchen",
                                "Base Unit"
                              );
                            }
                          }}
                          itemName="Base Unit"
                        />
                      )}
                    </div>
                  </div>

                  {/* Quantity inputs */}
                  <div className="grid grid-cols-1 gap-3">
                    <div>
                      <Label className="field-label text-xs">
                        Tandem Baskets
                      </Label>
                      <Input
                        type="number"
                        value={rooms.kitchen.tandemBaskets.qty || ""}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              tandemBaskets: {
                                ...rooms.kitchen.tandemBaskets,
                                qty,
                                enabled: qty > 0,
                              },
                            },
                          });
                          analytics.kitchenAccessoryQtyChanged(
                            "Tandem Baskets",
                            qty
                          );
                        }}
                        className="calculator-input mt-1 h-9 text-xs"
                        placeholder="0"
                        min={0}
                      />
                    </div>
                    <div>
                      <Label className="field-label text-xs">
                        Bottle Pullout
                      </Label>
                      <Input
                        type="number"
                        value={rooms.kitchen.bottlePullout.qty || ""}
                        onChange={(e) => {
                          const qty = Number(e.target.value);
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              bottlePullout: {
                                ...rooms.kitchen.bottlePullout,
                                qty,
                                enabled: qty > 0,
                              },
                            },
                          });
                          analytics.kitchenAccessoryQtyChanged(
                            "Bottle Pullout",
                            qty
                          );
                        }}
                        className="calculator-input mt-1 h-9 text-xs"
                        placeholder="0"
                        min={0}
                      />
                    </div>
                  </div>

                  {rooms.kitchen.tandemBaskets.qty > 0 && (
                    <div className="border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex flex-col gap-2">
                        <Label className="field-label text-xs">
                          Tandem Baskets ({rooms.kitchen.tandemBaskets.qty})
                        </Label>
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            rooms.kitchen.tandemBaskets.pkgOverride
                          }
                          onPackageChange={(pkg) => {
                            setRooms({
                              kitchen: {
                                ...rooms.kitchen,
                                tandemBaskets: {
                                  ...rooms.kitchen.tandemBaskets,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Kitchen",
                                "Tandem Baskets",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Kitchen",
                                "Tandem Baskets"
                              );
                            }
                          }}
                          itemName="Tandem Baskets"
                        />
                      </div>
                    </div>
                  )}

                  {rooms.kitchen.bottlePullout.qty > 0 && (
                    <div className="border border-border rounded-lg p-3 bg-muted/30">
                      <div className="flex flex-col gap-2">
                        <Label className="field-label text-xs">
                          Bottle Pullout ({rooms.kitchen.bottlePullout.qty})
                        </Label>
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            rooms.kitchen.bottlePullout.pkgOverride
                          }
                          onPackageChange={(pkg) => {
                            setRooms({
                              kitchen: {
                                ...rooms.kitchen,
                                bottlePullout: {
                                  ...rooms.kitchen.bottlePullout,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Kitchen",
                                "Bottle Pullout",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Kitchen",
                                "Bottle Pullout"
                              );
                            }
                          }}
                          itemName="Bottle Pullout"
                        />
                      </div>
                    </div>
                  )}

                  {/* Corner & Wicker */}
                  <div className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled = !rooms.kitchen.cornerUnit.enabled;
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              cornerUnit: {
                                ...rooms.kitchen.cornerUnit,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled(
                            "Kitchen",
                            "Corner Unit",
                            newEnabled
                          );
                        }}
                      >
                        <Switch checked={rooms.kitchen.cornerUnit.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          Corner Unit
                        </Label>
                      </div>
                      {rooms.kitchen.cornerUnit.enabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={rooms.kitchen.cornerUnit.pkgOverride}
                          onPackageChange={(pkg) => {
                            setRooms({
                              kitchen: {
                                ...rooms.kitchen,
                                cornerUnit: {
                                  ...rooms.kitchen.cornerUnit,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Kitchen",
                                "Corner Unit",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Kitchen",
                                "Corner Unit"
                              );
                            }
                          }}
                          itemName="Corner Unit"
                        />
                      )}
                    </div>
                  </div>

                  <div className="border border-border rounded-lg p-3 bg-muted/30">
                    <div className="flex flex-col gap-3">
                      <div
                        className="flex items-center space-x-3 cursor-pointer"
                        onClick={() => {
                          const newEnabled =
                            !rooms.kitchen.wickerBasket.enabled;
                          setRooms({
                            kitchen: {
                              ...rooms.kitchen,
                              wickerBasket: {
                                ...rooms.kitchen.wickerBasket,
                                enabled: newEnabled,
                              },
                            },
                          });
                          analytics.itemToggled(
                            "Kitchen",
                            "Wicker Basket",
                            newEnabled
                          );
                        }}
                      >
                        <Switch checked={rooms.kitchen.wickerBasket.enabled} />
                        <Label className="field-label cursor-pointer text-sm">
                          Wicker Basket
                        </Label>
                      </div>
                      {rooms.kitchen.wickerBasket.enabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            rooms.kitchen.wickerBasket.pkgOverride
                          }
                          onPackageChange={(pkg) => {
                            setRooms({
                              kitchen: {
                                ...rooms.kitchen,
                                wickerBasket: {
                                  ...rooms.kitchen.wickerBasket,
                                  pkgOverride: pkg,
                                },
                              },
                            });
                            if (pkg) {
                              analytics.itemPkgOverrideSet(
                                "Kitchen",
                                "Wicker Basket",
                                pkg
                              );
                            } else {
                              analytics.itemPkgOverrideReset(
                                "Kitchen",
                                "Wicker Basket"
                              );
                            }
                          }}
                          itemName="Wicker Basket"
                        />
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="w-full bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-11 rounded-lg text-sm font-semibold shadow-md"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>

              <Button
                variant="outline"
                onClick={handleReset}
                className="w-full bg-white/50 backdrop-blur-md border-white/40 text-foreground hover:bg-white/70 h-11 rounded-lg text-sm font-semibold shadow-md"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>

              <Button
                onClick={handleNext}
                className="w-full btn-enhanced-primary h-11 rounded-lg text-sm font-semibold"
              >
                Next
                <svg
                  className="w-4 h-4 ml-2"
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
        </CardContent>
      </div>
    </div>
  );
}
