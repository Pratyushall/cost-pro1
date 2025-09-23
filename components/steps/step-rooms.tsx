// components/steps/step-rooms.tsx
"use client";

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackagePicker } from "@/components/package-picker";
import { ArrowLeft } from "lucide-react";
import type {
  BedroomSize,
  LivingSize,
  KitchenSize,
  KitchenType,
  PoojaSize,
} from "@/lib/types";

export function StepRooms() {
  const { rooms, updateRooms, setCurrentStep, basics } = useEstimatorStore();

  const updateRoom = (roomType: keyof typeof rooms, updates: any) => {
    updateRooms(roomType, updates);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">Rooms & Items</CardTitle>
        <p className="text-gray-600">
          Configure each room and select the items you want to include
        </p>
      </CardHeader>

      <div className="space-y-8">
        {/* Master Bedroom */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Master Bedroom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Room Size</Label>
                <Select
                  value={rooms.master.size}
                  onValueChange={(value: BedroomSize) =>
                    updateRoom("master", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="14x16">14&apos; × 16&apos;</SelectItem>
                    <SelectItem value="10x12">10&apos; × 12&apos;</SelectItem>
                    <SelectItem value="10x10">10&apos; × 10&apos;</SelectItem>
                    <SelectItem value="11.5x11.5">
                      11.5&apos; × 11.5&apos;
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "tvUnit", label: "TV Unit" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => {
                const itemData =
                  rooms.master[item.key as keyof typeof rooms.master];
                const isEnabled =
                  typeof itemData === "object" && "enabled" in itemData
                    ? (itemData as any).enabled
                    : false;

                return (
                  <div key={item.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            updateRoom("master", {
                              [item.key]: { enabled: checked },
                            })
                          }
                          className="toggle-switch"
                        />
                        <Label className="text-black font-medium">
                          {item.label}
                        </Label>
                      </div>

                      {isEnabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            typeof itemData === "object" &&
                            "pkgOverride" in itemData
                              ? (itemData as any).pkgOverride
                              : null
                          }
                          onPackageChange={(pkg) =>
                            updateRoom("master", {
                              [item.key]: {
                                ...(typeof itemData === "object"
                                  ? itemData
                                  : { enabled: true }),
                                pkgOverride: pkg,
                              },
                            })
                          }
                          itemName={item.label}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Children Bedroom */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">
              Children&apos;s Bedroom
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Room Size</Label>
                <Select
                  value={rooms.children.size}
                  onValueChange={(value: BedroomSize) =>
                    updateRoom("children", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="14x16">14&apos; × 16&apos;</SelectItem>
                    <SelectItem value="10x12">10&apos; × 12&apos;</SelectItem>
                    <SelectItem value="10x10">10&apos; × 10&apos;</SelectItem>
                    <SelectItem value="11.5x11.5">
                      11.5&apos; × 11.5&apos;
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => {
                const itemData =
                  rooms.children[item.key as keyof typeof rooms.children];
                const isEnabled =
                  typeof itemData === "object" && "enabled" in itemData
                    ? (itemData as any).enabled
                    : false;

                return (
                  <div key={item.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            updateRoom("children", {
                              [item.key]: { enabled: checked },
                            })
                          }
                          className="toggle-switch"
                        />
                        <Label className="text-black font-medium">
                          {item.label}
                        </Label>
                      </div>

                      {isEnabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            typeof itemData === "object" &&
                            "pkgOverride" in itemData
                              ? (itemData as any).pkgOverride
                              : null
                          }
                          onPackageChange={(pkg) =>
                            updateRoom("children", {
                              [item.key]: {
                                ...(typeof itemData === "object"
                                  ? itemData
                                  : { enabled: true }),
                                pkgOverride: pkg,
                              },
                            })
                          }
                          itemName={item.label}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Guest Bedroom */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Guest Bedroom</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Room Size</Label>
                <Select
                  value={rooms.guest.size}
                  onValueChange={(value: BedroomSize) =>
                    updateRoom("guest", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="14x16">14&apos; × 16&apos;</SelectItem>
                    <SelectItem value="10x12">10&apos; × 12&apos;</SelectItem>
                    <SelectItem value="10x10">10&apos; × 10&apos;</SelectItem>
                    <SelectItem value="11.5x11.5">
                      11.5&apos; × 11.5&apos;
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => {
                const itemData =
                  rooms.guest[item.key as keyof typeof rooms.guest];
                const isEnabled =
                  typeof itemData === "object" && "enabled" in itemData
                    ? (itemData as any).enabled
                    : false;

                return (
                  <div key={item.key} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center space-x-3">
                        <Switch
                          checked={isEnabled}
                          onCheckedChange={(checked) =>
                            updateRoom("guest", {
                              [item.key]: { enabled: checked },
                            })
                          }
                          className="toggle-switch"
                        />
                        <Label className="text-black font-medium">
                          {item.label}
                        </Label>
                      </div>

                      {isEnabled && (
                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            typeof itemData === "object" &&
                            "pkgOverride" in itemData
                              ? (itemData as any).pkgOverride
                              : null
                          }
                          onPackageChange={(pkg) =>
                            updateRoom("guest", {
                              [item.key]: {
                                ...(typeof itemData === "object"
                                  ? itemData
                                  : { enabled: true }),
                                pkgOverride: pkg,
                              },
                            })
                          }
                          itemName={item.label}
                        />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Living Room */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Living Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Room Size</Label>
                <Select
                  value={rooms.living.size}
                  onValueChange={(value: LivingSize) =>
                    updateRoom("living", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="7x10">7&apos; × 10&apos;</SelectItem>
                    <SelectItem value="10x13">10&apos; × 13&apos;</SelectItem>
                    <SelectItem value="12x18">12&apos; × 18&apos;</SelectItem>
                    <SelectItem value="15x20">15&apos; × 20&apos;</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {/* TV Drawer Unit */}
              <div className="border rounded-lg p-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rooms.living.tvDrawerUnit?.enabled || false}
                      onCheckedChange={(checked) =>
                        updateRoom("living", {
                          tvDrawerUnit: { enabled: checked },
                        })
                      }
                      className="toggle-switch"
                    />
                    <Label className="text-black font-medium">
                      TV Drawer Unit
                    </Label>
                  </div>

                  {rooms.living.tvDrawerUnit?.enabled && (
                    <PackagePicker
                      globalPkg={basics.pkg}
                      currentPackage={
                        rooms.living.tvDrawerUnit?.pkgOverride || null
                      }
                      onPackageChange={(pkg) =>
                        updateRoom("living", {
                          tvDrawerUnit: {
                            ...rooms.living.tvDrawerUnit,
                            pkgOverride: pkg,
                          },
                        })
                      }
                      itemName="TV Drawer Unit"
                    />
                  )}
                </div>
              </div>

              {/* TV Unit Panelling */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rooms.living.tvPanel?.enabled || false}
                      onCheckedChange={(checked) =>
                        updateRoom("living", {
                          tvPanel: {
                            ...rooms.living.tvPanel,
                            enabled: checked,
                          },
                        })
                      }
                      className="toggle-switch"
                    />
                    <Label className="text-black font-medium">
                      TV Unit Panelling
                    </Label>
                  </div>

                  {rooms.living.tvPanel?.enabled && (
                    <PackagePicker
                      globalPkg={basics.pkg}
                      currentPackage={rooms.living.tvPanel?.pkgOverride || null}
                      onPackageChange={(pkg) =>
                        updateRoom("living", {
                          tvPanel: {
                            ...rooms.living.tvPanel,
                            pkgOverride: pkg,
                          },
                        })
                      }
                      itemName="TV Panel"
                    />
                  )}
                </div>

                {rooms.living.tvPanel?.enabled && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-black text-sm">
                        Panel Area (sq ft)
                      </Label>
                      <Input
                        type="number"
                        value={rooms.living.tvPanel?.panelSqft || ""}
                        onChange={(e) =>
                          updateRoom("living", {
                            tvPanel: {
                              ...rooms.living.tvPanel,
                              panelSqft: Number(e.target.value),
                            },
                          })
                        }
                        className="bg-white border-gray-300 mt-1"
                        placeholder="60"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pooja Room */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Pooja Room</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Room Size</Label>
                <Select
                  value={rooms.pooja.size}
                  onValueChange={(value: PoojaSize) =>
                    updateRoom("pooja", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="9x9">9&apos; × 9&apos;</SelectItem>
                    <SelectItem value="3x3">3&apos; × 3&apos;</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {/* Doors */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <Switch
                      checked={rooms.pooja.doors?.enabled || false}
                      onCheckedChange={(checked) =>
                        updateRoom("pooja", {
                          doors: {
                            ...rooms.pooja.doors,
                            enabled: checked,
                          },
                        })
                      }
                      className="toggle-switch"
                    />
                    <Label className="text-black font-medium">Doors</Label>
                  </div>

                  {rooms.pooja.doors?.enabled && (
                    <PackagePicker
                      globalPkg={basics.pkg}
                      currentPackage={rooms.pooja.doors?.pkgOverride || null}
                      onPackageChange={(pkg) =>
                        updateRoom("pooja", {
                          doors: {
                            ...rooms.pooja.doors,
                            pkgOverride: pkg,
                          },
                        })
                      }
                      itemName="Doors"
                    />
                  )}
                </div>

                {rooms.pooja.doors?.enabled && (
                  <div>
                    <Label className="text-black text-sm">
                      Number of Doors
                    </Label>
                    <Input
                      type="number"
                      value={rooms.pooja.doors?.qty || ""}
                      onChange={(e) =>
                        updateRoom("pooja", {
                          doors: {
                            ...rooms.pooja.doors,
                            qty: Number(e.target.value),
                          },
                        })
                      }
                      className="bg-white border-gray-300 mt-1"
                      placeholder="0"
                      min={0}
                    />
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Kitchen */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">Kitchen</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="text-black font-medium">Kitchen Type</Label>
                <Select
                  value={rooms.kitchen.type}
                  onValueChange={(value: KitchenType | "Modular") =>
                    updateRoom("kitchen", { type: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Parallel">Parallel</SelectItem>
                    <SelectItem value="L-shaped">L-shaped</SelectItem>
                    <SelectItem value="Island">Island</SelectItem>
                    <SelectItem value="Modular">Modular Kitchen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black font-medium">Kitchen Size</Label>
                <Select
                  value={rooms.kitchen.size}
                  onValueChange={(value: KitchenSize) =>
                    updateRoom("kitchen", { size: value })
                  }
                >
                  <SelectTrigger className="bg-white border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="8x10">8&apos; × 10&apos;</SelectItem>
                    <SelectItem value="10x12">10&apos; × 12&apos;</SelectItem>
                    <SelectItem value="12x14">12&apos; × 14&apos;</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              {/* Base Unit */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={rooms.kitchen.baseUnit?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateRoom("kitchen", { baseUnit: { enabled: checked } })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black">Base Unit</Label>
                </div>

                {rooms.kitchen.baseUnit?.enabled && (
                  <PackagePicker
                    globalPkg={basics.pkg}
                    currentPackage={rooms.kitchen.baseUnit?.pkgOverride || null}
                    onPackageChange={(pkg) =>
                      updateRoom("kitchen", {
                        baseUnit: {
                          ...rooms.kitchen.baseUnit,
                          pkgOverride: pkg,
                        },
                      })
                    }
                    itemName="Base Unit"
                  />
                )}
              </div>

              {/* Quantity inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-black text-sm">Tandem Baskets</Label>
                  <Input
                    type="number"
                    value={rooms.kitchen.tandemBaskets?.qty || ""}
                    onChange={(e) =>
                      updateRoom("kitchen", {
                        tandemBaskets: {
                          ...rooms.kitchen.tandemBaskets,
                          qty: Number(e.target.value),
                          enabled: Number(e.target.value) > 0,
                        },
                      })
                    }
                    className="bg-white border-gray-300"
                    placeholder="0"
                    min={0}
                  />
                </div>
                <div>
                  <Label className="text-black text-sm">Bottle Pullout</Label>
                  <Input
                    type="number"
                    value={rooms.kitchen.bottlePullout?.qty || ""}
                    onChange={(e) =>
                      updateRoom("kitchen", {
                        bottlePullout: {
                          ...rooms.kitchen.bottlePullout,
                          qty: Number(e.target.value),
                          enabled: Number(e.target.value) > 0,
                        },
                      })
                    }
                    className="bg-white border-gray-300"
                    placeholder="0"
                    min={0}
                  />
                </div>
              </div>

              {(rooms.kitchen.tandemBaskets?.qty || 0) > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label className="text-black">
                    Tandem Baskets ({rooms.kitchen.tandemBaskets?.qty || 0})
                  </Label>
                  <PackagePicker
                    globalPkg={basics.pkg}
                    currentPackage={
                      rooms.kitchen.tandemBaskets?.pkgOverride || null
                    }
                    onPackageChange={(pkg) =>
                      updateRoom("kitchen", {
                        tandemBaskets: {
                          ...rooms.kitchen.tandemBaskets,
                          pkgOverride: pkg,
                        },
                      })
                    }
                    itemName="Tandem Baskets"
                  />
                </div>
              )}

              {(rooms.kitchen.bottlePullout?.qty || 0) > 0 && (
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label className="text-black">
                    Bottle Pullout ({rooms.kitchen.bottlePullout?.qty || 0})
                  </Label>
                  <PackagePicker
                    globalPkg={basics.pkg}
                    currentPackage={
                      rooms.kitchen.bottlePullout?.pkgOverride || null
                    }
                    onPackageChange={(pkg) =>
                      updateRoom("kitchen", {
                        bottlePullout: {
                          ...rooms.kitchen.bottlePullout,
                          pkgOverride: pkg,
                        },
                      })
                    }
                    itemName="Bottle Pullout"
                  />
                </div>
              )}

              {/* Corner & Wicker */}
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={rooms.kitchen.cornerUnit?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateRoom("kitchen", {
                        cornerUnit: { enabled: checked },
                      })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black">Corner Unit</Label>
                </div>
                {rooms.kitchen.cornerUnit?.enabled && (
                  <PackagePicker
                    globalPkg={basics.pkg}
                    currentPackage={
                      rooms.kitchen.cornerUnit?.pkgOverride || null
                    }
                    onPackageChange={(pkg) =>
                      updateRoom("kitchen", {
                        cornerUnit: {
                          ...rooms.kitchen.cornerUnit,
                          pkgOverride: pkg,
                        },
                      })
                    }
                    itemName="Corner Unit"
                  />
                )}
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Switch
                    checked={rooms.kitchen.wickerBasket?.enabled || false}
                    onCheckedChange={(checked) =>
                      updateRoom("kitchen", {
                        wickerBasket: { enabled: checked },
                      })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black">Wicker Basket</Label>
                </div>
                {rooms.kitchen.wickerBasket?.enabled && (
                  <PackagePicker
                    globalPkg={basics.pkg}
                    currentPackage={
                      rooms.kitchen.wickerBasket?.pkgOverride || null
                    }
                    onPackageChange={(pkg) =>
                      updateRoom("kitchen", {
                        wickerBasket: {
                          ...rooms.kitchen.wickerBasket,
                          pkgOverride: pkg,
                        },
                      })
                    }
                    itemName="Wicker Basket"
                  />
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(2)}
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep(4)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
