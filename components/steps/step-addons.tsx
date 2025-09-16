"use client";

import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ArrowLeft,
  Sofa,
  UtensilsCrossed,
  Palette,
  Lightbulb,
  Blinds,
} from "lucide-react";

const addOnItems = [
  {
    key: "sofa" as const,
    title: "Sofa",
    description: "Premium quality sofas with modern designs",
    icon: Sofa,
  },
  {
    key: "diningTable" as const,
    title: "Dining Table",
    description: "Elegant dining tables with matching chairs",
    icon: UtensilsCrossed,
  },
  {
    key: "carpets" as const,
    title: "Carpets",
    description: "High-quality carpets and rugs",
    icon: Palette,
  },
  {
    key: "designerLights" as const,
    title: "Designer Lights",
    description: "Modern lighting fixtures and chandeliers",
    icon: Lightbulb,
  },
  {
    key: "curtains" as const,
    title: "Curtains",
    description: "Custom curtains and window treatments",
    icon: Blinds,
  },
];

export function StepAddons() {
  const { addons, setAddons, setCurrentStep } = useEstimatorStore();

  const handleQuantityChange = (key: keyof typeof addons, quantity: number) => {
    setAddons({ [key]: Math.max(0, quantity) });
  };

  const handleNext = () => {
    // Calculate totals and move to summary
    setCurrentStep(5);
  };

  return (
    <div className="space-y-6">
      <CardHeader className="px-0">
        <CardTitle className="text-2xl text-black">Add-Ons</CardTitle>
        <CardDescription className="text-gray-600">
          Select additional items to complete your interior design
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-4">
        {addOnItems.map((item) => {
          const Icon = item.icon;
          return (
            <Card key={item.key} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <h3 className="font-medium text-black">{item.title}</h3>
                      <p className="text-sm text-gray-600">
                        {item.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Label className="text-sm text-gray-500">Quantity:</Label>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.key, addons[item.key] - 1)
                        }
                        disabled={addons[item.key] <= 0}
                        className="w-8 h-8 p-0 border-gray-300"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        value={addons[item.key] || ""}
                        onChange={(e) =>
                          handleQuantityChange(item.key, Number(e.target.value))
                        }
                        className="w-16 text-center bg-white border-gray-300"
                        min="0"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleQuantityChange(item.key, addons[item.key] + 1)
                        }
                        className="w-8 h-8 p-0 border-gray-300"
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}

        <div className="flex justify-between pt-6">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(3)}
            className="border-gray-300 text-black hover:bg-gray-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNext}
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-8"
          >
            Generate Estimate
          </Button>
        </div>
      </CardContent>
    </div>
  );
}
