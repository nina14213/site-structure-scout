/**
 * @file WizardProgress.tsx
 * @description Progress bar for the 3-step Schema Mapper wizard.
 */

import React from "react";
import { Check } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface WizardProgressProps {
  currentStep: number;
  steps: { label: string; icon: React.ReactNode }[];
}

export default function WizardProgress({ currentStep, steps }: WizardProgressProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center justify-center gap-1 md:gap-2 mb-4 md:mb-6">
      {steps.map((step, i) => {
        const isDone = i < currentStep;
        const isActive = i === currentStep;
        return (
          <React.Fragment key={i}>
            {i > 0 && (
              <div
                className={`h-0.5 w-6 md:w-16 transition-colors ${
                  isDone ? "bg-primary" : "bg-border"
                }`}
              />
            )}
            <div className="flex items-center gap-1.5">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isActive
                    ? "bg-primary/20 text-primary border-2 border-primary"
                    : "bg-muted text-muted-foreground border border-border"
                }`}
              >
                {isDone ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={`hidden md:inline text-sm font-medium ${
                  isActive ? "text-foreground" : "text-muted-foreground"
                }`}
              >
                {step.label}
              </span>
            </div>
          </React.Fragment>
        );
      })}
    </div>
  );
}
