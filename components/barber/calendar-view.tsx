"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from "lucide-react";
import { dateToLocalString } from "@/lib/date-time";
import { cn } from "@/lib/utils";

type ViewType = "day" | "week" | "month";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  customer?: {
    firstName: string;
    lastName: string;
  };
  manualCustomerName?: string;
  staff: {
    firstName: string;
    lastName: string;
  };
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch appointments from API
  useEffect(() => {
    async function fetchAppointments() {
      try {
        // In a real app, you'd fetch appointments based on the current view and date range
        // For now, we'll show empty state since we don't have appointments yet
        setAppointments([]);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [currentDate, viewType]);

  const navigateDate = (direction: "prev" | "next") => {
    if (viewType === "day") {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + (direction === "next" ? 1 : -1));
        return newDate;
      });
    } else if (viewType === "week") {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setDate(prev.getDate() + (direction === "next" ? 7 : -7));
        return newDate;
      });
    } else {
      setCurrentDate((prev) => {
        const newDate = new Date(prev);
        newDate.setMonth(prev.getMonth() + (direction === "next" ? 1 : -1));
        return newDate;
      });
    }
  };

  const getDateTitle = () => {
    if (viewType === "day") {
      return new Intl.DateTimeFormat('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        weekday: 'long'
      }).format(currentDate);
    } else if (viewType === "week") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);
      
      const end = new Date(start);
      end.setDate(start.getDate() + 6);
      
      const startStr = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short' }).format(start);
      const endStr = new Intl.DateTimeFormat('tr-TR', { day: '2-digit', month: 'short', year: 'numeric' }).format(end);
      
      return `${startStr} - ${endStr}`;
    } else {
      return new Intl.DateTimeFormat('tr-TR', {
        month: 'long',
        year: 'numeric'
      }).format(currentDate);
    }
  };

  const getWeekDays = () => {
    const start = new Date(currentDate);
    const day = start.getDay();
    const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
    start.setDate(diff);
    
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(start);
      day.setDate(start.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getAppointmentsForDate = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return appointments.filter((apt) => apt.date === dateStr);
  };

  const timeSlots = [
    "09:30",
    "10:15",
    "11:00",
    "11:45",
    "12:30",
    "13:15",
    "14:00",
    "14:45",
    "15:30",
    "16:15",
    "17:00",
    "17:45",
    "18:30",
    "19:15",
    "20:00",
    "20:45",
  ];

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">Yükleniyor...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("next")}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">{getDateTitle()}</h2>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={viewType === "day" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("day")}
              >
                Gün
              </Button>
              <Button
                variant={viewType === "week" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("week")}
              >
                Hafta
              </Button>
              <Button
                variant={viewType === "month" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewType("month")}
              >
                Ay
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      {viewType === "day" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Günlük Görünüm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {timeSlots.map((timeSlot) => {
                const appointmentsAtTime = getAppointmentsForDate(
                  currentDate
                ).filter((apt) => apt.startTime.substring(0, 5) === timeSlot);

                return (
                  <div
                    key={timeSlot}
                    className="flex items-center gap-4 p-3 border rounded-lg hover:bg-gray-50"
                  >
                    <div className="w-16 text-sm font-medium text-gray-600">
                      {timeSlot}
                    </div>
                    <div className="flex-1">
                      {appointmentsAtTime.length > 0 ? (
                        appointmentsAtTime.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="flex items-center justify-between p-2 bg-blue-50 rounded border-l-4 border-blue-500"
                          >
                            <div>
                              <p className="font-medium">
                                {appointment.customer
                                  ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                  : appointment.manualCustomerName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {appointment.staff.firstName}{" "}
                                {appointment.staff.lastName}
                              </p>
                            </div>
                            <Badge
                              variant={
                                appointment.status === "CONFIRMED"
                                  ? "default"
                                  : appointment.status === "SCHEDULED"
                                  ? "secondary"
                                  : "outline"
                              }
                            >
                              {appointment.status === "CONFIRMED"
                                ? "Onaylandı"
                                : "Planlandı"}
                            </Badge>
                          </div>
                        ))
                      ) : (
                        <div className="text-gray-400 text-sm">Boş</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === "week" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Haftalık Görünüm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-8 gap-1">
              {/* Time column header */}
              <div className="p-2"></div>

              {/* Day headers */}
              {getWeekDays().map((day) => (
                <div key={day.toISOString()} className="p-2 text-center">
                  <div className="text-sm font-medium">
                    {new Intl.DateTimeFormat('tr-TR', { weekday: 'short' }).format(day)}
                  </div>
                  <div
                    className={cn(
                      "text-lg font-bold",
                      dateToLocalString(day) === dateToLocalString(new Date())
                        ? "text-blue-600"
                        : "text-gray-900"
                    )}
                  >
                    {day.getDate().toString().padStart(2, '0')}
                  </div>
                </div>
              ))}

              {/* Time slots and appointments */}
              {timeSlots.map((timeSlot) => (
                <div key={timeSlot} className="contents">
                  <div className="p-2 text-xs text-gray-600 border-r">
                    {timeSlot}
                  </div>
                  {getWeekDays().map((day) => {
                    const dayAppointments = getAppointmentsForDate(day).filter(
                      (apt) => apt.startTime.substring(0, 5) === timeSlot
                    );

                    return (
                      <div
                        key={`${day.toISOString()}-${timeSlot}`}
                        className="p-1 border-r border-b min-h-[60px]"
                      >
                        {dayAppointments.map((appointment) => (
                          <div
                            key={appointment.id}
                            className="text-xs p-1 bg-blue-100 rounded mb-1 hover:bg-blue-200 cursor-pointer"
                          >
                            <div className="font-medium truncate">
                              {appointment.customer
                                ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                : appointment.manualCustomerName}
                            </div>
                            <div className="text-gray-600 truncate">
                              {appointment.staff.firstName}
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {viewType === "month" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Aylık Görünüm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-gray-500">
              Aylık görünüm yakında eklenecek...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
