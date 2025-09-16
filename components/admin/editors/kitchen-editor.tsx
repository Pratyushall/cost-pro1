"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export function KitchenEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  const [baseRates, setBaseRates] = useState({
    Premium: 2050,
    Luxury: 2850,
  });

  const [accessories, setAccessories] = useState({
    tandemBasket: { Premium: 5000, Luxury: 6000 },
    bottlePullout: { Premium: 7500, Luxury: 12000 },
    cornerUnit: { Premium: 20500, Luxury: 27500 },
    wickerBasket: { Premium: 6500, Luxury: 8500 },
  });

  const handleSave = () => {
    console.log("[v0] Saving kitchen rates...");
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Kitchen Items</CardTitle>
        <p className="text-gray-600">
          Edit pricing for kitchen base units and accessories
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Base Unit (₹ per sq ft)
            </h3>
            <div className="space-y-4">
              {Object.entries(baseRates).map(([pkg, rate]) => (
                <div key={pkg} className="space-y-2">
                  <Label className="text-black font-medium">
                    {pkg} Package
                  </Label>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-500">₹</span>
                    <Input
                      type="number"
                      value={rate}
                      onChange={(e) => {
                        setBaseRates((prev) => ({
                          ...prev,
                          [pkg]: Number(e.target.value),
                        }));
                        setHasChanges(true);
                      }}
                      className="bg-white border-gray-300"
                      step="50"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Accessories (Fixed Price)
            </h3>
            <div className="space-y-6">
              {Object.entries(accessories).map(([accessory, rates]) => (
                <div key={accessory} className="space-y-3">
                  <h4 className="font-medium text-black capitalize">
                    {accessory.replace(/([A-Z])/g, " $1").trim()}
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(rates).map(([pkg, rate]) => (
                      <div key={pkg} className="space-y-1">
                        <Label className="text-sm text-black">{pkg}</Label>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 text-sm">₹</span>
                          <Input
                            type="number"
                            value={rate}
                            onChange={(e) => {
                              setAccessories((prev) => ({
                                ...prev,
                                [accessory]: {
                                  ...prev[accessory as keyof typeof prev],
                                  [pkg]: Number(e.target.value),
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
