import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TimeSlotsSkeleton } from "@/components/skeletons/booking-skeleton";
import { Clock, AlertCircle } from "lucide-react";

interface TimeSelectionProps {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  selectedDate: string;
  selectedStaff: string;
}

export function TimeSelection({ 
  selectedTime, 
  onTimeSelect, 
  selectedDate, 
  selectedStaff 
}: TimeSelectionProps) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!selectedDate || !selectedStaff) {
      setAvailableSlots([]);
      setLoading(false);
      return;
    }

    async function fetchTimeSlots() {
      setLoading(true);
      setError(null);

      console.log('Fetching time slots for:', { selectedDate, selectedStaff });

      try {
        const url = `/api/time-slots?date=${selectedDate}&staffId=${selectedStaff}`;
        console.log('API URL:', url);
        const response = await fetch(url);

        if (response.ok) {
          const result = await response.json();
          console.log('Time slots API response:', result);
          if (result.success && Array.isArray(result.data)) {
            setAvailableSlots(result.data);
          } else {
            console.error('Time slots API error:', result);
            setError(result.message || "Could not fetch time information");
          }
        } else {
          console.error('Time slots HTTP error:', response.status, response.statusText);
          const errorText = await response.text();
          console.error('Error response body:', errorText);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      } catch (error) {
        console.error("Failed to fetch time slots:", error);
        setError("Error occurred while loading available times");
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSlots();
  }, [selectedDate, selectedStaff]);

  if (!selectedDate || !selectedStaff || selectedDate === "" || selectedStaff === "") {
    return (
      <div className="text-center py-8">
        <Clock className="w-16 h-16 mx-auto text-muted-foreground/50 mb-4" />
        <p className="text-muted-foreground">
          Please select date and barber first
        </p>
      </div>
    );
  }

  if (loading) {
    return <TimeSlotsSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No available times for the selected date and barber.
          Please select a different date.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Select Time</h2>
        <p className="text-muted-foreground text-sm">
          Choose from available time slots
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {availableSlots.map((timeSlot) => {
          const isSelected = selectedTime === timeSlot;
          
          return (
            <Button
              key={timeSlot}
              variant={isSelected ? "default" : "outline"}
              className={`h-14 text-base font-medium transition-all ${
                isSelected 
                  ? "shadow-md" 
                  : "hover:border-primary hover:shadow-sm"
              }`}
              onClick={() => onTimeSelect(timeSlot)}
            >
              <Clock className="w-4 h-4 mr-2" />
              {timeSlot}
            </Button>
          );
        })}
      </div>
    </div>
  );
}