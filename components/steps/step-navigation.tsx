"use client";

import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Check } from "lucide-react";

const steps = [
  { number: 1, label: "Basics" },
  { number: 2, label: "Rooms" },
  { number: 3, label: "Add-ons" },
  { number: 4, label: "Summary" },
];

export function StepNavigation() {
  const { currentStep, setCurrentStep } = useEstimatorStore();

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Current step label */}
      <p className="text-center text-sm font-medium text-foreground">
        Step {currentStep}: {steps[currentStep - 1]?.label}
      </p>

      <div className="hidden sm:flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <button
              onClick={() => setCurrentStep(step.number)}
              className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors text-base ${
                currentStep === step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step.number
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {currentStep > step.number ? (
                <Check className="w-5 h-5" />
              ) : (
                step.number
              )}
            </button>
            <span
              className={`ml-2 text-sm font-medium ${
                currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-4 ${
                  currentStep > step.number
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="hidden sm:flex items-center justify-between gap-3 pt-2 sm:pt-4">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-1.5 bg-transparent h-10 px-4 text-sm"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="gap-1.5 h-10 px-4 text-sm"
        >
          <span>Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
