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
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Sofa,
  UtensilsCrossed,
  Palette,
  Lightbulb,
  Blinds,
} from "lucide-react";
import { PackagePicker } from "@/components/package-picker";

const addOnItems = [
  {
    key: "sofa" as const,
    title: "Sofa",
    description: "",
    icon: Sofa,
  },
  {
    key: "diningTable" as const,
    title: "Dining Table",
    description: "",
    icon: UtensilsCrossed,
  },
  {
    key: "carpets" as const,
    title: "Carpets",
    description: "",
    icon: Palette,
  },
  {
    key: "designerLights" as const,
    title: "Designer Lights",
    description: "",
    icon: Lightbulb,
  },
  {
    key: "curtains" as const,
    title: "Curtains",
    description: "",
    icon: Blinds,
  },
];

export function StepAddons() {
  const { addons, basics, updateAddons, setCurrentStep } = useEstimatorStore();

  const handleToggle = (key: keyof typeof addons, enabled: boolean) => {
    updateAddons(key, { enabled, qty: enabled ? 1 : 0 });
  };

  const handleQuantityChange = (key: keyof typeof addons, quantity: number) => {
    const currentItem = addons[key];
    if (typeof currentItem === "object" && currentItem.enabled) {
      updateAddons(key, { ...currentItem, qty: Math.max(0, quantity) });
    }
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
          Select additional items to complete your design
        </CardDescription>
      </CardHeader>

      <CardContent className="px-0 space-y-4">
        {addOnItems.map((item) => {
          const Icon = item.icon;
          const currentItem = addons[item.key];
          const isEnabled =
            typeof currentItem === "object" ? currentItem.enabled : false;
          const quantity =
            typeof currentItem === "object" ? currentItem.qty || 0 : 0;

          return (
            <Card key={item.key} className="border border-gray-200">
              <CardContent className="p-4">
                <div className="space-y-4">
                  {/* Toggle first - prominent display */}
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

                    <div className="flex items-center space-x-3">
                      <Switch
                        checked={isEnabled}
                        onCheckedChange={(checked) =>
                          handleToggle(item.key, checked)
                        }
                      />
                    </div>
                  </div>

                  {/* Quantity and package picker only show when enabled */}
                  {isEnabled && (
                    <div className="pl-12 space-y-3 border-t pt-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Label className="text-sm text-gray-700">
                            Quantity:
                          </Label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.key, quantity - 1)
                              }
                              disabled={quantity <= 0}
                              className="w-8 h-8 p-0 border-gray-300"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={quantity || ""}
                              onChange={(e) =>
                                handleQuantityChange(
                                  item.key,
                                  Number(e.target.value)
                                )
                              }
                              className="w-15 text-center bg-white border-gray-300"
                              min="0"
                            />
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() =>
                                handleQuantityChange(item.key, quantity + 1)
                              }
                              className="w-8 h-8 p-0 border-gray-300"
                            >
                              +
                            </Button>
                          </div>
                        </div>

                        <PackagePicker
                          globalPkg={basics.pkg}
                          currentPackage={
                            typeof currentItem === "object"
                              ? currentItem.pkgOverride
                              : null
                          }
                          onPackageChange={(pkg) => {
                            if (typeof currentItem === "object") {
                              updateAddons(item.key, {
                                ...currentItem,
                                pkgOverride: pkg,
                              });
                            }
                          }}
                          itemName={item.title}
                        />
                      </div>
                    </div>
                  )}
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
