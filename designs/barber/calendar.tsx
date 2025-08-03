"use client";

import { useState } from "react";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  User,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function BarberCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock appointment data with 45-minute slots
  const appointments = [
    {
      id: 1,
      staff: "Berber",
      customer: "Ahmet Yılmaz",
      time: "09:30",
      endTime: "10:15",
      service: "Saç Kesimi",
      phone: "(555) 123-4567",
    },
    {
      id: 2,
      staff: "Berber",
      customer: "Mehmet Kaya",
      time: "11:00",
      endTime: "11:45",
      service: "Saç + Sakal",
      phone: "(555) 234-5678",
    },
    {
      id: 3,
      staff: "Çalışan",
      customer: "Ali Demir",
      time: "10:15",
      endTime: "11:00",
      service: "Sakal Kesimi",
      phone: "(555) 345-6789",
    },
    {
      id: 4,
      staff: "Çalışan",
      customer: "Can Özkan",
      time: "14:15",
      endTime: "15:00",
      service: "Saç Kesimi",
      phone: "(555) 456-7890",
    },
    {
      id: 5,
      staff: "Berber",
      customer: "Emre Şahin",
      time: "16:00",
      endTime: "16:45",
      service: "Saç + Sakal",
      phone: "(555) 567-8901",
    },
    {
      id: 6,
      staff: "Çalışan",
      customer: "Oğuz Kaya",
      time: "18:30",
      endTime: "19:15",
      service: "Saç Kesimi",
      phone: "(555) 678-9012",
    },
  ];

  // Generate 45-minute time slots from 09:30 to 21:30
  const generateTimeSlots = () => {
    const slots = [];
    const currentTime = new Date();
    currentTime.setHours(9, 30, 0, 0); // Start at 09:30

    const endTime = new Date();
    endTime.setHours(21, 30, 0, 0); // End at 21:30

    while (currentTime < endTime) {
      const timeString = currentTime.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      const endSlotTime = new Date(currentTime.getTime() + 45 * 60000); // Add 45 minutes
      const endTimeString = endSlotTime.toLocaleTimeString("tr-TR", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });

      slots.push({
        start: timeString,
        end: endTimeString,
        full: `${timeString} - ${endTimeString}`,
      });

      currentTime.setTime(currentTime.getTime() + 45 * 60000); // Move to next 45-minute slot
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get appointments for a specific staff and time slot
  const getAppointmentForSlot = (staff: string, time: string) => {
    return appointments.find((apt) => apt.staff === staff && apt.time === time);
  };

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  // Navigate dates
  const navigateDate = (
    direction: "prev" | "next",
    view: "day" | "week" | "month"
  ) => {
    const newDate = new Date();

    if (view === "day") {
      newDate.setTime(selectedDate.getTime());
      newDate.setDate(newDate.getDate() + (direction === "next" ? 1 : -1));
      setSelectedDate(newDate);
    } else if (view === "week") {
      newDate.setTime(currentWeek.getTime());
      newDate.setDate(newDate.getDate() + (direction === "next" ? 7 : -7));
      setCurrentWeek(newDate);
    } else if (view === "month") {
      newDate.setTime(currentMonth.getTime());
      newDate.setMonth(newDate.getMonth() + (direction === "next" ? 1 : -1));
      setCurrentMonth(newDate);
    }
  };

  // Get week dates
  const getWeekDates = (date: Date) => {
    const week = [];
    const startOfWeek = new Date(date);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Monday as first day
    startOfWeek.setDate(diff);

    for (let i = 0; i < 7; i++) {
      const weekDate = new Date(startOfWeek);
      weekDate.setDate(startOfWeek.getDate() + i);
      week.push(weekDate);
    }
    return week;
  };

  // Generate calendar days for month view
  const getMonthDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before the first day of the month
    for (
      let i = 0;
      i < (startingDayOfWeek === 0 ? 6 : startingDayOfWeek - 1);
      i++
    ) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - Tablet Optimized */}
      <header className="bg-white border-b px-6 py-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center">
            <Link href="/barber">
              <Button variant="ghost" size="lg" className="text-base">
                <ArrowLeft className="w-6 h-6 mr-3" />
                Geri
              </Button>
            </Link>
            <div className="ml-6">
              <h1 className="text-2xl font-bold text-gray-900">
                Takvim Yönetimi
              </h1>
              <p className="text-base text-gray-600 mt-1">
                Randevu takvimi ve planlama
              </p>
            </div>
          </div>
          <Button
            size="lg"
            className="bg-black hover:bg-gray-800 text-white text-base px-6 py-3"
          >
            <Plus className="w-5 h-5 mr-2" />
            Yeni Randevu
          </Button>
        </div>
      </header>

      <div className="p-6">
        {/* Staff Legend - Tablet Friendly */}
        <div className="flex items-center justify-center space-x-8 mb-6">
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
            <span className="text-lg font-medium text-gray-900">Berber</span>
          </div>
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 bg-green-500 rounded-full"></div>
            <span className="text-lg font-medium text-gray-900">Çalışan</span>
          </div>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 text-base">
            <TabsTrigger value="daily" className="text-base py-3">
              Günlük Görünüm
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-base py-3">
              Haftalık Görünüm
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-base py-3">
              Aylık Görünüm
            </TabsTrigger>
          </TabsList>

          {/* Daily View - Mobile Optimized */}
          <TabsContent value="daily">
            <Card>
              <CardContent className="p-4 sm:p-8">
                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "day")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="ml-1 sm:ml-2 text-xs sm:text-base">
                      Önceki
                    </span>
                  </Button>
                  <h2 className="text-lg sm:text-2xl font-bold text-center">
                    {formatDate(selectedDate)}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next", "day")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="mr-1 sm:mr-2 text-xs sm:text-base">
                      Sonraki
                    </span>
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                </div>

                {/* Mobile Timeline View */}
                <div className="block lg:hidden">
                  <div className="space-y-3">
                    {timeSlots.map((slot) => {
                      const berberAppointment = getAppointmentForSlot(
                        "Berber",
                        slot.start
                      );
                      const calisanAppointment = getAppointmentForSlot(
                        "Çalışan",
                        slot.start
                      );

                      // Skip empty slots for mobile to reduce clutter
                      if (!berberAppointment && !calisanAppointment)
                        return null;

                      return (
                        <div
                          key={slot.start}
                          className="bg-gray-50 rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-gray-900">
                              {slot.start} - {slot.end}
                            </div>
                            <Clock className="w-4 h-4 text-gray-400" />
                          </div>

                          <div className="space-y-2">
                            {berberAppointment && (
                              <div className="bg-blue-100 border-l-4 border-blue-500 p-3 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-blue-600">
                                    BERBER
                                  </span>
                                  <span className="text-xs text-blue-600">
                                    {berberAppointment.phone}
                                  </span>
                                </div>
                                <div className="font-semibold text-blue-900">
                                  {berberAppointment.customer}
                                </div>
                                <div className="text-sm text-blue-700">
                                  {berberAppointment.service}
                                </div>
                              </div>
                            )}

                            {calisanAppointment && (
                              <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-xs font-medium text-green-600">
                                    ÇALIŞAN
                                  </span>
                                  <span className="text-xs text-green-600">
                                    {calisanAppointment.phone}
                                  </span>
                                </div>
                                <div className="font-semibold text-green-900">
                                  {calisanAppointment.customer}
                                </div>
                                <div className="text-sm text-green-700">
                                  {calisanAppointment.service}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Show message if no appointments */}
                    {timeSlots.every(
                      (slot) =>
                        !getAppointmentForSlot("Berber", slot.start) &&
                        !getAppointmentForSlot("Çalışan", slot.start)
                    ) && (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                        <p className="text-gray-500">
                          Bu gün için randevu bulunmuyor
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Desktop Grid View */}
                <div className="hidden lg:grid lg:grid-cols-3 gap-6">
                  {/* Time Column */}
                  <div className="space-y-3">
                    <div className="h-16 flex items-center justify-center font-bold text-lg text-gray-700 border-b-2 border-gray-300">
                      <Clock className="w-5 h-5 mr-2" />
                      Saat Aralığı
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.start}
                        className="h-20 flex items-center justify-center text-base font-medium text-gray-600 border-b border-gray-200 bg-gray-50 rounded-lg"
                      >
                        <div className="text-center">
                          <div className="font-semibold">{slot.start}</div>
                          <div className="text-sm text-gray-500">
                            {slot.end}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Berber Column */}
                  <div className="space-y-3">
                    <div className="h-12 flex items-center justify-center font-medium text-gray-900 border-b bg-blue-50">
                      Berber
                    </div>
                    {timeSlots.map((slot) => {
                      const appointment = getAppointmentForSlot(
                        "Berber",
                        slot.start
                      );
                      return (
                        <div
                          key={slot.start}
                          className="h-16 border border-gray-200 rounded-lg p-2"
                        >
                          {appointment ? (
                            <div className="bg-blue-100 rounded-md p-2 h-full">
                              <div className="text-xs font-medium text-blue-900">
                                {appointment.customer}
                              </div>
                              <div className="text-xs text-blue-700">
                                {appointment.service}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Çalışan Column */}
                  <div className="space-y-2">
                    <div className="h-12 flex items-center justify-center font-medium text-gray-900 border-b bg-green-50">
                      <User className="w-5 h-5 mr-2" />
                      Çalışan
                    </div>
                    {timeSlots.map((slot) => {
                      const appointment = getAppointmentForSlot(
                        "Çalışan",
                        slot.start
                      );
                      return (
                        <div
                          key={slot.start}
                          className="h-16 border border-gray-200 rounded-lg p-2"
                        >
                          {appointment ? (
                            <div className="bg-green-100 rounded-md p-2 h-full">
                              <div className="text-xs font-medium text-green-900">
                                {appointment.customer}
                              </div>
                              <div className="text-xs text-green-700">
                                {appointment.service}
                              </div>
                            </div>
                          ) : (
                            <div className="h-full bg-gray-50 rounded-md hover:bg-gray-100 cursor-pointer transition-colors"></div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly View - Mobile Optimized */}
          <TabsContent value="weekly">
            <Card>
              <CardContent className="p-4 sm:p-8">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "week")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="ml-1 sm:ml-2 text-xs sm:text-base">
                      Önceki
                    </span>
                  </Button>
                  <h2 className="text-lg sm:text-2xl font-bold text-center">
                    {getWeekDates(currentWeek)[0].toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                    })}{" "}
                    -{" "}
                    {getWeekDates(currentWeek)[6].toLocaleDateString("tr-TR", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next", "week")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="mr-1 sm:mr-2 text-xs sm:text-base">
                      Sonraki
                    </span>
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                </div>

                {/* Mobile Week View - Day by Day */}
                <div className="block lg:hidden">
                  <div className="space-y-4">
                    {getWeekDates(currentWeek).map((date, index) => {
                      const dayAppointments = appointments.filter((apt) => {
                        // Mock filter - in real app you'd filter by actual date
                        return Math.random() > 0.7;
                      });

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">
                                {date.toLocaleDateString("tr-TR", {
                                  weekday: "long",
                                })}
                              </div>
                              <div className="text-sm text-gray-600">
                                {date.toLocaleDateString("tr-TR", {
                                  day: "2-digit",
                                  month: "long",
                                })}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium">
                                {dayAppointments.length} randevu
                              </div>
                            </div>
                          </div>

                          {dayAppointments.length > 0 ? (
                            <div className="space-y-2">
                              {dayAppointments
                                .slice(0, 3)
                                .map((apt, aptIndex) => (
                                  <div
                                    key={aptIndex}
                                    className={`p-2 rounded text-xs ${
                                      apt.staff === "Berber"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-green-100 text-green-800"
                                    }`}
                                  >
                                    <div className="font-medium">
                                      {apt.time} - {apt.customer}
                                    </div>
                                  </div>
                                ))}
                              {dayAppointments.length > 3 && (
                                <div className="text-xs text-gray-500 text-center">
                                  +{dayAppointments.length - 3} daha fazla
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-gray-500 text-center py-2">
                              Randevu yok
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Week Grid */}
                <div className="hidden lg:grid lg:grid-cols-8 gap-3">
                  <div className="font-bold text-lg text-gray-700 p-4 text-center">
                    Saat
                  </div>
                  {getWeekDates(currentWeek).map((date, index) => (
                    <div
                      key={index}
                      className="text-center p-4 font-bold text-gray-900 bg-gray-50 rounded-lg"
                    >
                      <div className="text-sm">
                        {date.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </div>
                      <div className="text-xl mt-1">{date.getDate()}</div>
                    </div>
                  ))}

                  {/* Sample time slots for week view */}
                  {["09:30", "12:00", "15:00", "18:00"].map((time) => (
                    <div key={time} className="contents">
                      <div className="text-base font-medium text-gray-600 p-4 border-t bg-gray-50 rounded-lg text-center">
                        {time}
                      </div>
                      {getWeekDates(currentWeek).map((date, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="h-20 border-2 border-gray-200 rounded-lg p-2"
                        >
                          {Math.random() > 0.6 && (
                            <div
                              className={`${
                                Math.random() > 0.5
                                  ? "bg-blue-500"
                                  : "bg-green-500"
                              } text-white rounded-lg p-2 h-full text-xs font-medium`}
                            >
                              <div>Randevu</div>
                              <div className="opacity-75">45 dk</div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly View - Mobile Optimized */}
          <TabsContent value="monthly">
            <Card>
              <CardContent className="p-4 sm:p-8">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4 sm:mb-8">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "month")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <ChevronLeft className="w-4 h-4 sm:w-6 sm:h-6" />
                    <span className="ml-1 sm:ml-2 text-xs sm:text-base">
                      Önceki
                    </span>
                  </Button>
                  <h2 className="text-lg sm:text-2xl font-bold text-center">
                    {currentMonth.toLocaleDateString("tr-TR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next", "month")}
                    className="bg-transparent px-3 sm:px-6 py-2 sm:py-3"
                  >
                    <span className="mr-1 sm:mr-2 text-xs sm:text-base">
                      Sonraki
                    </span>
                    <ChevronRight className="w-4 h-4 sm:w-6 sm:h-6" />
                  </Button>
                </div>

                {/* Mobile Month View - Simplified */}
                <div className="block lg:hidden">
                  <div className="grid grid-cols-7 gap-1 mb-4">
                    {["P", "S", "Ç", "P", "C", "C", "P"].map((day, index) => (
                      <div
                        key={index}
                        className="text-center font-bold text-sm text-gray-700 p-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getMonthDays(currentMonth).map((day, index) => (
                      <div
                        key={index}
                        className="aspect-square border border-gray-200 rounded p-1"
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium text-gray-900 mb-1">
                              {day.getDate()}
                            </div>
                            {Math.random() > 0.8 && (
                              <div className="space-y-1">
                                <div className="w-full h-1 bg-blue-400 rounded"></div>
                                {Math.random() > 0.5 && (
                                  <div className="w-full h-1 bg-green-400 rounded"></div>
                                )}
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Legend for mobile */}
                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                    <div className="flex items-center">
                      <div className="w-3 h-1 bg-blue-400 rounded mr-1"></div>
                      <span>Berber</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-3 h-1 bg-green-400 rounded mr-1"></div>
                      <span>Çalışan</span>
                    </div>
                  </div>
                </div>

                {/* Desktop Month Grid */}
                <div className="hidden lg:grid lg:grid-cols-7 gap-3">
                  {/* Day headers */}
                  {[
                    "Pazartesi",
                    "Salı",
                    "Çarşamba",
                    "Perşembe",
                    "Cuma",
                    "Cumartesi",
                    "Pazar",
                  ].map((day) => (
                    <div
                      key={day}
                      className="text-center font-bold text-lg text-gray-700 p-4 bg-gray-50 rounded-lg"
                    >
                      {day}
                    </div>
                  ))}

                  {/* Calendar days */}
                  {getMonthDays(currentMonth).map((day, index) => (
                    <div
                      key={index}
                      className="h-32 border-2 border-gray-200 rounded-lg p-3"
                    >
                      {day && (
                        <>
                          <div className="text-lg font-bold text-gray-900 mb-2">
                            {day.getDate()}
                          </div>
                          {Math.random() > 0.7 && (
                            <div className="space-y-1">
                              <div className="text-xs bg-blue-500 text-white rounded px-2 py-1">
                                {Math.floor(Math.random() * 4) + 1} Berber
                              </div>
                              {Math.random() > 0.5 && (
                                <div className="text-xs bg-green-500 text-white rounded px-2 py-1">
                                  {Math.floor(Math.random() * 3) + 1} Çalışan
                                </div>
                              )}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
