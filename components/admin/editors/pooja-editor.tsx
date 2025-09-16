"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

export function PoojaEditor() {
  const [hasChanges, setHasChanges] = useState(false);

  const poojaRates = {
    unitRates: {
      Premium: { "9x9": 4000, "3x3": 4000 },
      Luxury: { "9x9": 5000, "3x3": 7500 },
    },
    doorRates: {
      Premium: { "9x9": 10000, "3x3": 13000 },
      Luxury: { "9x9": 13000, "3x3": 16000 },
    },
    areas: { "9x9": 6, "3x3": 2 },
  };

  const handleSave = () => {
    console.log("[v0] Saving pooja rates...");
    setHasChanges(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">Pooja Room Items</CardTitle>
        <p className="text-gray-600">
          Edit pricing for pooja room units and doors
        </p>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Unit Areas (sq ft)
            </h3>
            <div className="space-y-4">
              {Object.entries(poojaRates.areas).map(([size, area]) => (
                <div key={size} className="space-y-2">
                  <Label className="text-black font-medium">{size}</Label>
                  <Input
                    type="number"
                    value={area}
                    className="bg-white border-gray-300"
                    readOnly
                  />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Unit Rates (₹ per sq ft)
            </h3>
            <div className="space-y-6">
              {Object.entries(poojaRates.unitRates).map(([pkg, rates]) => (
                <div key={pkg} className="space-y-3">
                  <h4 className="font-medium text-black">{pkg} Package</h4>
                  {Object.entries(rates).map(([size, rate]) => (
                    <div key={size} className="space-y-1">
                      <Label className="text-sm text-black">{size}</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">₹</span>
                        <Input
                          type="number"
                          value={rate}
                          onChange={() => setHasChanges(true)}
                          className="bg-white border-gray-300 text-sm"
                          step="100"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-black mb-4">
              Door Rates (₹ per door)
            </h3>
            <div className="space-y-6">
              {Object.entries(poojaRates.doorRates).map(([pkg, rates]) => (
                <div key={pkg} className="space-y-3">
                  <h4 className="font-medium text-black">{pkg} Package</h4>
                  {Object.entries(rates).map(([size, rate]) => (
                    <div key={size} className="space-y-1">
                      <Label className="text-sm text-black">{size}</Label>
                      <div className="flex items-center space-x-1">
                        <span className="text-gray-500 text-sm">₹</span>
                        <Input
                          type="number"
                          value={rate}
                          onChange={() => setHasChanges(true)}
                          className="bg-white border-gray-300 text-sm"
                          step="500"
                        />
                      </div>
                    </div>
                  ))}
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
