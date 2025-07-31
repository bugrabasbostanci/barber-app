"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BUSINESS_RULES } from "@/lib/constants";
import { formatTurkishDate, dateToLocalString } from "@/lib/date-time";
import { useRequireCustomer } from "@/hooks/useRequireAuth";

interface BookingData {
  date: string;
  staffId: string;
  timeSlot: string;
}

interface UserProfile {
  phone: string | null;
}

export default function BookAppointmentPage() {
  const { loading, isAuthorized } = useRequireCustomer();
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: "",
    staffId: "",
    timeSlot: "",
  });
  const [isBooking, setIsBooking] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile>({ phone: null });
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notes, setNotes] = useState("");

  // Fetch user profile to check phone number
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const profile = await response.json();
          setUserProfile(profile);
          setPhoneNumber(profile.phone || "");
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }

    if (isAuthorized) {
      fetchUserProfile();
    }
  }, [isAuthorized]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">
              Yetkilendirme kontrol ediliyor...
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show error if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <div className="max-w-4xl mx-auto py-6 px-4">
          <Alert variant="destructive" className="mt-4">
            <AlertDescription>
              Bu sayfaya erişim yetkiniz bulunmuyor. Randevu alabilmek için
              müşteri hesabı ile giriş yapmanız gerekiyor.
            </AlertDescription>
          </Alert>
          <div className="mt-4 text-center">
            <Button asChild>
              <Link href="/auth/login">Giriş Yap</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleBookingConfirmation = async () => {
    setIsBooking(true);

    try {
      // If phone number is provided and different from profile, update profile first
      if (phoneNumber && phoneNumber !== userProfile.phone) {
        const profileResponse = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: phoneNumber }),
        });

        if (!profileResponse.ok) {
          alert("Telefon numarası güncellenemedi.");
          setIsBooking(false);
          return;
        }
      }

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: bookingData.date,
          staffId: bookingData.staffId,
          startTime: bookingData.timeSlot,
          notes: notes.trim() || null,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Redirect to success page
        window.location.href = "/my-appointments?success=true";
      } else {
        alert(result.error || "Randevu oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Randevu oluşturulurken hata oluştu:", error);
      alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold">Randevu Al</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-4 py-4 border-b">
        <div className="max-w-sm mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? "bg-foreground" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-muted-foreground">
            <span>Tarih</span>
            <span>Kişi</span>
            <span>Saat</span>
            <span>Onay</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 py-6">
        <div className="max-w-sm mx-auto">
          <div className="space-y-6">
            {/* Step Title */}
            <div className="text-center space-y-2">
              <h2 className="text-xl font-semibold">
                {currentStep === 1 && "Tarih Seçin"}
                {currentStep === 2 && "Personel Seçin"}
                {currentStep === 3 && "Saat Seçin"}
                {currentStep === 4 && "Randevunuzu Onaylayın"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {currentStep === 1 && "Randevu almak istediğiniz tarihi seçin"}
                {currentStep === 2 && "Sizinle ilgilenecek personeli seçin"}
                {currentStep === 3 && "Uygun saat dilimini seçin"}
                {currentStep === 4 && "Randevu bilgilerinizi kontrol edin"}
              </p>
            </div>

            {/* Step Content */}
            <div className="space-y-4">
              {/* Step 1: Date Selection */}
              {currentStep === 1 && (
                <DateSelection
                  selectedDate={bookingData.date}
                  onDateSelect={(date) => updateBookingData("date", date)}
                />
              )}

              {/* Step 2: Staff Selection */}
              {currentStep === 2 && (
                <StaffSelection
                  selectedStaff={bookingData.staffId}
                  onStaffSelect={(staffId) =>
                    updateBookingData("staffId", staffId)
                  }
                />
              )}

              {/* Step 3: Time Selection */}
              {currentStep === 3 && (
                <TimeSelection
                  selectedTime={bookingData.timeSlot}
                  onTimeSelect={(time) => updateBookingData("timeSlot", time)}
                  date={bookingData.date}
                  staffId={bookingData.staffId}
                />
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <BookingConfirmation 
                  bookingData={bookingData}
                  phoneNumber={phoneNumber}
                  onPhoneChange={setPhoneNumber}
                  hasExistingPhone={!!userProfile.phone}
                  notes={notes}
                  onNotesChange={setNotes}
                />
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-6">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1 h-12"
                  >
                    Geri
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="flex-1 h-12"
                    disabled={
                      (currentStep === 1 && !bookingData.date) ||
                      (currentStep === 2 && !bookingData.staffId) ||
                      (currentStep === 3 && !bookingData.timeSlot)
                    }
                  >
                    İleri
                  </Button>
                ) : (
                  <Button
                    className="flex-1 h-12"
                    onClick={handleBookingConfirmation}
                    disabled={isBooking || !phoneNumber.trim()}
                  >
                    {isBooking ? "Oluşturuluyor..." : "Onayla"}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// Date selection component with monthly calendar
function DateSelection({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}) {
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<
    Date | undefined
  >(selectedDate ? new Date(selectedDate + "T00:00:00") : undefined);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  const today = useMemo(() => new Date(), []);
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + BUSINESS_RULES.BOOKING_WINDOW_DAYS - 1);
    return date;
  }, []);

  // Fetch blocked dates
  useEffect(() => {
    async function fetchBlockedDates() {
      try {
        const startDate = dateToLocalString(today);
        const endDate = dateToLocalString(maxDate);
        const response = await fetch(`/api/blocked-dates?startDate=${startDate}&endDate=${endDate}`);
        if (response.ok) {
          const blocks = await response.json();
          // Extract dates that are fully blocked
          const fullyBlockedDates = blocks
            .filter((block: { isFullDay: boolean }) => block.isFullDay)
            .map((block: { date: string }) => block.date);
          setBlockedDates(fullyBlockedDates);
        }
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
      }
    }

    fetchBlockedDates();
  }, [maxDate, today]);

  // Business rules: Disable Sundays, dates outside booking window, and blocked dates
  const isDateDisabled = (date: Date) => {
    // Pazarları kapat (JavaScript: 0=Sunday)
    if (date.getDay() === 0) return true;

    // Bugünden önceki tarihler (günün başlangıcından itibaren)
    const todayStart = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate()
    );
    if (date < todayStart) return true;

    // Maximum booking window'dan sonraki tarihler
    if (date > maxDate) return true;

    // Blocked dates (berber tarafından kapatılan günler)
    const dateStr = dateToLocalString(date);
    if (blockedDates.includes(dateStr)) return true;

    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isDateDisabled(date)) {
      setSelectedCalendarDate(date);
      // Native JavaScript ile timezone-safe dönüşüm
      onDateSelect(dateToLocalString(date)); // YYYY-MM-DD format (local timezone korunur)
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    return formatTurkishDate(dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm text-muted-foreground">
          {BUSINESS_RULES.WORKING_HOURS.start} -{" "}
          {BUSINESS_RULES.WORKING_HOURS.end}
        </p>
        <p className="text-xs text-muted-foreground">Pazartesi - Cumartesi</p>
      </div>

      {/* Mobile Calendar */}
      <div className="border rounded-lg bg-card p-4">
        <Calendar
          mode="single"
          selected={selectedCalendarDate}
          onSelect={handleDateSelect}
          disabled={isDateDisabled}
          className="w-full"
          weekStartsOn={1}
          formatters={{
            formatWeekdayName: (date: Date) => {
              const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
              return days[date.getDay()];
            },
            formatMonthCaption: (date: Date) => {
              const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
              return `${months[date.getMonth()]} ${date.getFullYear()}`;
            }
          }}
          classNames={{
            month: "w-full",
            table: "w-full",
            head_cell: "text-center font-medium text-muted-foreground text-sm",
            cell: "text-center p-1",
            day: "h-10 w-10 text-sm rounded-md",
            day_today: "bg-muted font-semibold",
            day_selected: "bg-foreground text-background hover:bg-foreground",
            day_disabled: "text-muted-foreground cursor-not-allowed opacity-50",
          }}
          modifiers={{
            blocked: (date) => {
              const dateStr = dateToLocalString(date);
              return blockedDates.includes(dateStr);
            },
            sunday: (date) => date.getDay() === 0,
          }}
          modifiersClassNames={{
            blocked: "bg-red-100 text-red-600 line-through",
            sunday: "bg-gray-100 text-gray-400",
          }}
        />
      </div>

      {/* Calendar Legend */}
      <div className="space-y-2 text-xs text-muted-foreground">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-100 border border-red-200 rounded"></div>
          <span>Kapalı günler (berber müsait değil)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-100 border border-gray-200 rounded"></div>
          <span>Pazar günleri (hizmet verilmiyor)</span>
        </div>
      </div>

      {/* Selected date confirmation */}
      {selectedDate && (
        <div className="p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="text-foreground">✓</div>
            <div className="text-sm">
              <strong>Seçilen:</strong> {formatDisplayDate(selectedDate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

function StaffSelection({
  selectedStaff,
  onStaffSelect,
}: {
  selectedStaff: string;
  onStaffSelect: (staffId: string) => void;
}) {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch staff from database
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const staffData = await response.json();
          setStaffMembers(staffData);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">
            Personel listesi yükleniyor...
          </p>
        </div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="w-full p-4 rounded-lg border-2 border-gray-200 bg-gray-50 animate-pulse"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="space-y-4">
        {staffMembers.map((staff) => {
          const isSelected = selectedStaff === staff.id;

          return (
            <button
              key={staff.id}
              onClick={() => onStaffSelect(staff.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "border-foreground bg-muted"
                  : "border-border bg-card hover:border-muted-foreground"
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center text-xl">
                  {staff.firstName.charAt(0)}
                  {staff.lastName.charAt(0)}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">
                    {staff.firstName} {staff.lastName}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {staff.role === "BARBER" ? "Usta Berber" : "Berber"}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedStaff && (
        <div className="p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="text-foreground">✓</div>
            <div className="text-sm">
              <strong>Seçilen:</strong>{" "}
              {staffMembers.find((s) => s.id === selectedStaff)?.firstName}{" "}
              {staffMembers.find((s) => s.id === selectedStaff)?.lastName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

interface TimeSlotStatus {
  time: string;
  available: boolean;
  reason?: string; // "Dolu", "Kapalı", "Zaman Bloğu" vb.
}

function TimeSelection({
  selectedTime,
  onTimeSelect,
  date,
  staffId,
}: {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  date: string;
  staffId: string;
}) {
  const [timeSlots, setTimeSlots] = useState<TimeSlotStatus[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch available time slots and blocked times
  useEffect(() => {
    if (!date || !staffId) {
      setTimeSlots([]);
      setLoading(false);
      return;
    }

    async function fetchTimeSlots() {
      setLoading(true);
      try {
        // Fetch available slots (already filtered by existing appointments)
        const slotsResponse = await fetch(
          `/api/time-slots?date=${date}&staffId=${staffId}`
        );
        
        // Fetch blocked times for this specific date and staff
        const blockedResponse = await fetch(
          `/api/blocked-dates?staffId=${staffId}&startDate=${date}&endDate=${date}`
        );
        
        let availableSlots: string[] = [];
        let blockedTimes: { 
          startTime: string; 
          endTime: string; 
          isFullDay?: boolean;
          reason?: string;
        }[] = [];
        
        if (slotsResponse.ok) {
          availableSlots = await slotsResponse.json();
        }
        
        if (blockedResponse.ok) {
          blockedTimes = await blockedResponse.json();
        }

        // Generate all possible time slots for the day
        const allTimeSlots = [
          '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', 
          '14:45', '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:00', '20:45'
        ];

        // Create time slot status array
        const timeSlotStatuses: TimeSlotStatus[] = allTimeSlots.map(time => {
          const isAvailable = availableSlots.includes(time);
          
          if (isAvailable) {
            return { time, available: true };
          }
          
          // Check if this time is blocked by a time block (not full day)
          const timeBlock = blockedTimes.find(block => 
            !block.isFullDay && 
            block.startTime && 
            block.endTime && 
            time >= block.startTime && 
            time < block.endTime
          );
          
          if (timeBlock) {
            return { 
              time, 
              available: false, 
              reason: timeBlock.reason || "Kapalı" 
            };
          }
          
          // Otherwise it's booked or past time
          return { 
            time, 
            available: false, 
            reason: "Dolu" 
          };
        });

        setTimeSlots(timeSlotStatuses);
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSlots();
  }, [date, staffId]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <p className="text-sm text-gray-600">Müsait saatler yükleniyor...</p>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-10 bg-gray-200 rounded animate-pulse"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  const formatDateDisplay = (dateStr: string) => {
    return formatTurkishDate(dateStr);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-1">
        <p className="text-sm font-medium">{formatDateDisplay(date)}</p>
        <p className="text-xs text-muted-foreground">
          {BUSINESS_RULES.APPOINTMENT_DURATION} dakika
        </p>
      </div>

      {/* Time Slots Grid */}
      <div className="grid grid-cols-2 gap-3">
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot.time;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.time}
              onClick={() => isAvailable && onTimeSelect(slot.time)}
              disabled={!isAvailable}
              className={`p-4 rounded-lg border-2 text-sm font-medium transition-all ${
                isSelected && isAvailable
                  ? "border-foreground bg-muted"
                  : isAvailable
                  ? "border-border bg-card hover:border-muted-foreground hover:shadow-sm"
                  : "border-red-200 bg-red-50 cursor-not-allowed opacity-75"
              }`}
            >
              <div className={`font-medium ${!isAvailable ? "text-red-600" : ""}`}>
                {slot.time}
              </div>
              <div className={`text-xs mt-1 ${
                isAvailable 
                  ? "text-muted-foreground" 
                  : "text-red-500 font-medium"
              }`}>
                {isAvailable ? "Müsait" : slot.reason}
              </div>
            </button>
          );
        })}
      </div>

      {/* Time Slot Legend */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <div className="space-y-2 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-medium text-blue-800">Saat Durumları:</span>
          </div>
          <div className="grid grid-cols-1 gap-1 text-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-card border border-border rounded"></div>
              <span>Müsait</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
              <span>Dolu/Kapalı</span>
            </div>
          </div>
        </div>
      </div>

      {/* Selected time confirmation */}
      {selectedTime && (
        <div className="p-3 bg-muted rounded-lg border">
          <div className="flex items-center gap-2">
            <div className="text-foreground">✓</div>
            <div className="text-sm">
              <strong>Seçilen:</strong> {selectedTime}
            </div>
          </div>
        </div>
      )}

      {/* No available slots message */}
      {timeSlots.length > 0 && timeSlots.every(slot => !slot.available) && (
        <div className="text-center p-6 bg-amber-50 rounded-lg border border-amber-200">
          <p className="font-medium text-amber-800">Bu tarihte müsait saat yok</p>
          <p className="text-xs text-amber-600 mt-1">
            Farklı tarih veya personel seçin
          </p>
        </div>
      )}
      
      {timeSlots.length === 0 && !loading && (
        <div className="text-center p-6 bg-muted rounded-lg border">
          <p className="font-medium">Saat bilgisi yüklenemedi</p>
          <p className="text-xs text-muted-foreground mt-1">
            Lütfen tekrar deneyin
          </p>
        </div>
      )}
    </div>
  );
}

function BookingConfirmation({ 
  bookingData, 
  phoneNumber, 
  onPhoneChange, 
  hasExistingPhone,
  notes,
  onNotesChange
}: { 
  bookingData: BookingData;
  phoneNumber: string;
  onPhoneChange: (phone: string) => void;
  hasExistingPhone: boolean;
  notes: string;
  onNotesChange: (notes: string) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="p-4 bg-muted rounded-lg border">
        <h3 className="font-medium text-center mb-4">Randevu Özeti</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tarih:</span>
            <span className="font-medium">
              {bookingData.date ? formatTurkishDate(bookingData.date) : "Seçilmedi"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Saat:</span>
            <span className="font-medium">
              {bookingData.timeSlot || "Seçilmedi"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Süre:</span>
            <span className="font-medium">
              {BUSINESS_RULES.APPOINTMENT_DURATION} dk
            </span>
          </div>
        </div>
      </div>

      {/* Phone Number Input */}
      <div className="space-y-3">
        <Label htmlFor="phone" className="text-sm font-medium">
          Telefon Numarası {!hasExistingPhone && <span className="text-red-500">*</span>}
        </Label>
        <div className="text-xs text-muted-foreground mb-2">
          {hasExistingPhone 
            ? "Mevcut telefon numaranızı değiştirebilirsiniz"
            : "Acil durumlar için berberinizin sizinle iletişim kurabilmesi için telefon numaranız gereklidir"
          }
        </div>
        <Input
          id="phone"
          type="tel"
          placeholder="05XX XXX XX XX"
          value={phoneNumber}
          onChange={(e) => onPhoneChange(e.target.value)}
          className="w-full"
        />
      </div>

      {/* Notes Input */}
      <div className="space-y-3">
        <Label htmlFor="notes" className="text-sm font-medium">
          Not (Opsiyonel)
        </Label>
        <div className="text-xs text-muted-foreground mb-2">
          Randevunuz hakkında berberinizle paylaşmak istediğiniz özel isteklerinizi yazabilirsiniz
        </div>
        <Textarea
          id="notes"
          placeholder="Örn: Saç boyası, özel kesim talebi, alerjiler vb."
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          className="w-full min-h-[80px] resize-none"
          maxLength={500}
        />
        <div className="text-xs text-muted-foreground text-right">
          {notes.length}/500 karakter
        </div>
      </div>

      <div className="text-xs text-muted-foreground text-center space-y-1">
        <p>
          {BUSINESS_RULES.CANCELLATION_HOURS} saat öncesine kadar iptal
          edilebilir
        </p>
      </div>
    </div>
  );
}
