"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Save,
} from "lucide-react";
import { formatTurkishDate, dateToLocalString } from "@/lib/date-time";
import { cn } from "@/lib/utils";
import { BUSINESS_RULES } from "@/lib/constants";

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

export function ManualAppointmentForm() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState<string>();
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form data for manual customer
  const [formData, setFormData] = useState({
    customerName: "",
    customerPhone: "",
    notes: "",
  });

  const [staff, setStaff] = useState<Staff[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);

  // Fetch staff members
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setStaff(result.data);
          } else {
            console.error("Failed to fetch staff:", result.error);
          }
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    }

    fetchStaff();
  }, []);

  // Fetch available time slots
  useEffect(() => {
    if (!selectedDate || !selectedStaff) {
      setTimeSlots([]);
      setSelectedTime(undefined);
      return;
    }

    async function fetchTimeSlots() {
      try {
        const dateStr = dateToLocalString(selectedDate!);
        const response = await fetch(
          `/api/time-slots?date=${dateStr}&staffId=${selectedStaff}`
        );

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            const slots: TimeSlot[] = result.data.map((time: string) => ({
              time,
              available: true,
            }));
            setTimeSlots(slots);
          } else {
            console.error("Failed to fetch time slots:", result.error);
            setTimeSlots([]);
          }
        }
      } catch (error) {
        console.error("Error fetching time slots:", error);
        setTimeSlots([]);
      }
    }

    fetchTimeSlots();
  }, [selectedDate, selectedStaff]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!selectedDate || !selectedTime || !selectedStaff) {
      alert("Lütfen tarih, saat ve personel seçiniz.");
      return;
    }

    if (!formData.customerName.trim() || !formData.customerPhone.trim()) {
      alert("Lütfen müşteri adı ve telefon numarasını giriniz.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/barber/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateToLocalString(selectedDate!),
          staffId: selectedStaff,
          startTime: selectedTime,
          customerType: 'new',
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          notes: formData.notes.trim() || undefined
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert("Randevu başarıyla oluşturuldu!");
        router.push("/barber/appointments");
      } else {
        alert(result.error || "Randevu oluşturulurken bir hata oluştu.");
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Date validation
  const isDateDisabled = (date: Date) => {
    const today = new Date();
    const maxDate = new Date(today);
    maxDate.setDate(today.getDate() + BUSINESS_RULES.BOOKING_WINDOW_DAYS);
    const isSunday = date.getDay() === 0;

    return date < today || date > maxDate || isSunday;
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Date, Time, Staff */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarIcon className="h-5 w-5" />
                Randevu Detayları
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <Label>Tarih</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? (
                        formatTurkishDate(dateToLocalString(selectedDate))
                      ) : (
                        <span>Tarih seçin</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      disabled={isDateDisabled}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Staff Selection */}
              <div className="space-y-2">
                <Label>Berber/Personel</Label>
                <Select value={selectedStaff} onValueChange={setSelectedStaff}>
                  <SelectTrigger>
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
                      <div className="px-2 py-1.5 text-sm text-muted-foreground">
                        Personel yükleniyor...
                      </div>
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
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Saat Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-2">
                  {timeSlots.map((slot) => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={
                        selectedTime === slot.time ? "default" : "outline"
                      }
                      size="sm"
                      disabled={!slot.available}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time}
                    </Button>
                  ))}
                </div>
                {timeSlots.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">
                    Uygun saat bulunmuyor
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Customer Information */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Müşteri Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customerName">Müşteri Adı *</Label>
                <Input
                  id="customerName"
                  value={formData.customerName}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerName: e.target.value,
                    }))
                  }
                  placeholder="Müşteri adını girin"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon Numarası *</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      customerPhone: e.target.value,
                    }))
                  }
                  placeholder="05XX XXX XX XX"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notlar (İsteğe bağlı)</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Randevu ile ilgili notlar..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          {selectedDate && selectedTime && selectedStaff && formData.customerName && (
            <Card>
              <CardHeader>
                <CardTitle>Randevu Özeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarih:</span>
                  <span className="font-medium">
                    {formatTurkishDate(dateToLocalString(selectedDate))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Saat:</span>
                  <span className="font-medium">
                    {selectedTime} -{" "}
                    {(() => {
                      const endTime = new Date(`2000-01-01T${selectedTime}:00`);
                      endTime.setMinutes(endTime.getMinutes() + 45);
                      return endTime.toTimeString().slice(0, 5);
                    })()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Berber:</span>
                  <span className="font-medium">
                    {staff.find((s) => s.id === selectedStaff)?.firstName}{" "}
                    {staff.find((s) => s.id === selectedStaff)?.lastName}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Müşteri:</span>
                  <span className="font-medium">{formData.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Süre:</span>
                  <span className="font-medium">
                    {BUSINESS_RULES.APPOINTMENT_DURATION} dakika
                  </span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          İptal
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          <Save className="h-4 w-4 mr-2" />
          {isSubmitting ? "Oluşturuluyor..." : "Randevu Oluştur"}
        </Button>
      </div>
    </form>
  );
}