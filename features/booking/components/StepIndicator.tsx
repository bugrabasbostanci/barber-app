"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { BookingStep, StepIndicatorProps } from '../types/booking.types';
import { BookingService } from '../services/bookingService';

export function StepIndicator({ currentStep, completedSteps }: StepIndicatorProps) {
  const steps = BookingService.getBookingSteps();

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId as BookingStep)) {
      return 'completed';
    }
    if (stepId === currentStep) {
      return 'current';
    }
    return 'pending';
  };

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => {
          const status = getStepStatus(step.id);
          const isCompleted = status === 'completed';
          const isCurrent = status === 'current';
          
          return (
            <div key={step.id} className="flex items-center">
              {/* Step circle */}
              <div className="flex items-center">
                <div
                  className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors",
                    isCompleted && "bg-green-600 border-green-600 text-white",
                    isCurrent && "bg-blue-600 border-blue-600 text-white",
                    !isCompleted && !isCurrent && "bg-white border-gray-300 text-gray-500"
                  )}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <span className="text-sm font-medium">{index + 1}</span>
                  )}
                </div>
                
                {/* Step label (hidden on mobile) */}
                <div className="ml-3 hidden sm:block">
                  <div
                    className={cn(
                      "text-sm font-medium",
                      isCurrent && "text-blue-600",
                      isCompleted && "text-green-600",
                      !isCompleted && !isCurrent && "text-gray-500"
                    )}
                  >
                    {step.label}
                  </div>
                  <div className="text-xs text-gray-500 max-w-24">
                    {step.description}
                  </div>
                </div>
              </div>

              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-2 sm:mx-4",
                    isCompleted && "bg-green-600",
                    !isCompleted && "bg-gray-300"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
      
      {/* Current step info for mobile */}
      <div className="sm:hidden mt-4 text-center">
        <div className="text-sm font-medium text-blue-600">
          {steps.find(s => s.id === currentStep)?.label}
        </div>
        <div className="text-xs text-gray-500">
          {steps.find(s => s.id === currentStep)?.description}
        </div>
      </div>
    </div>
  );
}