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
    <div className="space-y-4 sm:space-y-6 px-4 sm:px-0">
      {/* Step indicators */}
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center flex-1">
            <button
              onClick={() => setCurrentStep(step.number)}
              className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 transition-colors text-sm sm:text-base ${
                currentStep === step.number
                  ? "border-primary bg-primary text-primary-foreground"
                  : currentStep > step.number
                  ? "border-primary bg-primary/10 text-primary"
                  : "border-muted-foreground/30 text-muted-foreground"
              }`}
            >
              {step.number}
            </button>
            <span
              className={`ml-2 text-xs sm:text-sm font-medium hidden sm:inline ${
                currentStep === step.number
                  ? "text-foreground"
                  : "text-muted-foreground"
              }`}
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-2 sm:mx-4 ${
                  currentStep > step.number
                    ? "bg-primary"
                    : "bg-muted-foreground/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between pt-4 gap-3 sm:gap-0">
        <Button
          variant="outline"
          onClick={handlePrevious}
          disabled={currentStep === 1}
          className="gap-2 bg-transparent w-full sm:w-auto h-12 sm:h-10"
        >
          <ChevronLeft className="w-4 h-4" />
          Previous
        </Button>

        <Button
          onClick={handleNext}
          disabled={currentStep === steps.length}
          className="gap-2 w-full sm:w-auto h-12 sm:h-10"
        >
          Next
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
