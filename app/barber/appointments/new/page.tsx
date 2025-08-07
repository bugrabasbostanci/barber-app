"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, User, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { BUSINESS_RULES } from "@/lib/constants";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";
import { tr } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

export default function NewAppointment() {
  const router = useRouter();

  // Auth check
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/check-role");
        if (!response.ok) {
          router.push("/auth/login");
          return;
        }
        const data = await response.json();
        if (!data.success || data.role !== "BARBER") {
          router.push("/auth/login");
          return;
        }
      } catch (error) {
        console.error("Auth check failed:", error);
        router.push("/auth/login");
      }
    };

    checkAuth();
  }, [router]);

  // Form state
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);

  // Data state
  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<string[]>([]);
  const [loadingTimeSlots, setLoadingTimeSlots] = useState(false);

  // Fetch staff members
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStaff(result.data);
          }
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    };

    fetchStaff();
  }, []);

  // Fetch time slots when date and staff change
  useEffect(() => {
    if (!selectedDate || !selectedStaff) {
      setTimeSlots([]);
      setSelectedTime("");
      return;
    }

    const fetchTimeSlots = async () => {
      setLoadingTimeSlots(true);
      try {
        const dateString = dateToLocalString(selectedDate);
        const response = await fetch(
          `/api/time-slots?date=${dateString}&staffId=${selectedStaff}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setTimeSlots(result.data);
          } else {
            setTimeSlots([]);
          }
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      } finally {
        setLoadingTimeSlots(false);
      }
    };

    fetchTimeSlots();
  }, [selectedDate, selectedStaff]);

  const handleSubmit = async () => {
    if (
      !selectedDate ||
      !selectedStaff ||
      !selectedTime ||
      !customerName ||
      !customerPhone
    ) {
      alert("Lütfen zorunlu alanları doldurun");
      return;
    }

    setIsLoading(true);

    try {
      const dateString = dateToLocalString(selectedDate);
      const response = await fetch("/api/barber/appointments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: dateString,
          staffId: selectedStaff,
          startTime: selectedTime,
          customerType: "new",
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          notes: notes.trim() || undefined,
        }),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Randevu başarıyla oluşturuldu!");
        router.push("/barber/appointments");
      } else {
        alert(result.error || "Randevu oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  // Generate minimum date (today)
  // const getMinDate = () => {
  //   return new Date();
  // };

  // Generate maximum date (7 days from now)
  const getMaxDate = () => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + BUSINESS_RULES.BOOKING_WINDOW_DAYS);
    return maxDate;
  };

  // Check if date is disabled (Sundays and outside booking window)
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = getMaxDate();

    // Disable Sundays (day 0)
    if (date.getDay() === 0) return true;

    // Disable dates before today
    if (date < today) return true;

    // Disable dates after max booking window
    if (date > maxDate) return true;

    return false;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b px-4 sm:px-6 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/barber/dashboard">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-6 h-6 mr-3" />
                Geri
              </Button>
            </Link>
            <div className="ml-6">
              <h1 className="text-xl sm:text-2xl font-bold">
                Yeni Randevu
              </h1>
              <p className="text-sm sm:text-base text-muted-foreground mt-1">
                Manuel olarak randevu oluşturun
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Appointment Details */}
          <div className="space-y-8">
            {/* Appointment Details */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Calendar className="w-5 h-5 mr-2" />
                  Randevu Detayları
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selection */}
                <div>
                  <Label className="text-sm font-medium">Tarih</Label>
                  <div className="mt-2">
                    <Popover open={calendarOpen} onOpenChange={setCalendarOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full h-12 justify-start text-left font-normal",
                            !selectedDate && "text-muted-foreground"
                          )}
                        >
                          <Calendar className="mr-2 h-4 w-4" />
                          {selectedDate ? (
                            formatTurkishDate(dateToLocalString(selectedDate))
                          ) : (
                            <span>Tarih seçin</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => {
                            setSelectedDate(date);
                            setCalendarOpen(false);
                          }}
                          disabled={isDateDisabled}
                          locale={tr}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {/* Staff Selection */}
                <div>
                  <Label className="text-sm font-medium">Berber/Personel</Label>
                  <Select
                    value={selectedStaff}
                    onValueChange={setSelectedStaff}
                  >
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="Personel seçin" />
                    </SelectTrigger>
                    <SelectContent>
                      {staff.length > 0 ? (
                        staff.map((person) => (
                          <SelectItem key={person.id} value={person.id}>
                            {person.firstName} {person.lastName}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem value="loading" disabled>
                          Personel yükleniyor...
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            {selectedDate && selectedStaff && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <Clock className="w-5 h-5 mr-2" />
                    Saat Seçimi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {loadingTimeSlots ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground mx-auto mb-2"></div>
                      <p className="text-muted-foreground">Saatler yükleniyor...</p>
                    </div>
                  ) : timeSlots.length > 0 ? (
                    <div className="grid grid-cols-4 gap-3">
                      {timeSlots.map((time) => (
                        <button
                          key={time}
                          onClick={() => setSelectedTime(time)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                            selectedTime === time
                              ? "border-foreground bg-foreground text-background"
                              : "border-border hover:border-muted-foreground bg-background"
                          }`}
                        >
                          {time}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Bu tarih için uygun saat bulunmuyor
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Customer Information */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <User className="w-5 h-5 mr-2" />
                  Müşteri Bilgileri
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Customer Name */}
                <div>
                  <Label
                    htmlFor="customer-name"
                    className="text-sm font-medium"
                  >
                    Müşteri Adı *
                  </Label>
                  <Input
                    id="customer-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Müşteri adını girin"
                    className="mt-2 h-12"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <Label
                    htmlFor="customer-phone"
                    className="text-sm font-medium"
                  >
                    Telefon Numarası *
                  </Label>
                  <Input
                    id="customer-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="05XX XXX XX XX"
                    className="mt-2 h-12"
                  />
                </div>

                {/* Notes */}
                <div>
                  <Label htmlFor="notes" className="text-sm font-medium">
                    Notlar (İsteğe bağlı)
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Randevu ile ilgili notlar..."
                    className="mt-2 h-24 resize-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 mt-8 pt-6 border-t">
          <Link href="/barber/appointments">
            <Button
              variant="outline"
              className="w-full sm:w-auto bg-transparent"
            >
              İptal
            </Button>
          </Link>
          <Button
            onClick={handleSubmit}
            disabled={isLoading}
            className="w-full sm:w-auto bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200"
          >
            {isLoading ? "Oluşturuluyor..." : "Randevu Oluştur"}
          </Button>
        </div>
      </div>
    </div>
  );
}
