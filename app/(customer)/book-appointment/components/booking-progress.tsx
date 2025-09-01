interface BookingProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function BookingProgress({ currentStep, totalSteps }: BookingProgressProps) {
  return (
    <div className="px-4 py-3 bg-background border-b">
      <div className="text-center text-xs text-muted-foreground mb-2">
Step {currentStep} / {totalSteps}
      </div>
      <div className="flex space-x-2">
        {Array.from({ length: totalSteps }, (_, index) => (
          <div
            key={index}
            className={`flex-1 h-2 rounded-full transition-colors ${
              index < currentStep
                ? "bg-primary"
                : index === currentStep - 1
                ? "bg-primary/70"
                : "bg-muted"
            }`}
          />
        ))}
      </div>
    </div>
  );
}