"use client";

import { useEstimatorStore } from "@/store/estimator";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

const steps = [
  { number: 1, label: "1" },
  { number: 2, label: "2" },
  { number: 3, label: "3" },
  { number: 4, label: "4" },
];

export function StepNavigationMobile() {
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
    <div className="mx-auto max-w-md px-4 pt-3 pb-16 md:hidden">
      {/* Step indicators */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <button
              onClick={() => setCurrentStep(step.number)}
              className={`flex items-center justify-center w-8 h-8 rounded-full border-2 text-xs font-semibold transition-colors ${
                currentStep === step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step.number
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/30 text-muted-foreground bg-background"
              }`}
            >
              {step.number}
            </button>
            <span
              className={`ml-2 text-xs font-medium ${
                currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 ${
                  currentStep > step.number
                    ? "bg-primary"
                    : "bg-muted-foreground/20"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Sticky bottom navigation */}
      <div className="fixed inset-x-0 bottom-0 z-30 bg-background/95 backdrop-blur border-t border-border px-4 py-3 md:hidden">
        <div className="flex items-center justify-between gap-3">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="flex-1 h-10 gap-2 bg-transparent text-xs font-medium disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>

          <Button
            onClick={handleNext}
            disabled={currentStep === steps.length}
            className="flex-1 h-10 gap-2 text-xs font-semibold"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
