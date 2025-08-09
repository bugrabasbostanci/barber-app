import { Button } from "@/components/ui/button";
import { ChevronLeft, Check } from "lucide-react";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  canProceed: boolean;
  isBooking: boolean;
  onPrevious: () => void;
  onNext: () => void;
  onSubmit: () => void;
}

export function BookingNavigation({
  currentStep,
  totalSteps,
  canProceed,
  isBooking,
  onPrevious,
  onNext,
  onSubmit
}: BookingNavigationProps) {
  const isFirstStep = currentStep === 1;
  const isFinalStep = currentStep === totalSteps;
  
  const handleNextClick = () => {
    if (isFinalStep) {
      onSubmit();
    } else {
      onNext();
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t p-4">
      <div className="flex space-x-3">
        {!isFirstStep && (
          <Button
            variant="outline"
            size="lg"
            onClick={onPrevious}
            className="flex-1"
            disabled={isBooking}
          >
            <ChevronLeft className="w-4 h-4 mr-2" />
            Geri
          </Button>
        )}
        
        <Button
          size="lg"
          onClick={handleNextClick}
          disabled={!canProceed || isBooking}
          className={`${isFirstStep ? "w-full" : "flex-1"} ${
            isFinalStep ? "bg-green-600 hover:bg-green-700" : ""
          }`}
        >
          {isBooking ? (
            <div className="flex items-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Randevu Alınıyor...
            </div>
          ) : isFinalStep ? (
            <div className="flex items-center">
              <Check className="w-4 h-4 mr-2" />
              Randevuyu Onayla
            </div>
          ) : (
            "İleri"
          )}
        </Button>
      </div>
    </div>
  );
}