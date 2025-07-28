"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { BUSINESS_RULES } from "@/lib/constants";
import { addDays, isSunday, isAfter, startOfDay } from "date-fns";

interface BookingData {
  date: string;
  staffId: string;
  timeSlot: string;
}

export default function BookAppointmentPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [bookingData, setBookingData] = useState<BookingData>({
    date: "",
    staffId: "",
    timeSlot: "",
  });
  const [isBooking, setIsBooking] = useState(false);

  const updateBookingData = (field: keyof BookingData, value: string) => {
    setBookingData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 4));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleBookingConfirmation = async () => {
    setIsBooking(true);

    try {
      // In production, this would be an API call to create the appointment
      // const response = await fetch('/api/appointments', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     date: bookingData.date,
      //     staffId: bookingData.staffId,
      //     timeSlot: bookingData.timeSlot
      //   })
      // });

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Redirect to success page or my-appointments
      window.location.href = "/my-appointments?success=true";
    } catch (error) {
      console.error("Randevu oluşturulurken hata oluştu:", error);
      // In production, show error toast/notification
      alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsBooking(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Button variant="ghost" size="sm">
                ← Ana Sayfa
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Randevu Al</h1>
            <div className="w-20"></div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="px-4 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step <= currentStep
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-500"
                  }`}
                >
                  {step}
                </div>
                {step < 4 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? "bg-blue-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Tarih</span>
            <span>Personel</span>
            <span>Saat</span>
            <span>Onay</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="px-4 pb-8">
        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-xl">
                {currentStep === 1 && "Tarih Seçin"}
                {currentStep === 2 && "Personel Seçin"}
                {currentStep === 3 && "Saat Seçin"}
                {currentStep === 4 && "Randevunuzu Onaylayın"}
              </CardTitle>
              <CardDescription>
                {currentStep === 1 && "Randevu almak istediğiniz tarihi seçin"}
                {currentStep === 2 && "Sizinle ilgilenecek personeli seçin"}
                {currentStep === 3 && "Uygun saat dilimini seçin"}
                {currentStep === 4 && "Randevu bilgilerinizi kontrol edin"}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
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
                <BookingConfirmation bookingData={bookingData} />
              )}

              {/* Navigation Buttons */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button
                    variant="outline"
                    onClick={prevStep}
                    className="flex-1"
                  >
                    Geri
                  </Button>
                )}
                {currentStep < 4 ? (
                  <Button
                    onClick={nextStep}
                    className="flex-1"
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
                    className="flex-1"
                    onClick={handleBookingConfirmation}
                    disabled={isBooking}
                  >
                    {isBooking
                      ? "Randevu Oluşturuluyor..."
                      : "Randevuyu Onayla"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
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
  >(selectedDate ? new Date(selectedDate) : undefined);

  const today = new Date();
  const maxDate = addDays(today, BUSINESS_RULES.BOOKING_WINDOW_DAYS - 1);

  // Business rules: Disable Sundays and dates outside booking window
  const isDateDisabled = (date: Date) => {
    // Pazarları kapat (CLOSED_DAYS: [0])
    if (isSunday(date)) return true;

    // Bugünden önceki tarihler
    if (!isAfter(date, startOfDay(addDays(today, -1)))) return true;

    // 7 günden sonraki tarihler
    if (isAfter(date, maxDate)) return true;

    return false;
  };

  const handleDateSelect = (date: Date | undefined) => {
    if (date && !isDateDisabled(date)) {
      setSelectedCalendarDate(date);
      onDateSelect(date.toISOString().split("T")[0]); // YYYY-MM-DD format
    }
  };

  const formatDisplayDate = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    const dayName = days[date.getDay()];
    const day = date.getDate();
    const month = months[date.getMonth()];

    return `${day} ${month} ${dayName}`;
  };

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Çalışma saatleri: {BUSINESS_RULES.WORKING_HOURS.start} -{" "}
          {BUSINESS_RULES.WORKING_HOURS.end}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Pazartesi - Cumartesi arası randevu alabilirsiniz
        </p>
      </div>

      {/* Monthly Calendar */}
      <div className="flex justify-center px-4">
        <div className="border rounded-lg bg-white p-3 shadow-sm">
          <Calendar
            mode="single"
            selected={selectedCalendarDate}
            onSelect={handleDateSelect}
            disabled={isDateDisabled}
            className="w-full"
            styles={{
              month: { width: "100%" },
              table: { width: "100%" },
              head_cell: {
                textAlign: "center",
                fontWeight: "normal",
                color: "#6b7280",
                fontSize: "0.875rem",
              },
              cell: {
                textAlign: "center",
                padding: "2px",
              },
              day: {
                width: "36px",
                height: "36px",
                fontSize: "0.875rem",
                borderRadius: "6px",
              },
              day_today: {
                backgroundColor: "#f3f4f6",
                fontWeight: "bold",
              },
              day_selected: {
                backgroundColor: "#3b82f6",
                color: "white",
              },
              day_disabled: {
                color: "#d1d5db",
                cursor: "not-allowed",
              },
            }}
          />
        </div>
      </div>

      {/* Selected date confirmation */}
      {selectedDate && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-green-600">✓</div>
            <div className="text-sm text-green-700">
              <strong>Seçilen tarih:</strong> {formatDisplayDate(selectedDate)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StaffSelection({
  selectedStaff,
  onStaffSelect,
}: {
  selectedStaff: string;
  onStaffSelect: (staffId: string) => void;
}) {
  // Sample staff data - production'da database'den gelecek
  const staffMembers = [
    {
      id: "staff-1",
      firstName: "Ahmet",
      lastName: "Yılmaz",
      role: "BARBER",
      experience: "5 yıl",
      specialty: "Saç Kesimi & Sakal Traşı",
      rating: 4.8,
      avatar: "👨‍💼",
    },
    {
      id: "staff-2",
      firstName: "Mehmet",
      lastName: "Kaya",
      role: "EMPLOYEE",
      experience: "3 yıl",
      specialty: "Saç Kesimi",
      rating: 4.6,
      avatar: "👨‍🔧",
    },
    {
      id: "staff-3",
      firstName: "Mustafa",
      lastName: "Demir",
      role: "BARBER",
      experience: "8 yıl",
      specialty: "Klasik Berberlik & Cilt Bakımı",
      rating: 4.9,
      avatar: "👨‍⚕️",
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          Sizinle ilgilenecek personeli seçin
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Tüm personellerimiz deneyimli ve sertifikalıdır
        </p>
      </div>

      <div className="space-y-3">
        {staffMembers.map((staff) => {
          const isSelected = selectedStaff === staff.id;

          return (
            <button
              key={staff.id}
              onClick={() => onStaffSelect(staff.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                isSelected
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="text-3xl">{staff.avatar}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {staff.firstName} {staff.lastName}
                    </h3>
                    <div className="flex items-center gap-1">
                      <span className="text-yellow-400">⭐</span>
                      <span className="text-sm text-gray-600">
                        {staff.rating}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-1">
                    {staff.specialty}
                  </p>
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2 py-1 rounded-full ${
                        staff.role === "BARBER"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {staff.role === "BARBER" ? "Berber" : "Çalışan"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {staff.experience} deneyim
                    </span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {selectedStaff && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-green-600">✓</div>
            <div className="text-sm text-green-700">
              <strong>Seçilen personel:</strong>{" "}
              {staffMembers.find((s) => s.id === selectedStaff)?.firstName}{" "}
              {staffMembers.find((s) => s.id === selectedStaff)?.lastName}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TimeSelection({
  selectedTime,
  onTimeSelect,
  date,
}: {
  selectedTime: string;
  onTimeSelect: (time: string) => void;
  date: string;
  staffId: string;
}) {
  // Generate time slots based on business rules
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = BUSINESS_RULES.WORKING_HOURS.start; // "09:30"
    const endTime = BUSINESS_RULES.WORKING_HOURS.end; // "21:30"
    const duration = BUSINESS_RULES.APPOINTMENT_DURATION; // 45 minutes

    // Parse start time
    const [startHour, startMinute] = startTime.split(":").map(Number);
    const [endHour, endMinute] = endTime.split(":").map(Number);

    let currentHour = startHour;
    let currentMinute = startMinute;

    while (
      currentHour < endHour ||
      (currentHour === endHour && currentMinute <= endMinute - duration)
    ) {
      const timeString = `${currentHour
        .toString()
        .padStart(2, "0")}:${currentMinute.toString().padStart(2, "0")}`;

      // Calculate end time for this slot
      let endSlotMinute = currentMinute + duration;
      let endSlotHour = currentHour;

      if (endSlotMinute >= 60) {
        endSlotHour++;
        endSlotMinute -= 60;
      }

      const endTimeString = `${endSlotHour
        .toString()
        .padStart(2, "0")}:${endSlotMinute.toString().padStart(2, "0")}`;

      slots.push({
        id: timeString,
        startTime: timeString,
        endTime: endTimeString,
        available: Math.random() > 0.3, // Random availability for demo - production'da database'den gelecek
      });

      // Move to next slot
      currentMinute += duration;
      if (currentMinute >= 60) {
        currentHour++;
        currentMinute -= 60;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  const formatDateDisplay = (dateStr: string) => {
    const date = new Date(dateStr + "T00:00:00");
    const days = [
      "Pazar",
      "Pazartesi",
      "Salı",
      "Çarşamba",
      "Perşembe",
      "Cuma",
      "Cumartesi",
    ];
    const months = [
      "Ocak",
      "Şubat",
      "Mart",
      "Nisan",
      "Mayıs",
      "Haziran",
      "Temmuz",
      "Ağustos",
      "Eylül",
      "Ekim",
      "Kasım",
      "Aralık",
    ];

    return `${date.getDate()} ${months[date.getMonth()]} ${
      days[date.getDay()]
    }`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <p className="text-sm text-gray-600">
          <strong>{formatDateDisplay(date)}</strong> tarihinde müsait saatler
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Randevu süresi: {BUSINESS_RULES.APPOINTMENT_DURATION} dakika
        </p>
      </div>

      {/* All Time Slots */}
      <div className="grid grid-cols-2 gap-2">
        {timeSlots.map((slot) => {
          const isSelected = selectedTime === slot.id;
          const isAvailable = slot.available;

          return (
            <button
              key={slot.id}
              onClick={() => isAvailable && onTimeSelect(slot.id)}
              disabled={!isAvailable}
              className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                !isAvailable
                  ? "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed"
                  : isSelected
                  ? "border-blue-500 bg-blue-50 text-blue-700"
                  : "border-gray-300 bg-white text-gray-700 hover:border-gray-400 hover:shadow-sm"
              }`}
            >
              <div>{slot.startTime}</div>
              <div className="text-xs opacity-75">
                {isAvailable ? "Müsait" : "Dolu"}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected time confirmation */}
      {selectedTime && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="text-green-600">✓</div>
            <div className="text-sm text-green-700">
              <strong>Seçilen saat:</strong> {selectedTime} -{" "}
              {timeSlots.find((s) => s.id === selectedTime)?.endTime} (
              {BUSINESS_RULES.APPOINTMENT_DURATION} dakika)
            </div>
          </div>
        </div>
      )}

      {/* No available slots message */}
      {timeSlots.filter((s) => s.available).length === 0 && (
        <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 font-medium">
            Bu tarihte müsait saat bulunmuyor
          </p>
          <p className="text-xs text-yellow-600 mt-1">
            Lütfen farklı bir tarih veya personel seçin
          </p>
        </div>
      )}
    </div>
  );
}

function BookingConfirmation({ bookingData }: { bookingData: BookingData }) {
  return (
    <div className="space-y-4">
      <div className="text-center p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-gray-900">Randevu Özeti</h3>
        <div className="mt-3 space-y-2 text-sm text-gray-600">
          <p>📅 Tarih: {bookingData.date || "Seçilmedi"}</p>
          <p>👤 Personel: {bookingData.staffId || "Seçilmedi"}</p>
          <p>⏰ Saat: {bookingData.timeSlot || "Seçilmedi"}</p>
          <p>⌚ Süre: {BUSINESS_RULES.APPOINTMENT_DURATION} dakika</p>
        </div>
      </div>
      <div className="text-xs text-gray-500 text-center">
        <p>
          • Randevunuzu {BUSINESS_RULES.CANCELLATION_HOURS} saat öncesine kadar
          iptal edebilirsiniz
        </p>
        <p>
          • Randevu tarihinden {BUSINESS_RULES.BOOKING_WINDOW_DAYS} gün öncesine
          kadar rezervasyon yapabilirsiniz
        </p>
      </div>
    </div>
  );
}
