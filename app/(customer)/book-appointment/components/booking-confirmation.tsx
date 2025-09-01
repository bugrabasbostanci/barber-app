import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, UserCheck, Phone } from "lucide-react";
import { formatTurkishDate } from "@/lib/utils";
import { type Staff } from "@/lib/stores/booking-store";

interface BookingData {
  staffId: string | null;
  date: string | null;
  timeSlot: string | null;
}

interface CustomerInfo {
  phone: string;
}

interface BookingConfirmationProps {
  bookingData: BookingData;
  customerInfo: CustomerInfo;
}

export function BookingConfirmation({ bookingData, customerInfo }: BookingConfirmationProps) {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);

  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setStaffMembers(result.data);
          }
        }
      } catch (error) {
        console.error("Failed to fetch staff:", error);
      }
    }

    fetchStaff();
  }, []);

  const getBarberName = () => {
    const staff = staffMembers.find((s) => s.id === bookingData.staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Loading barber information...";
  };

  const getEndTime = () => {
    if (!bookingData.timeSlot) return "";
    
    const [hours, minutes] = bookingData.timeSlot.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + 45, 0, 0);
    return endTime.toTimeString().slice(0, 5);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">Appointment Summary</h2>
        <p className="text-muted-foreground text-sm">
          Review and confirm your information
        </p>
      </div>

      <div className="space-y-4">
        {/* Barber Information */}
        <Card>
          <CardContent className="flex items-center p-4">
            <UserCheck className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Barber
              </div>
              <div className="font-semibold text-base">
                {getBarberName()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Date Information */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Date
              </div>
              <div className="font-semibold text-base">
                {bookingData.date ? formatTurkishDate(bookingData.date) : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Time Information */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Time
              </div>
              <div className="font-semibold text-base">
                {bookingData.timeSlot} - {getEndTime()} (45 min)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Phone className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Phone
              </div>
              <div className="font-semibold text-base">
                {customerInfo.phone}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Alert>
        <Calendar className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> If you want to cancel your appointment, you can cancel it 
          from your profile page at least 2 hours before the appointment time.
        </AlertDescription>
      </Alert>
    </div>
  );
}