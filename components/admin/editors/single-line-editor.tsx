"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save } from "lucide-react";

interface SingleLineRates {
  Premium: {
    falseCeiling: number;
    ceilingPainting: number;
    electricalWiring: number;
  };
  Luxury: {
    falseCeiling: number;
    ceilingPainting: number;
    electricalWiring: number;
  };
}

export function SingleLineEditor() {
  const [rates, setRates] = useState<SingleLineRates>({
    Premium: {
      falseCeiling: 900,
      ceilingPainting: 200,
      electricalWiring: 250,
    },
    Luxury: {
      falseCeiling: 1250,
      ceilingPainting: 300,
      electricalWiring: 350,
    },
  });

  const [hasChanges, setHasChanges] = useState(false);

  const handleRateChange = (
    pkg: "Premium" | "Luxury",
    item: string,
    value: number
  ) => {
    setRates((prev) => ({
      ...prev,
      [pkg]: {
        ...prev[pkg],
        [item]: value,
      },
    }));
    setHasChanges(true);
  };

  const handleSave = () => {
    // TODO: Save to backend/file system
    console.log("[v0] Saving single line rates:", rates);
    setHasChanges(false);
  };

  const items = [
    { key: "falseCeiling", label: "False Ceiling", unit: "per sq ft" },
    { key: "ceilingPainting", label: "Ceiling Painting", unit: "per sq ft" },
    {
      key: "electricalWiring",
      label: "Electrical & Wiring",
      unit: "per sq ft",
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-black">
          Single Line Items - Rate per Sq Ft
        </CardTitle>
        <p className="text-gray-600">
          Edit pricing for single line items across both packages
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Premium Package */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">
              Premium Package
            </h3>
            {items.map((item) => (
              <div key={item.key} className="space-y-2">
                <Label className="text-black font-medium">
                  {item.label} ({item.unit})
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">₹</span>
                  <Input
                    type="number"
                    value={
                      rates.Premium[item.key as keyof typeof rates.Premium]
                    }
                    onChange={(e) =>
                      handleRateChange(
                        "Premium",
                        item.key,
                        Number(e.target.value)
                      )
                    }
                    className="bg-white border-gray-300"
                    min="0"
                    step="10"
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Luxury Package */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-black">Luxury Package</h3>
            {items.map((item) => (
              <div key={item.key} className="space-y-2">
                <Label className="text-black font-medium">
                  {item.label} ({item.unit})
                </Label>
                <div className="flex items-center space-x-2">
                  <span className="text-gray-500">₹</span>
                  <Input
                    type="number"
                    value={rates.Luxury[item.key as keyof typeof rates.Luxury]}
                    onChange={(e) =>
                      handleRateChange(
                        "Luxury",
                        item.key,
                        Number(e.target.value)
                      )
                    }
                    className="bg-white border-gray-300"
                    min="0"
                    step="10"
                  />
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
