"use client";

import { StepBasics } from "@/components/steps/step-basics";
import { StepSingleLine } from "@/components/steps/step-single-line";
import { StepRooms } from "@/components/steps/step-rooms";
import { StepAddons } from "@/components/steps/step-addons";
import { StepSummary } from "@/components/steps/step-summary";
import { Badge } from "@/components/ui/badge";
import { useEstimatorStore } from "@/store/estimator";

const STEPS = [
  { id: 1, name: "Basics", component: StepBasics },
  { id: 2, name: "Scope", component: StepSingleLine },
  { id: 3, name: "Rooms", component: StepRooms },
  { id: 4, name: "Add-ons", component: StepAddons },
  { id: 5, name: "Summary", component: StepSummary },
] as const;

export function EstimatorWizard() {
  const { currentStep, setCurrentStep } = useEstimatorStore();

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <div className="space-y-8 px-3 sm:px-6 py-6 min-h-screen">
      {/* Progress indicator – desktop only */}
      <div className="hidden md:flex items-center justify-center gap-3">
        {STEPS.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <Badge
              variant={
                currentStep === step.id
                  ? "default"
                  : currentStep > step.id
                  ? "secondary"
                  : "outline"
              }
              className={`cursor-pointer transition-all text-base px-5 py-2.5 font-semibold ${
                currentStep === step.id
                  ? "bg-primary text-primary-foreground shadow-xl scale-110 backdrop-blur-sm"
                  : currentStep > step.id
                  ? "bg-secondary text-secondary-foreground shadow-lg backdrop-blur-sm"
                  : "bg-white/30 backdrop-blur-md text-foreground border-white/40 shadow-md"
              }`}
              onClick={() => setCurrentStep(step.id)}
            >
              {step.name}
            </Badge>
            {index < STEPS.length - 1 && (
              <div className="w-12 h-0.5 bg-white/40 backdrop-blur-sm mx-2 shadow-sm" />
            )}
          </div>
        ))}
      </div>

      {/* Current step – full width on mobile, centered on larger screens */}
      <div className="mx-auto w-full max-w-4xl">
        <CurrentStepComponent />
      </div>
    </div>
  );
}
