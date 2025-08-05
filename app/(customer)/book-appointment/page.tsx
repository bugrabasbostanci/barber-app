"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  Check,
  ChevronLeft,
  Calendar,
  UserCheck,
  Clock,
  Phone,
  AlertCircle,
} from "lucide-react";
import { useRequireCustomer } from "@/hooks/useRequireAuth";
import { formatTurkishDate, dateToLocalString } from "@/lib/date-time";
import {
  useBookingStore,
  formatPhoneInput,
  validatePhone,
  type Staff,
} from "@/lib/stores/booking-store";
import {
  StaffSelectionSkeleton,
  TimeSlotsSkeleton,
  DateSelectionSkeleton,
  BookingStepSkeleton,
} from "@/components/skeletons/booking-skeleton";

export default function BookAppointmentPage() {
  const { loading, isAuthorized } = useRequireCustomer();

  // Zustand store
  const {
    currentStep,
    isBooking,
    phoneError,
    bookingData,
    customerInfo,

    // Actions
    nextStep,
    prevStep,
    setPhoneError,
    updateBookingData,
    updateCustomerInfo,
    fetchUserProfile,
    fetchStaffMembers,
    submitBooking,
    canProceed,
    getStaffName,
    resetBooking,
  } = useBookingStore();

  // Initialize data when authorized
  useEffect(() => {
    if (isAuthorized) {
      fetchUserProfile();
      fetchStaffMembers();
    }
  }, [isAuthorized, fetchUserProfile, fetchStaffMembers]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        {/* Step indicator skeleton */}
        <div className="px-4 py-2 bg-background border-b border-border">
          <div className="h-4 bg-muted rounded w-20 mx-auto animate-pulse"></div>
        </div>

        {/* Progress bar skeleton */}
        <div className="px-4 py-3 bg-background border-b border-border">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className="flex-1 h-2 rounded-full bg-muted animate-pulse"
              />
            ))}
          </div>
        </div>

        {/* Content skeleton */}
        <div className="px-4 py-8">
          <BookingStepSkeleton />
        </div>

        {/* Navigation skeleton */}
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="flex space-x-3">
            <div className="flex-1 h-14 bg-muted rounded-lg animate-pulse"></div>
            <div className="flex-1 h-14 bg-muted rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  // Show error if not authorized
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-background">
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

  // Booking submission handler
  const handleBookingSubmission = async () => {
    await submitBooking();
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tarih Seçin</h2>
              <p className="text-muted-foreground">Tercih ettiğiniz günü seçin</p>
            </div>
            <Suspense fallback={<DateSelectionSkeleton />}>
              <DateSelectionNew
                selectedDate={bookingData.date}
                onDateSelect={(date) => updateBookingData("date", date)}
              />
            </Suspense>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <UserCheck className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Berberinizi Seçin</h2>
              <p className="text-muted-foreground">Tercih ettiğiniz berberi seçin</p>
            </div>
            <Suspense fallback={<StaffSelectionSkeleton />}>
              <StaffSelectionNew
                selectedStaff={bookingData.staffId}
                selectedDate={bookingData.date}
                onStaffSelect={(staffId) =>
                  updateBookingData("staffId", staffId)
                }
              />
            </Suspense>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">Saat Seçin</h2>
              <p className="text-muted-foreground">
                {bookingData.staffId && getStaffName(bookingData.staffId)} için{" "}
                {bookingData.date && formatTurkishDate(bookingData.date)}{" "}
                tarihinde müsait saatler
              </p>
            </div>
            <Suspense fallback={<TimeSlotsSkeleton />}>
              <TimeSelectionNew
                selectedTime={bookingData.timeSlot}
                onTimeSelect={(time) => updateBookingData("timeSlot", time)}
                date={bookingData.date}
                staffId={bookingData.staffId}
              />
            </Suspense>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto text-primary mb-4" />
              <h2 className="text-2xl font-bold mb-2">İletişim Bilgileri</h2>
              <p className="text-muted-foreground">Size onay mesajı göndereceğiz</p>
            </div>
            <BookingConfirmationNew
              bookingData={bookingData}
              customerInfo={customerInfo}
              onCustomerInfoChange={updateCustomerInfo}
              phoneError={phoneError}
              setPhoneError={setPhoneError}
            />
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8 pb-32">
            <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600 dark:text-green-400" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-2">
                Randevu Onaylandı!
              </h2>
              <p className="text-muted-foreground">Randevunuz hazır</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tarih:</span>
                    <span className="font-medium">
                      {bookingData.date && formatTurkishDate(bookingData.date)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Berber:</span>
                    <span className="font-medium">
                      {bookingData.staffId && getStaffName(bookingData.staffId)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Saat:</span>
                    <span className="font-medium">
                      {bookingData.timeSlot} -{" "}
                      {(() => {
                        if (!bookingData.timeSlot) return "";
                        const [hours, minutes] = bookingData.timeSlot
                          .split(":")
                          .map(Number);
                        const endTime = new Date();
                        endTime.setHours(hours, minutes + 45, 0, 0);
                        return endTime.toLocaleTimeString("tr-TR", {
                          hour: "2-digit",
                          minute: "2-digit",
                          hour12: false,
                        });
                      })()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Süre:</span>
                    <span>45 dakika</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-muted-foreground bg-muted p-4 rounded-xl">
              <p>• Randevudan 2 saat öncesine kadar iptal edebilirsiniz</p>
              <p>• Lütfen 15 dakika erken gelin</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Step indicator */}
      {currentStep < 5 && (
        <div className="px-4 py-2 bg-background border-b border-border">
          <p className="text-xs text-muted-foreground text-center">
            Adım {currentStep} / 4
          </p>
        </div>
      )}

      {/* Progress */}
      {currentStep < 5 && (
        <div className="px-4 py-3 bg-background border-b border-border">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full transition-all ${
                  stepNum <= currentStep ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 py-8">{renderStepContent()}</div>

      {/* Navigation */}
      {currentStep < 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4">
          <div className="flex space-x-3">
            {currentStep > 1 && (
              <Button
                variant="outline"
                onClick={prevStep}
                className="flex-1 h-14"
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Geri
              </Button>
            )}
            <Button
              onClick={currentStep === 4 ? handleBookingSubmission : nextStep}
              disabled={!canProceed() || isBooking}
              className="flex-1 h-14 text-base font-semibold"
            >
              {currentStep === 4
                ? isBooking
                  ? "Onaylanıyor..."
                  : "Randevuyu Onayla"
                : "Devam Et"}
            </Button>
          </div>
        </div>
      )}

      {currentStep === 5 && (
        <div className="fixed bottom-0 left-0 right-0 bg-background border-t border-border p-4 space-y-3">
          <button
            onClick={resetBooking}
            className="w-full h-14 text-base font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Başka Randevu Al
          </button>
          <Link href="/my-appointments">
            <Button
              variant="outline"
              className="w-full h-14 text-base bg-transparent"
            >
              Randevularımı Görüntüle
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}

// Staff Selection Component with Avatar Design
function StaffSelectionNew({
  selectedStaff,
  onStaffSelect,
}: {
  selectedStaff: string;
  selectedDate?: string; // Optional for backward compatibility
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
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setStaffMembers(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStaff();
  }, []);

  const getStaffTitle = (role: string) => {
    return role === "BARBER" ? "Berber" : "Çalışan";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return <StaffSelectionSkeleton />;
  }

  if (staffMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-4">Şu anda müsait berber bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {staffMembers.map((staff) => {
        const isSelected = selectedStaff === staff.id;

        return (
          <button
            key={staff.id}
            onClick={() => onStaffSelect(staff.id)}
            className={`w-full p-5 rounded-xl border-2 transition-all ${
              isSelected
                ? "border-primary bg-primary/10"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-semibold text-lg">
                {getInitials(staff.firstName, staff.lastName)}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">
                  {staff.firstName} {staff.lastName}
                </p>
                <p className="text-sm text-primary font-medium">
                  {getStaffTitle(staff.role)}
                </p>
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

// Time Selection Component with exact design match
function TimeSelectionNew({
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
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date || !staffId) {
      setLoading(false);
      return;
    }

    async function fetchTimeSlots() {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          `/api/time-slots?date=${date}&staffId=${staffId}`
        );

        if (response.ok) {
          const result = await response.json();
          console.log(`Received time slots response for date ${date}:`, result);

          if (result.success && Array.isArray(result.data)) {
            setAvailableSlots(result.data);
          } else {
            setError("Zaman dilimi verisi alınamadı");
            setAvailableSlots([]);
          }
        } else {
          setError("Zaman dilimleri yüklenirken hata oluştu");
          setAvailableSlots([]);
        }
      } catch {
        setError("Bağlantı hatası oluştu");
        setAvailableSlots([]);
      } finally {
        setLoading(false);
      }
    }

    fetchTimeSlots();
  }, [date, staffId]);

  if (loading) {
    return <TimeSlotsSkeleton />;
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-destructive mb-4">{error}</p>
        <Button
          variant="outline"
          onClick={() => window.location.reload()}
          className="bg-transparent"
        >
          Tekrar Dene
        </Button>
      </div>
    );
  }

  if (availableSlots.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-orange-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-foreground">
          Bu tarih için müsait saat yok
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
          Seçilen berber bu tarih için tamamen dolu. Başka bir tarih veya berber
          deneyebilirsiniz.
        </p>
        <div className="space-y-3">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="bg-transparent"
          >
            Farklı Tarih Seç
          </Button>
          <p className="text-xs text-muted-foreground/60">
            veya geri dönüp başka berber seçin
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {availableSlots.map((time) => (
        <button
          key={time}
          onClick={() => onTimeSelect(time)}
          className={`p-4 rounded-xl border-2 transition-all ${
            selectedTime === time
              ? "border-primary bg-primary/10 font-semibold text-primary"
              : "border-border hover:border-muted-foreground/30"
          }`}
        >
          <div className="text-center">
            <p className="font-medium">{time}</p>
            <p className="text-xs text-muted-foreground mt-1">45 dk</p>
          </div>
        </button>
      ))}
    </div>
  );
}

// Booking Confirmation Component with real staff integration
function BookingConfirmationNew({
  bookingData,
  customerInfo,
  onCustomerInfoChange,
  phoneError,
  setPhoneError,
}: {
  bookingData: { date: string; staffId: string; timeSlot: string };
  customerInfo: { phone: string; notes: string };
  onCustomerInfoChange: (
    info: Partial<{ phone: string; notes: string }>
  ) => void;
  phoneError: string;
  setPhoneError: (error: string) => void;
}) {
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
        console.error("Error fetching staff:", error);
      }
    }

    fetchStaff();
  }, []);

  const getBarberName = () => {
    const staff = staffMembers.find((s) => s.id === bookingData.staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Seçilen Berber";
  };

  const getEndTime = () => {
    if (!bookingData.timeSlot) return "";
    const [hours, minutes] = bookingData.timeSlot.split(":").map(Number);
    const endTime = new Date();
    endTime.setHours(hours, minutes + 45, 0, 0);
    return endTime.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  return (
    <div className="space-y-6">
      {/* Booking Summary */}
      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Randevu Özeti</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tarih:</span>
              <span className="font-medium">
                {bookingData.date && formatTurkishDate(bookingData.date)}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Berber:</span>
              <span className="font-medium">{getBarberName()}</span>
            </div>
            <div className="flex justify-between">
              <span>Saat:</span>
              <span className="font-medium">
                {bookingData.timeSlot} - {getEndTime()}
              </span>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t border-border">
              <span>Süre:</span>
              <span>45 dakika</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Form */}
      <div className="space-y-4">
        <div>
          <Label htmlFor="phone" className="text-base font-medium">
            Telefon Numarası *
          </Label>
          <Input
            id="phone"
            type="tel"
            value={customerInfo.phone}
            onChange={(e) => {
              const formattedPhone = formatPhoneInput(e.target.value);
              onCustomerInfoChange({ phone: formattedPhone });

              // Validate phone
              if (formattedPhone.trim() === "") {
                setPhoneError("");
              } else if (!validatePhone(formattedPhone)) {
                setPhoneError(
                  "Geçerli bir telefon numarası giriniz (0532 123 45 67)"
                );
              } else {
                setPhoneError("");
              }
            }}
            placeholder="0532 123 45 67"
            className={`h-14 text-base mt-2 ${
              phoneError
                ? "border-destructive focus:border-destructive focus:ring-destructive"
                : ""
            }`}
          />
          {phoneError && (
            <div className="flex items-center gap-2 mt-2 text-destructive text-sm">
              <AlertCircle className="w-4 h-4" />
              <span>{phoneError}</span>
            </div>
          )}
        </div>

        <div>
          <Label htmlFor="notes" className="text-base font-medium">
            Özel Notlar (opsiyonel)
          </Label>
          <textarea
            id="notes"
            value={customerInfo.notes || ""}
            onChange={(e) => onCustomerInfoChange({ notes: e.target.value })}
            placeholder="Berberiniz için özel istekleriniz veya notlarınız..."
            className="w-full h-24 p-3 text-base mt-2 border border-border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent bg-background"
          />
        </div>
      </div>
    </div>
  );
}

// Date Selection Component with real blocked dates integration
function DateSelectionNew({
  selectedDate,
  onDateSelect,
}: {
  selectedDate: string;
  onDateSelect: (date: string) => void;
}) {
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBlockedDatesAndGenerateAvailable() {
      try {
        setLoading(true);

        // Calculate date range for next 7 business days
        const today = new Date();
        const endDate = new Date(today);
        endDate.setDate(today.getDate() + 14); // Look ahead 2 weeks to find 7 available days

        // Fetch blocked dates from API - use local date strings
        const todayStr = dateToLocalString(today);
        const endDateStr = dateToLocalString(endDate);

        const response = await fetch(
          `/api/blocked-dates?startDate=${todayStr}&endDate=${endDateStr}`
        );

        const blockedSet = new Set<string>();
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            // Create set of fully blocked dates
            result.data.forEach(
              (block: { date: string; isFullDay: boolean }) => {
                if (block.isFullDay) {
                  blockedSet.add(block.date);
                }
              }
            );
          }
        }

        // Generate available dates (excluding Sundays and blocked dates)
        const dates: Date[] = [];
        const currentDate = new Date(today);

        while (dates.length < 7) {
          const dayOfWeek = currentDate.getDay();
          const dateString = dateToLocalString(currentDate);

          // Skip Sundays (0) and blocked dates
          if (dayOfWeek !== 0 && !blockedSet.has(dateString)) {
            dates.push(new Date(currentDate));
          }

          currentDate.setDate(currentDate.getDate() + 1);

          // Prevent infinite loop
          if (currentDate.getTime() > endDate.getTime()) {
            break;
          }
        }

        setAvailableDates(dates);
      } catch (error) {
        console.error("Error fetching blocked dates:", error);
        // Fallback to basic date generation
        const dates: Date[] = [];
        const today = new Date();
        const currentDate = new Date(today);

        while (dates.length < 7) {
          if (currentDate.getDay() !== 0) {
            // Skip Sundays
            dates.push(new Date(currentDate));
          }
          currentDate.setDate(currentDate.getDate() + 1);
        }

        setAvailableDates(dates);
      } finally {
        setLoading(false);
      }
    }

    fetchBlockedDatesAndGenerateAvailable();
  }, []);

  const formatDate = (date: Date) => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    if (date.toDateString() === today.toDateString()) {
      return "Bugün";
    }
    if (date.toDateString() === tomorrow.toDateString()) {
      return "Yarın";
    }

    return date.toLocaleDateString("tr-TR", {
      weekday: "short",
      day: "numeric",
      month: "short",
    });
  };

  if (loading) {
    return <DateSelectionSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {availableDates.map((date, index) => {
          const dateString = dateToLocalString(date);
          const isSelected = selectedDate === dateString;

          return (
            <button
              key={index}
              onClick={() => onDateSelect(dateString)}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/10"
                  : "border-border hover:border-muted-foreground/30"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold text-lg">{formatDate(date)}</p>
                  <p className="text-sm text-muted-foreground">
                    {date.toLocaleDateString("tr-TR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sunday Notice */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-4">
        <p className="text-sm text-destructive text-center">
          <strong>Not:</strong> Pazar günleri kapalıyız
        </p>
      </div>
    </div>
  );
}
