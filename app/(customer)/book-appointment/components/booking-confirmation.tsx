import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Calendar, Clock, UserCheck, Phone } from "lucide-react";
import { formatTurkishDate } from "@/lib/date-time";
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
    return staff ? `${staff.firstName} ${staff.lastName}` : "Berber bilgisi yükleniyor...";
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
        <h2 className="text-xl font-semibold mb-2">Randevu Özeti</h2>
        <p className="text-muted-foreground text-sm">
          Bilgileri kontrol edin ve onaylayın
        </p>
      </div>

      <div className="space-y-4">
        {/* Berber Bilgisi */}
        <Card>
          <CardContent className="flex items-center p-4">
            <UserCheck className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Berber
              </div>
              <div className="font-semibold text-base">
                {getBarberName()}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tarih Bilgisi */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Calendar className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Tarih
              </div>
              <div className="font-semibold text-base">
                {bookingData.date ? formatTurkishDate(bookingData.date) : ""}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Saat Bilgisi */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Clock className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Saat
              </div>
              <div className="font-semibold text-base">
                {bookingData.timeSlot} - {getEndTime()} (45 dk)
              </div>
            </div>
          </CardContent>
        </Card>

        {/* İletişim Bilgisi */}
        <Card>
          <CardContent className="flex items-center p-4">
            <Phone className="w-8 h-8 text-primary mr-4" />
            <div>
              <div className="font-medium text-sm text-muted-foreground mb-1">
                Telefon
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
          <strong>Önemli:</strong> Randevunuzu iptal etmek istiyorsanız, randevu saatinden 
          en az 2 saat önce profile sayfanızdan iptal edebilirsiniz.
        </AlertDescription>
      </Alert>
    </div>
  );
}