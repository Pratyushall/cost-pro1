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
import { ArrowLeft } from "lucide-react";
import type {
  BedroomSize,
  LivingSize,
  KitchenSize,
  KitchenType,
  PoojaSize,
} from "@/lib/types";

export function StepRooms() {
  const { rooms, setRooms, setCurrentStep } = useEstimatorStore();

  const updateRoom = (roomType: keyof typeof rooms, updates: any) => {
    setRooms({
      [roomType]: { ...rooms[roomType], ...updates },
    });
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
                    <SelectItem value="14x16">14' × 16'</SelectItem>
                    <SelectItem value="10x12">10' × 12'</SelectItem>
                    <SelectItem value="10x10">10' × 10'</SelectItem>
                    <SelectItem value="11.5x11.5">11.5' × 11.5'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "tvUnit", label: "TV Unit" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Switch
                    checked={
                      rooms.master[
                        item.key as keyof typeof rooms.master
                      ] as boolean
                    }
                    onCheckedChange={(checked) =>
                      updateRoom("master", { [item.key]: checked })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black text-sm">{item.label}</Label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Children Bedroom */}
        <Card className="border border-gray-200">
          <CardHeader>
            <CardTitle className="text-lg text-black">
              Children's Bedroom
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
                    <SelectItem value="14x16">14' × 16'</SelectItem>
                    <SelectItem value="10x12">10' × 12'</SelectItem>
                    <SelectItem value="10x10">10' × 10'</SelectItem>
                    <SelectItem value="11.5x11.5">11.5' × 11.5'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Switch
                    checked={
                      rooms.children[
                        item.key as keyof typeof rooms.children
                      ] as boolean
                    }
                    onCheckedChange={(checked) =>
                      updateRoom("children", { [item.key]: checked })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black text-sm">{item.label}</Label>
                </div>
              ))}
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
                    <SelectItem value="14x16">14' × 16'</SelectItem>
                    <SelectItem value="10x12">10' × 12'</SelectItem>
                    <SelectItem value="10x10">10' × 10'</SelectItem>
                    <SelectItem value="11.5x11.5">11.5' × 11.5'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {[
                { key: "wardrobe", label: "Wardrobe" },
                { key: "studyTable", label: "Study Table" },
                { key: "bedBackPanel", label: "Bed Back Panel" },
              ].map((item) => (
                <div key={item.key} className="flex items-center space-x-2">
                  <Switch
                    checked={
                      rooms.guest[
                        item.key as keyof typeof rooms.guest
                      ] as boolean
                    }
                    onCheckedChange={(checked) =>
                      updateRoom("guest", { [item.key]: checked })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black text-sm">{item.label}</Label>
                </div>
              ))}
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
                    <SelectItem value="7x10">7' × 10'</SelectItem>
                    <SelectItem value="10x13">10' × 13'</SelectItem>
                    <SelectItem value="12x18">12' × 18'</SelectItem>
                    <SelectItem value="15x20">15' × 20'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black font-medium">
                  TV Panel Area (sq ft)
                </Label>
                <Input
                  type="number"
                  value={rooms.living.tvPanelSqft || ""}
                  onChange={(e) =>
                    updateRoom("living", {
                      tvPanelSqft: Number(e.target.value),
                    })
                  }
                  className="bg-white border-gray-300"
                  placeholder="60"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={rooms.living.tvDrawerUnit}
                onCheckedChange={(checked) =>
                  updateRoom("living", { tvDrawerUnit: checked })
                }
                className="toggle-switch"
              />
              <Label className="text-black">TV Drawer Unit</Label>
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
                    <SelectItem value="9x9">9' × 9'</SelectItem>
                    <SelectItem value="3x3">3' × 3'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-black font-medium">
                  Number of Doors
                </Label>
                <Input
                  type="number"
                  value={rooms.pooja.doorsQty || ""}
                  onChange={(e) =>
                    updateRoom("pooja", { doorsQty: Number(e.target.value) })
                  }
                  className="bg-white border-gray-300"
                  placeholder="0"
                  min="0"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                checked={rooms.pooja.unit}
                onCheckedChange={(checked) =>
                  updateRoom("pooja", { unit: checked })
                }
                className="toggle-switch"
              />
              <Label className="text-black">Pooja Unit</Label>
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
                  onValueChange={(value: KitchenType) =>
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
                    <SelectItem value="8x10">8' × 10'</SelectItem>
                    <SelectItem value="10x12">10' × 12'</SelectItem>
                    <SelectItem value="12x14">12' × 14'</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Switch
                  checked={rooms.kitchen.baseUnit}
                  onCheckedChange={(checked) =>
                    updateRoom("kitchen", { baseUnit: checked })
                  }
                  className="toggle-switch"
                />
                <Label className="text-black">Base Unit</Label>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <Label className="text-black text-sm">Tandem Baskets</Label>
                  <Input
                    type="number"
                    value={rooms.kitchen.tandemBaskets || ""}
                    onChange={(e) =>
                      updateRoom("kitchen", {
                        tandemBaskets: Number(e.target.value),
                      })
                    }
                    className="bg-white border-gray-300"
                    placeholder="0"
                    min="0"
                  />
                </div>
                <div>
                  <Label className="text-black text-sm">Bottle Pullout</Label>
                  <Input
                    type="number"
                    value={rooms.kitchen.bottlePullout || ""}
                    onChange={(e) =>
                      updateRoom("kitchen", {
                        bottlePullout: Number(e.target.value),
                      })
                    }
                    className="bg-white border-gray-300"
                    placeholder="0"
                    min="0"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rooms.kitchen.cornerUnit}
                    onCheckedChange={(checked) =>
                      updateRoom("kitchen", { cornerUnit: checked })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black text-sm">Corner Unit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={rooms.kitchen.wickerBasket}
                    onCheckedChange={(checked) =>
                      updateRoom("kitchen", { wickerBasket: checked })
                    }
                    className="toggle-switch"
                  />
                  <Label className="text-black text-sm">Wicker Basket</Label>
                </div>
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
            Next: Add-Ons
          </Button>
        </div>
      </div>
    </div>
  );
}
