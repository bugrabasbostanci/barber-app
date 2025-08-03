"use client";

import { useState } from "react";
import { ArrowLeft, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";

export default function BarberCalendar() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Mock appointment data
  const appointments = [
    {
      id: 1,
      staff: "Berber",
      customer: "Ahmet Yılmaz",
      time: "10:00",
      duration: 45,
      service: "Saç Kesimi",
      phone: "(555) 123-4567",
    },
    {
      id: 2,
      staff: "Berber",
      customer: "Mehmet Kaya",
      time: "11:30",
      duration: 45,
      service: "Saç + Sakal",
      phone: "(555) 234-5678",
    },
    {
      id: 3,
      staff: "Çalışan",
      customer: "Ali Demir",
      time: "09:30",
      duration: 45,
      service: "Sakal Kesimi",
      phone: "(555) 345-6789",
    },
    {
      id: 4,
      staff: "Çalışan",
      customer: "Can Özkan",
      time: "14:15",
      duration: 45,
      service: "Saç Kesimi",
      phone: "(555) 456-7890",
    },
    {
      id: 5,
      staff: "Berber",
      customer: "Emre Şahin",
      time: "16:00",
      duration: 45,
      service: "Saç + Sakal",
      phone: "(555) 567-8901",
    },
  ];

  // Generate time slots from 09:30 to 21:30 in 15-minute intervals
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 9; hour <= 21; hour++) {
      for (let minute = 0; minute < 60; minute += 15) {
        if (hour === 9 && minute < 30) continue; // Start from 09:30
        if (hour === 21 && minute > 30) break; // End at 21:30

        const timeString = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(timeString);
      }
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
      {/* Header */}
      <header className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link href="/barber">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-5 h-5 mr-2" />
                Geri
              </Button>
            </Link>
            <div className="ml-4">
              <h1 className="text-xl font-bold text-gray-900">Takvim</h1>
              <p className="text-sm text-gray-600">
                Randevu takvimi ve planlama
              </p>
            </div>
          </div>
          <Button className="bg-black hover:bg-gray-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            Yeni Randevu
          </Button>
        </div>
      </header>

      <div className="p-6">
        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="daily">Günlük</TabsTrigger>
            <TabsTrigger value="weekly">Haftalık</TabsTrigger>
            <TabsTrigger value="monthly">Aylık</TabsTrigger>
          </TabsList>

          {/* Daily View */}
          <TabsContent value="daily">
            <Card>
              <CardContent className="p-6">
                {/* Date Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "day")}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {formatDate(selectedDate)}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next", "day")}
                    className="bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-3 gap-4">
                  {/* Time Column */}
                  <div className="space-y-2">
                    <div className="h-12 flex items-center justify-center font-medium text-gray-600 border-b">
                      Saat
                    </div>
                    {timeSlots.map((time) => (
                      <div
                        key={time}
                        className="h-16 flex items-center justify-center text-sm text-gray-500 border-b border-gray-100"
                      >
                        {time}
                      </div>
                    ))}
                  </div>

                  {/* Berber Column */}
                  <div className="space-y-2">
                    <div className="h-12 flex items-center justify-center font-medium text-gray-900 border-b bg-blue-50">
                      Berber
                    </div>
                    {timeSlots.map((time) => {
                      const appointment = getAppointmentForSlot("Berber", time);
                      return (
                        <div
                          key={time}
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
                      Çalışan
                    </div>
                    {timeSlots.map((time) => {
                      const appointment = getAppointmentForSlot(
                        "Çalışan",
                        time
                      );
                      return (
                        <div
                          key={time}
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

          {/* Weekly View */}
          <TabsContent value="weekly">
            <Card>
              <CardContent className="p-6">
                {/* Week Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "week")}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
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
                    className="bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Week Grid */}
                <div className="grid grid-cols-8 gap-2">
                  <div className="font-medium text-gray-600 p-2">Saat</div>
                  {getWeekDates(currentWeek).map((date, index) => (
                    <div
                      key={index}
                      className="text-center p-2 font-medium text-gray-900"
                    >
                      <div className="text-sm">
                        {date.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </div>
                      <div className="text-lg">{date.getDate()}</div>
                    </div>
                  ))}

                  {/* Sample time slots for week view */}
                  {["09:30", "12:00", "15:00", "18:00"].map((time) => (
                    <div key={time} className="contents">
                      <div className="text-sm text-gray-500 p-2 border-t">
                        {time}
                      </div>
                      {getWeekDates(currentWeek).map((date, dayIndex) => (
                        <div
                          key={dayIndex}
                          className="h-16 border border-gray-200 rounded-lg p-1 border-t"
                        >
                          {Math.random() > 0.7 && (
                            <div className="bg-blue-100 rounded-md p-1 h-full">
                              <div className="text-xs font-medium text-blue-900">
                                Randevu
                              </div>
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

          {/* Monthly View */}
          <TabsContent value="monthly">
            <Card>
              <CardContent className="p-6">
                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-6">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("prev", "month")}
                    className="bg-transparent"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <h2 className="text-lg font-semibold">
                    {currentMonth.toLocaleDateString("tr-TR", {
                      month: "long",
                      year: "numeric",
                    })}
                  </h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigateDate("next", "month")}
                    className="bg-transparent"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>

                {/* Month Grid */}
                <div className="grid grid-cols-7 gap-2">
                  {/* Day headers */}
                  {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-gray-600 p-2"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar days */}
                  {getMonthDays(currentMonth).map((day, index) => (
                    <div
                      key={index}
                      className="h-24 border border-gray-200 rounded-lg p-1"
                    >
                      {day && (
                        <>
                          <div className="text-sm font-medium text-gray-900 mb-1">
                            {day.getDate()}
                          </div>
                          {Math.random() > 0.8 && (
                            <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-1">
                              {Math.floor(Math.random() * 8) + 1} randevu
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
