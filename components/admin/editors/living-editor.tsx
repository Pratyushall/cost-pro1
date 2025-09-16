"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export function LivingEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  const livingSizes = ["7x10", "10x13", "12x18", "15x20"];
  const packages = ["Premium", "Luxury"];

  const [tvDrawerRates, setTvDrawerRates] = useState({
    Premium: { "7x10": 18500, "10x13": 21500, "12x18": 24500, "15x20": 29500 },
    Luxury: { "7x10": 21500, "10x13": 24500, "12x18": 29500, "15x20": 32500 },
  });

  const [tvPanelRates, setTvPanelRates] = useState({
    Premium: { "7x10": 750, "10x13": 850, "12x18": 950, "15x20": 1250 },
    Luxury: { "7x10": 1150, "10x13": 1350, "12x18": 1750, "15x20": 2500 },
  });

  const handleSave = () => {
    console.log("[v0] Saving living room rates...");
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Living Room Items</CardTitle>
        <p className="text-gray-600">
          Edit pricing for living room furniture and fixtures
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              TV Drawer Unit (Fixed Price)
            </h3>
            {packages.map((pkg) => (
              <div key={pkg} className="mb-6">
                <h4 className="font-medium text-black mb-3">{pkg} Package</h4>
                <div className="grid grid-cols-2 gap-3">
                  {livingSizes.map((size) => (
                    <div key={size} className="space-y-1">
                      <Label className="text-sm text-black">{size}</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">₹</span>
                        <Input
                          type="number"
                          value={
                            tvDrawerRates[pkg as keyof typeof tvDrawerRates][
                              size as keyof typeof tvDrawerRates.Premium
                            ]
                          }
                          onChange={(e) => {
                            setTvDrawerRates((prev) => ({
                              ...prev,
                              [pkg]: {
                                ...prev[pkg as keyof typeof prev],
                                [size]: Number(e.target.value),
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className="bg-white border-gray-300 text-sm"
                          step="500"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              TV Panel (₹ per sq ft)
            </h3>
            {packages.map((pkg) => (
              <div key={pkg} className="mb-6">
                <h4 className="font-medium text-black mb-3">{pkg} Package</h4>
                <div className="grid grid-cols-2 gap-3">
                  {livingSizes.map((size) => (
                    <div key={size} className="space-y-1">
                      <Label className="text-sm text-black">{size}</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">₹</span>
                        <Input
                          type="number"
                          value={
                            tvPanelRates[pkg as keyof typeof tvPanelRates][
                              size as keyof typeof tvPanelRates.Premium
                            ]
                          }
                          onChange={(e) => {
                            setTvPanelRates((prev) => ({
                              ...prev,
                              [pkg]: {
                                ...prev[pkg as keyof typeof prev],
                                [size]: Number(e.target.value),
                              },
                            }));
                            setHasChanges(true);
                          }}
                          className="bg-white border-gray-300 text-sm"
                          step="50"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

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
