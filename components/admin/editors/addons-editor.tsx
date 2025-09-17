"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export function AddonsEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  const [addonRates, setAddonRates] = useState({
    sofa: {
      "2bhk": { Premium: 75000, Luxury: 90000 },
      "3bhk": { Premium: 95000, Luxury: 125000 },
      "4bhk": { Premium: 140000, Luxury: 180000 },
    },
    diningTable: {
      "2bhk": { Premium: 60000, Luxury: 80000 },
      "3bhk": { Premium: 95000, Luxury: 125000 },
      "4bhk": { Premium: 120000, Luxury: 160000 },
    },
    carpets: {
      "2bhk": { Premium: 8000, Luxury: 12000 },
      "3bhk": { Premium: 10000, Luxury: 15000 },
      "4bhk": { Premium: 12000, Luxury: 18000 },
    },
    designerLights: {
      "2bhk": { Premium: 6000, Luxury: 12000 },
      "3bhk": { Premium: 8000, Luxury: 15000 },
      "4bhk": { Premium: 10000, Luxury: 18000 },
    },
    curtains: {
      "2bhk": { Premium: 8000, Luxury: 12000 },
      "3bhk": { Premium: 10000, Luxury: 15000 },
      "4bhk": { Premium: 12000, Luxury: 18000 },
    },
  });

  const handleSave = () => {
    console.log("[v0] Saving addon rates...");
    setHasChanges(false);
  };

  const bhkTypes = ["2bhk", "3bhk", "4bhk"];
  const packages = ["Premium", "Luxury"];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Add-On Items</CardTitle>
        <p className="text-gray-600">
          Edit pricing for add-on items by BHK and package
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        {Object.entries(addonRates).map(([addon, rates]) => (
          <div key={addon} className="space-y-4">
            <h3 className="text-lg font-semibold text-black capitalize">
              {addon.replace(/([A-Z])/g, " $1").trim()}
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {bhkTypes.map((bhk) => (
                <div key={bhk} className="space-y-3">
                  <h4 className="font-medium text-black">
                    {bhk.toUpperCase()}
                  </h4>
                  <div className="space-y-2">
                    {packages.map((pkg) => (
                      <div key={pkg} className="space-y-1">
                        <Label className="text-sm text-black">{pkg}</Label>
                        <div className="flex items-center space-x-1">
                          <span className="text-gray-500 text-sm">₹</span>
                          <Input
                            type="number"
                            value={
                              rates[bhk as keyof typeof rates][
                                pkg as keyof (typeof rates)["2bhk"]
                              ]
                            }
                            onChange={(e) => {
                              setAddonRates((prev) => ({
                                ...prev,
                                [addon]: {
                                  ...prev[addon as keyof typeof prev],
                                  [bhk]: {
                                    ...prev[addon as keyof typeof prev][
                                      bhk as keyof (typeof prev)[keyof typeof prev]
                                    ],
                                    [pkg]: Number(e.target.value),
                                  },
                                },
                              }));
                              setHasChanges(true);
                            }}
                            className="bg-white border-gray-300 text-sm"
                            step="1000"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

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
