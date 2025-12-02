"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  title: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div className="hidden sm:flex items-center justify-between">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={cn(
                "step-indicator",
                currentStep === step.id && "active",
                currentStep > step.id && "completed",
                currentStep < step.id && "inactive"
              )}
            >
              {currentStep > step.id ? (
                <Check className="w-4 h-4" />
              ) : (
                <span>{step.id}</span>
              )}
            </div>
            <span className="text-sm font-medium text-black mt-2 text-center max-w-20">
              {step.title}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div className="w-16 h-0.5 bg-gray-300 mx-4 mt-[-20px]" />
          )}
        </div>
      ))}
    </div>
  );
}
