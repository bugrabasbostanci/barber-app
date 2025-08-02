"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Check,
  ChevronLeft,
  Calendar,
  UserCheck,
  Clock,
  Phone,
} from "lucide-react";
import { useRequireCustomer } from "@/hooks/useRequireAuth";

interface BookingData {
  date: string;
  staffId: string;
  timeSlot: string;
}

interface UserProfile {
  phone: string | null;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
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
  const [customerInfo, setCustomerInfo] = useState({
    phone: "",
    notes: "",
  });
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);

  // Fetch user profile to check phone number
  useEffect(() => {
    async function fetchUserProfile() {
      try {
        const response = await fetch("/api/profile");
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const profile = result.data;
            setUserProfile(profile);
            setCustomerInfo((prev) => ({
              ...prev,
              phone: profile.phone || "",
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
      }
    }

    if (isAuthorized) {
      fetchUserProfile();
    }
  }, [isAuthorized]);

  // Fetch staff members
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

    if (isAuthorized) {
      fetchStaff();
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

  const handleBookingConfirmationNew = async () => {
    setIsBooking(true);

    try {
      // If phone number is provided and different from profile, update profile first
      if (customerInfo.phone && customerInfo.phone !== userProfile.phone) {
        const profileResponse = await fetch("/api/profile", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: customerInfo.phone }),
        });

        if (!profileResponse.ok) {
          alert("Telefon numarası güncellenemedi.");
          setIsBooking(false);
          return;
        }
      }

      const payload = {
        date: bookingData.date,
        staffId: bookingData.staffId,
        startTime: bookingData.timeSlot,
        ...(customerInfo.notes?.trim() && { notes: customerInfo.notes.trim() }),
      };

      const response = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setCurrentStep(5);
      } else {
        if (result.details && Array.isArray(result.details)) {
          const errorDetails = result.details
            .map(
              (detail: { field: string; message: string }) =>
                `${detail.field}: ${detail.message}`
            )
            .join("\n");
          alert(`Validation errors:\n${errorDetails}`);
        } else {
          alert(result.error || "Randevu oluşturulurken bir hata oluştu.");
        }
      }
    } catch (error) {
      console.error("Randevu oluşturulurken hata oluştu:", error);
      alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsBooking(false);
    }
  };

  const getStaffName = (staffId: string) => {
    const staff = staffMembers.find((s) => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : "Seçilen Berber";
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1:
        return bookingData.date !== "";
      case 2:
        return bookingData.staffId !== "";
      case 3:
        return bookingData.timeSlot !== "";
      case 4:
        return customerInfo.phone.trim() !== "";
      default:
        return false;
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Calendar className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Tarih Seçin</h2>
              <p className="text-gray-500">Tercih ettiğiniz günü seçin</p>
            </div>
            <DateSelectionNew
              selectedDate={bookingData.date}
              onDateSelect={(date) => updateBookingData("date", date)}
            />
          </div>
        );

      case 2:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <UserCheck className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Berberinizi Seçin</h2>
              <p className="text-gray-500">Tercih ettiğiniz berberi seçin</p>
            </div>
            <StaffSelectionNew
              selectedStaff={bookingData.staffId}
              selectedDate={bookingData.date}
              onStaffSelect={(staffId) => updateBookingData("staffId", staffId)}
            />
          </div>
        );

      case 3:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Clock className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">Saat Seçin</h2>
              <p className="text-gray-500">
                {bookingData.staffId && getStaffName(bookingData.staffId)} için{" "}
                {bookingData.date &&
                  new Date(bookingData.date).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}{" "}
                tarihinde müsait saatler
              </p>
            </div>
            <TimeSelectionNew
              selectedTime={bookingData.timeSlot}
              onTimeSelect={(time) => updateBookingData("timeSlot", time)}
              date={bookingData.date}
              staffId={bookingData.staffId}
            />
          </div>
        );

      case 4:
        return (
          <div className="space-y-6 pb-24">
            <div className="text-center">
              <Phone className="w-12 h-12 mx-auto text-blue-600 mb-4" />
              <h2 className="text-2xl font-bold mb-2">İletişim Bilgileri</h2>
              <p className="text-gray-500">Size onay mesajı göndereceğiz</p>
            </div>
            <BookingConfirmationNew
              bookingData={bookingData}
              customerInfo={customerInfo}
              onCustomerInfoChange={setCustomerInfo}
            />
          </div>
        );

      case 5:
        return (
          <div className="text-center space-y-8 pb-32">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-10 h-10 text-green-600" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-green-600 mb-2">
                Randevu Onaylandı!
              </h2>
              <p className="text-gray-600">Randevunuz hazır</p>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Tarih:</span>
                    <span className="font-medium">
                      {bookingData.date &&
                        new Date(bookingData.date).toLocaleDateString("tr-TR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                        })}
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
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Süre:</span>
                    <span>45 dakika</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="text-sm text-gray-500 bg-gray-50 p-4 rounded-xl">
              <p>• Randevudan 2 saat öncesine kadar iptal edebilirsiniz</p>
              <p>• Lütfen 5 dakika erken gelin</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b px-4 py-4 sticky top-0 z-50">
        <div className="flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
          </Link>
          <div className="text-center">
            <h1 className="font-semibold">Randevu Al</h1>
            {currentStep < 5 && (
              <p className="text-xs text-gray-500">Adım {currentStep} / 4</p>
            )}
          </div>
          <div className="w-16"></div>
        </div>
      </header>

      {/* Progress */}
      {currentStep < 5 && (
        <div className="px-4 py-3 bg-white border-b">
          <div className="flex space-x-2">
            {[1, 2, 3, 4].map((stepNum) => (
              <div
                key={stepNum}
                className={`flex-1 h-2 rounded-full transition-all ${
                  stepNum <= currentStep ? "bg-blue-500" : "bg-gray-200"
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
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
              onClick={
                currentStep === 4 ? handleBookingConfirmationNew : nextStep
              }
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
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 space-y-3">
          <Link href="/">
            <Button className="w-full h-14 text-base font-semibold">
              Başka Randevu Al
            </Button>
          </Link>
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
  selectedDate,
  onStaffSelect,
}: {
  selectedStaff: string;
  selectedDate: string;
  onStaffSelect: (staffId: string) => void;
}) {
  const [staffMembers, setStaffMembers] = useState<Staff[]>([]);
  const [staffAvailability, setStaffAvailability] = useState<
    Record<string, number>
  >({});
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

  // Fetch availability for each staff member when date is selected
  useEffect(() => {
    if (!selectedDate || staffMembers.length === 0) return;

    async function fetchStaffAvailability() {
      const availabilityMap: Record<string, number> = {};

      // Fetch availability for each staff member
      for (const staff of staffMembers) {
        try {
          const response = await fetch(
            `/api/time-slots?date=${selectedDate}&staffId=${staff.id}`
          );
          if (response.ok) {
            const slots = await response.json();
            availabilityMap[staff.id] = Array.isArray(slots) ? slots.length : 0;
          } else {
            availabilityMap[staff.id] = 0;
          }
        } catch (error) {
          console.error(
            `Error fetching availability for staff ${staff.id}:`,
            error
          );
          availabilityMap[staff.id] = 0;
        }
      }

      setStaffAvailability(availabilityMap);
    }

    fetchStaffAvailability();
  }, [selectedDate, staffMembers]);

  const getStaffTitle = (role: string) => {
    return role === "BARBER" ? "Berber" : "Çalışan";
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="w-full p-5 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse"
          >
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
              <div className="flex-1">
                <div className="h-5 bg-gray-300 rounded w-24 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (staffMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">Şu anda müsait berber bulunmuyor</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {staffMembers.map((staff) => {
        const isSelected = selectedStaff === staff.id;
        const availableSlots = staffAvailability[staff.id];
        const isUnavailable = Boolean(selectedDate && availableSlots === 0);

        return (
          <button
            key={staff.id}
            onClick={() => !isUnavailable && onStaffSelect(staff.id)}
            disabled={isUnavailable}
            className={`w-full p-5 rounded-xl border-2 transition-all ${
              isUnavailable
                ? "border-gray-200 bg-gray-50 opacity-60 cursor-not-allowed"
                : isSelected
                ? "border-blue-500 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center space-x-4">
              {/* Avatar */}
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center font-semibold text-lg">
                {getInitials(staff.firstName, staff.lastName)}
              </div>

              {/* Info */}
              <div className="flex-1 text-left">
                <p className="font-semibold text-lg">
                  {staff.firstName} {staff.lastName}
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  {getStaffTitle(staff.role)}
                </p>
                {selectedDate && (
                  <div className="mt-1">
                    {staffAvailability[staff.id] !== undefined ? (
                      staffAvailability[staff.id] > 0 ? (
                        <p className="text-xs text-green-600 font-medium">
                          {staffAvailability[staff.id]} müsait saat
                        </p>
                      ) : (
                        <p className="text-xs text-red-600 font-medium">
                          Bu tarih için müsait değil
                        </p>
                      )
                    ) : (
                      <p className="text-xs text-gray-400">
                        Müsaitlik kontrol ediliyor...
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Selection Indicator */}
              {isSelected && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
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
          const slots = await response.json();
          console.log(
            `Received ${slots.length} time slots for date ${date}:`,
            slots
          );
          if (Array.isArray(slots)) {
            setAvailableSlots(slots);
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
    return (
      <div className="grid grid-cols-4 gap-3">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <div key={i} className="p-4 bg-gray-200 rounded-xl animate-pulse">
            <div className="h-8"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
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
        <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Clock className="w-8 h-8 text-orange-600" />
        </div>
        <h3 className="font-semibold text-lg mb-2 text-gray-800">
          Bu tarih için müsait saat yok
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm mx-auto">
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
          <p className="text-xs text-gray-400">
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
              ? "border-blue-500 bg-blue-50 font-semibold text-blue-700"
              : "border-gray-200 hover:border-gray-300"
          }`}
        >
          <div className="text-center">
            <p className="font-medium">{time}</p>
            <p className="text-xs text-gray-500 mt-1">45 dk</p>
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
}: {
  bookingData: BookingData;
  customerInfo: { phone: string; notes: string };
  onCustomerInfoChange: (info: { phone: string; notes: string }) => void;
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
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <h3 className="font-semibold mb-3">Randevu Özeti</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Tarih:</span>
              <span className="font-medium">
                {bookingData.date &&
                  new Date(bookingData.date).toLocaleDateString("tr-TR", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
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
            <div className="flex justify-between text-sm text-gray-600 pt-2 border-t">
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
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, phone: e.target.value })
            }
            placeholder="0532 123 45 67"
            className="h-14 text-base mt-2"
          />
        </div>

        <div>
          <Label htmlFor="notes" className="text-base font-medium">
            Özel Notlar (opsiyonel)
          </Label>
          <textarea
            id="notes"
            value={customerInfo.notes || ""}
            onChange={(e) =>
              onCustomerInfoChange({ ...customerInfo, notes: e.target.value })
            }
            placeholder="Berberiniz için özel istekleriniz veya notlarınız..."
            className="w-full h-24 p-3 text-base mt-2 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        // Fetch blocked dates from API
        const response = await fetch(
          `/api/blocked-dates?startDate=${
            today.toISOString().split("T")[0]
          }&endDate=${endDate.toISOString().split("T")[0]}`
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
          const dateString = currentDate.toISOString().split("T")[0];

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
    return (
      <div className="space-y-3">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="w-full p-4 rounded-xl border-2 border-gray-200 bg-gray-50 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-5 bg-gray-300 rounded w-20 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-32"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-gray-300 rounded w-16 mb-1"></div>
                <div className="flex justify-end">
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full mr-1"></div>
                  <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {availableDates.map((date, index) => {
          const isSelected = selectedDate === date.toISOString().split("T")[0];
          // Show realistic availability (can be enhanced with real data later)
          const availableSlots = Math.floor(Math.random() * 8) + 5; // 5-12 slots

          return (
            <button
              key={index}
              onClick={() => onDateSelect(date.toISOString().split("T")[0])}
              className={`w-full p-4 rounded-xl border-2 transition-all ${
                isSelected
                  ? "border-blue-500 bg-blue-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="text-left">
                  <p className="font-semibold text-lg">{formatDate(date)}</p>
                  <p className="text-sm text-gray-500">
                    {date.toLocaleDateString("tr-TR", {
                      weekday: "long",
                      day: "numeric",
                      month: "long",
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-green-600">
                    {availableSlots} slot
                  </p>
                  <div className="flex justify-end mt-1">
                    {[1, 2, 3].map((dot) => (
                      <div
                        key={dot}
                        className={`w-2 h-2 rounded-full mr-1 ${
                          availableSlots > 10
                            ? "bg-green-400"
                            : availableSlots > 7
                            ? "bg-yellow-400"
                            : "bg-orange-400"
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Sunday Notice */}
      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
        <p className="text-sm text-red-600 text-center">
          <strong>Not:</strong> Pazar günleri kapalıyız
        </p>
      </div>
    </div>
  );
}
