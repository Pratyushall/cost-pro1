"use client";

import { StepBasics } from "@/components/steps/step-basics";
import { StepSingleLine } from "@/components/steps/step-single-line";
import { StepRooms } from "@/components/steps/step-rooms";
import { StepAddons } from "@/components/steps/step-addons";
import { StepSummary } from "@/components/steps/step-summary";
import { useEstimatorStore } from "@/store/estimator";
import { EstimatorWizard } from "@/components/estimator-wizard";

export default function Home() {
  return (
    <div className="estimator-container">
      <EstimatorWizard />
    </div>
  );
}

function EstimatorSteps() {
  const { currentStep } = useEstimatorStore();

  return (
    <>
      {currentStep === 1 && <StepBasics />}
      {currentStep === 2 && <StepSingleLine />}
      {currentStep === 3 && <StepRooms />}
      {currentStep === 4 && <StepAddons />}
      {currentStep === 5 && <StepSummary />}
    </>
  );
}
