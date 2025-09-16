"use client";

import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";
import { analytics } from "@/lib/analytics";

const singleLineItems = [
  {
    key: "falseCeiling" as const,
    title: "False Ceiling",
    description: "Suspended ceiling with modern lighting integration",
  },
  {
    key: "ceilingPainting" as const,
    title: "Ceiling Painting",
    description: "Professional ceiling painting with premium paints",
  },
  {
    key: "electricalWiring" as const,
    title: "Electrical & Wiring",
    description: "Complete electrical work and wiring upgrades",
  },
];

export function StepSingleLine() {
  const { single, setSingleLine, setCurrentStep, basics } = useEstimatorStore();

  const handleToggle = (key: keyof typeof single, enabled: boolean) => {
    setSingleLine({
      [key]: {
        enabled,
        areaSqft: enabled
          ? single[key].areaSqft || basics.carpetAreaSqft
          : undefined,
      },
    });
  };

  const handleAreaChange = (key: keyof typeof single, areaSqft: number) => {
    setSingleLine({
      [key]: {
        ...single[key],
        areaSqft,
      },
    });
  };

  const handleNext = () => {
    analytics.stepCompleted(2, "Single Line Items");
    setCurrentStep(3);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">Single Line Items</CardTitle>
        <CardDescription className="text-gray-600">
          Select the single line items you want to include in your project
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-6">
        <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          Areas are prefilled from your carpet area ({basics.carpetAreaSqft} sq
          ft). Adjust if needed for specific areas.
        </div>

        <div className="space-y-4">
          {singleLineItems.map((item) => (
            <Card key={item.key} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Switch
                        checked={single[item.key].enabled}
                        onCheckedChange={(enabled) =>
                          handleToggle(item.key, enabled)
                        }
                        className="toggle-switch"
                      />
                      <Label className="text-black font-medium cursor-pointer">
                        {item.title}
                      </Label>
                    </div>
                    <p className="text-sm text-gray-600 ml-8">
                      {item.description}
                    </p>
                  </div>

                  {single[item.key].enabled && (
                    <div className="ml-4 w-32">
                      <Label className="text-xs text-gray-500">
                        Area (sq ft)
                      </Label>
                      <Input
                        type="number"
                        value={single[item.key].areaSqft || ""}
                        onChange={(e) =>
                          handleAreaChange(item.key, Number(e.target.value))
                        }
                        className="bg-white border-gray-300 text-black text-sm"
                        placeholder="Area"
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(1)}
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Next: Rooms
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
