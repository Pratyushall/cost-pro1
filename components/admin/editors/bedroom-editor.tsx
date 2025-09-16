"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save } from "lucide-react";

export function BedroomEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  const roomSizes = ["14x16", "10x12", "10x10", "11.5x11.5"];
  const packages = ["Premium", "Luxury"];

  const [wardrobeRates, setWardrobeRates] = useState({
    Premium: { "14x16": 2800, "10x12": 3000, "10x10": 2850, "11.5x11.5": 2500 },
    Luxury: { "14x16": 6000, "10x12": 5000, "10x10": 4800, "11.5x11.5": 4300 },
  });

  const [wardrobeAreas, setWardrobeAreas] = useState({
    Premium: { "14x16": 35, "10x12": 25, "10x10": 20, "11.5x11.5": 15 },
    Luxury: { "14x16": 60, "10x12": 40, "10x10": 30, "11.5x11.5": 35 },
  });

  const handleSave = () => {
    console.log("[v0] Saving bedroom rates...");
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Bedroom Items</CardTitle>
        <p className="text-gray-600">
          Edit pricing for bedroom furniture and fixtures
        </p>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="wardrobe" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-gray-100">
            <TabsTrigger value="wardrobe" className="text-black">
              Wardrobe
            </TabsTrigger>
            <TabsTrigger value="study" className="text-black">
              Study Table
            </TabsTrigger>
            <TabsTrigger value="tv" className="text-black">
              TV Unit
            </TabsTrigger>
            <TabsTrigger value="bed" className="text-black">
              Bed Panel
            </TabsTrigger>
          </TabsList>

          <TabsContent value="wardrobe" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Wardrobe Area (sq ft)
                </h3>
                {packages.map((pkg) => (
                  <div key={pkg} className="mb-6">
                    <h4 className="font-medium text-black mb-3">
                      {pkg} Package
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {roomSizes.map((size) => (
                        <div key={size} className="space-y-1">
                          <Label className="text-sm text-black">{size}</Label>
                          <Input
                            type="number"
                            value={
                              wardrobeAreas[pkg as keyof typeof wardrobeAreas][
                                size as keyof typeof wardrobeAreas.Premium
                              ]
                            }
                            onChange={(e) => {
                              setWardrobeAreas((prev) => ({
                                ...prev,
                                [pkg]: {
                                  ...prev[pkg as keyof typeof prev],
                                  [size]: Number(e.target.value),
                                },
                              }));
                              setHasChanges(true);
                            }}
                            className="bg-white border-gray-300 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-black mb-4">
                  Wardrobe Rate (₹ per sq ft)
                </h3>
                {packages.map((pkg) => (
                  <div key={pkg} className="mb-6">
                    <h4 className="font-medium text-black mb-3">
                      {pkg} Package
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      {roomSizes.map((size) => (
                        <div key={size} className="space-y-1">
                          <Label className="text-sm text-black">{size}</Label>
                          <Input
                            type="number"
                            value={
                              wardrobeRates[pkg as keyof typeof wardrobeRates][
                                size as keyof typeof wardrobeRates.Premium
                              ]
                            }
                            onChange={(e) => {
                              setWardrobeRates((prev) => ({
                                ...prev,
                                [pkg]: {
                                  ...prev[pkg as keyof typeof prev],
                                  [size]: Number(e.target.value),
                                },
                              }));
                              setHasChanges(true);
                            }}
                            className="bg-white border-gray-300 text-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="study">
            <div className="text-center py-8 text-gray-500">
              Study Table editor - Similar structure to wardrobe
            </div>
          </TabsContent>

          <TabsContent value="tv">
            <div className="text-center py-8 text-gray-500">
              TV Unit editor - Similar structure to wardrobe
            </div>
          </TabsContent>

          <TabsContent value="bed">
            <div className="text-center py-8 text-gray-500">
              Bed Back Panel editor - Similar structure to wardrobe
            </div>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
