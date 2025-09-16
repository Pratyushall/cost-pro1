"use client";

import { useEstimatorStore } from "@/store/estimator";
import { StepIndicator } from "./step-indicator";
import { StepBasics } from "./steps/step-basics";
import { StepSingleLine } from "./steps/step-single-line";
import { StepRooms } from "./steps/step-rooms";
import { StepAddons } from "./steps/step-addons";
import { StepSummary } from "./steps/step-summary";
import { Card } from "./ui/card";

const steps = [
  { id: 1, title: "Basics", component: StepBasics },
  { id: 2, title: "Single Line Items", component: StepSingleLine },
  { id: 3, title: "Rooms & Items", component: StepRooms },
  { id: 4, title: "Add-Ons", component: StepAddons },
  { id: 5, title: "Summary", component: StepSummary },
];

export function EstimatorWizard() {
  const { currentStep } = useEstimatorStore();
  const CurrentStepComponent =
    steps.find((step) => step.id === currentStep)?.component || StepBasics;

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">
            Interior Cost Estimator
          </h1>
          <p className="text-gray-600 text-lg">
            Get an approximate cost estimate for your interior design project
          </p>
        </div>

        {/* Step Indicator */}
        <StepIndicator steps={steps} currentStep={currentStep} />

        {/* Main Content */}
        <Card className="elegant-card p-8 mt-8">
          <CurrentStepComponent />
        </Card>
      </div>
    </div>
  );
}
