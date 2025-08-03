"use client";

import { useState } from "react";
import { ArrowLeft, Calendar, User, Clock, Plus } from "lucide-react";
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
import Link from "next/link";

export default function NewAppointment() {
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [notes, setNotes] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Generate time slots (45-minute intervals from 09:30 to 21:30)
  const generateTimeSlots = () => {
    const slots = [];
    const startTime = new Date();
    startTime.setHours(9, 30, 0, 0);

    const endTime = new Date();
    endTime.setHours(21, 30, 0, 0);

    while (startTime < endTime) {
      const timeString = startTime.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      slots.push(timeString);
      startTime.setTime(startTime.getTime() + 45 * 60000); // Add 45 minutes
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

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

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsLoading(false);
    alert("Randevu başarıyla oluşturuldu!");

    // Reset form
    setSelectedDate("");
    setSelectedStaff("");
    setSelectedTime("");
    setCustomerName("");
    setCustomerPhone("");
    setNotes("");
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      weekday: "long",
    });
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/barber/appointments">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Geri
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-bold">Yeni Randevu</h1>
            </div>
          </div>
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
      </header>

      <div className="p-4">
        <p className="text-gray-600 mb-8">Manuel olarak randevu oluşturun</p>

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
                  <Label htmlFor="date" className="text-sm font-medium">
                    Tarih
                  </Label>
                  <div className="mt-2">
                    <Input
                      id="date"
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="h-12"
                    />
                    {selectedDate && (
                      <p className="text-sm text-gray-600 mt-2">
                        {formatDate(selectedDate)}
                      </p>
                    )}
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
                      <SelectItem value="Berber">Berber</SelectItem>
                      <SelectItem value="Çalışan">Çalışan</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Time Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-lg">
                  <Clock className="w-5 h-5 mr-2" />
                  Saat Seçimi
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-3">
                  {timeSlots.map((time) => (
                    <button
                      key={time}
                      onClick={() => setSelectedTime(time)}
                      className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                        selectedTime === time
                          ? "border-black bg-black text-white"
                          : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
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
            className="w-full sm:w-auto bg-black hover:bg-gray-800"
          >
            {isLoading ? "Oluşturuluyor..." : "Randevu Oluştur"}
          </Button>
        </div>
      </div>
    </div>
  );
}
