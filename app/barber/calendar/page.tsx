"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar,
} from "lucide-react";
import { BarberPageHeader } from "@/components/layouts/barber-page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BUSINESS_RULES } from "@/lib/constants";
import { dateToLocalString, formatTurkishDate } from "@/lib/date-time";

interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
  customer?: {
    firstName: string | null;
    lastName: string | null;
    phone?: string | null;
  } | null;
  staff: {
    firstName: string | null;
    lastName: string | null;
  };
  createdAt: string;
}

interface Staff {
  id: string;
  firstName: string;
  lastName: string;
}

export default function BarberCalendar() {
  // Auth check is handled by BarberLayout

  // State
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch appointments
        const appointmentsResponse = await fetch("/api/barber/appointments");
        if (appointmentsResponse.ok) {
          const appointmentsResult = await appointmentsResponse.json();
          if (
            appointmentsResult.success &&
            Array.isArray(appointmentsResult.data)
          ) {
            setAppointments(appointmentsResult.data);
          }
        }

        // Fetch staff
        const staffResponse = await fetch("/api/staff");
        if (staffResponse.ok) {
          const staffResult = await staffResponse.json();
          if (staffResult.success && Array.isArray(staffResult.data)) {
            setStaff(staffResult.data);
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Generate 45-minute time slots from 09:30 to 21:30
  const generateTimeSlots = () => {
    const slots = [];
    let hours = 9;
    let minutes = 30;

    while (hours < 21 || (hours === 21 && minutes <= 30)) {
      const startTime = `${hours.toString().padStart(2, "0")}:${minutes
        .toString()
        .padStart(2, "0")}`;

      // Calculate end time
      let endMinutes = minutes + BUSINESS_RULES.APPOINTMENT_DURATION;
      let endHours = hours;
      if (endMinutes >= 60) {
        endHours += Math.floor(endMinutes / 60);
        endMinutes = endMinutes % 60;
      }
      const endTime = `${endHours.toString().padStart(2, "0")}:${endMinutes
        .toString()
        .padStart(2, "0")}`;

      slots.push({
        start: startTime,
        end: endTime,
        full: `${startTime} - ${endTime}`,
      });

      // Move to next slot
      minutes += BUSINESS_RULES.APPOINTMENT_DURATION;
      if (minutes >= 60) {
        hours += Math.floor(minutes / 60);
        minutes = minutes % 60;
      }
    }

    return slots;
  };

  const timeSlots = generateTimeSlots();

  // Get appointments for a specific staff and time slot on selected date
  const getAppointmentForSlot = (staffName: string, time: string) => {
    const selectedDateStr = dateToLocalString(selectedDate);

    return appointments.find((apt) => {
      const aptStaffName = `${apt.staff.firstName || ""} ${
        apt.staff.lastName || ""
      }`.trim();
      return (
        aptStaffName === staffName &&
        apt.startTime === time &&
        apt.date === selectedDateStr
      );
    });
  };

  // Format date for display
  const formatDate = (date: Date) => {
    const dateStr = dateToLocalString(date);
    return formatTurkishDate(dateStr);
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

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground mx-auto mb-4"></div>
          <p>Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header - Tablet Optimized */}
      <BarberPageHeader>
        <Link href="/barber/dashboard">
          <Button variant="ghost" size="lg" className="text-base">
            <ArrowLeft className="w-6 h-6 mr-3" />
            Geri
          </Button>
        </Link>
        <div className="ml-6">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Takvim Yönetimi
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Randevu takvimi ve planlama
          </p>
        </div>
        <div className="flex-1 flex justify-end mr-4">
          <Link href="/barber/appointments/new">
            <Button
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 text-base px-3 py-3 sm:px-6 w-auto sm:w-auto"
            >
              <Plus className="w-5 h-5 sm:mr-2" />
              <span className="hidden sm:inline">Yeni Randevu</span>
            </Button>
          </Link>
        </div>
      </BarberPageHeader>

      <div className="p-6">
        {/* Staff Legend - Tablet Friendly */}
        <div className="flex items-center justify-center space-x-8 mb-6">
          {staff.map((staffMember, index) => {
            const legendColorClass = index === 0 
              ? "w-6 h-6 bg-blue-200 dark:bg-blue-600 rounded-full" 
              : "w-6 h-6 bg-green-200 dark:bg-green-600 rounded-full";
            return (
              <div key={staffMember.id} className="flex items-center space-x-3">
                <div className={legendColorClass}></div>
                <span className="text-lg font-medium text-foreground">
                  {staffMember.firstName} {staffMember.lastName}
                </span>
              </div>
            );
          })}
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8 h-14 text-base">
            <TabsTrigger value="daily" className="text-sm sm:text-base py-3">
              <span className="hidden sm:inline">Günlük Görünüm</span>
              <span className="sm:hidden">Günlük</span>
            </TabsTrigger>
            <TabsTrigger value="weekly" className="text-sm sm:text-base py-3">
              <span className="hidden sm:inline">Haftalık Görünüm</span>
              <span className="sm:hidden">Haftalık</span>
            </TabsTrigger>
            <TabsTrigger value="monthly" className="text-sm sm:text-base py-3">
              <span className="hidden sm:inline">Aylık Görünüm</span>
              <span className="sm:hidden">Aylık</span>
            </TabsTrigger>
          </TabsList>

          {/* Daily View */}
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
                      const appointmentsForSlot = staff
                        .map((staffMember) => {
                          const staffName =
                            `${staffMember.firstName} ${staffMember.lastName}`.trim();
                          return {
                            staff: staffMember,
                            appointment: getAppointmentForSlot(
                              staffName,
                              slot.start
                            ),
                          };
                        })
                        .filter((item) => item.appointment);

                      // Skip empty slots for mobile to reduce clutter
                      if (appointmentsForSlot.length === 0) return null;

                      return (
                        <div
                          key={slot.start}
                          className="bg-muted rounded-lg p-4"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="font-semibold text-foreground">
                              {slot.start} - {slot.end}
                            </div>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div className="space-y-2">
                            {appointmentsForSlot.map(
                              ({ staff: staffMember, appointment }, index) => {
                                const customerName = appointment?.customer
                                  ? `${appointment.customer.firstName || ""} ${
                                      appointment.customer.lastName || ""
                                    }`.trim()
                                  : appointment?.manualCustomerName ||
                                    "Bilinmeyen Müşteri";
                                const customerPhone =
                                  appointment?.customer?.phone ||
                                  appointment?.manualCustomerPhone ||
                                  "";
                                const colorClass =
                                  index === 0
                                    ? "bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-200"
                                    : "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-700 dark:text-green-200";
                                const textColorClass =
                                  index === 0
                                    ? "text-blue-800 dark:text-blue-100"
                                    : "text-green-800 dark:text-green-100";
                                const subTextColorClass =
                                  index === 0
                                    ? "text-blue-600 dark:text-blue-300"
                                    : "text-green-600 dark:text-green-300";

                                return (
                                  <div
                                    key={`${staffMember.id}-${slot.start}`}
                                    className={`${colorClass} border-l-4 p-3 rounded`}
                                  >
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-medium">
                                        {staffMember.firstName}{" "}
                                        {staffMember.lastName}
                                      </span>
                                      {customerPhone && (
                                        <span className="text-xs">
                                          {customerPhone}
                                        </span>
                                      )}
                                    </div>
                                    <div
                                      className={`font-semibold ${textColorClass}`}
                                    >
                                      {customerName}
                                    </div>
                                    {appointment?.notes && (
                                      <div
                                        className={`text-sm ${subTextColorClass}`}
                                      >
                                        {appointment.notes}
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* Show message if no appointments */}
                    {timeSlots.every(
                      (slot) =>
                        !staff.some((staffMember) => {
                          const staffName =
                            `${staffMember.firstName} ${staffMember.lastName}`.trim();
                          return getAppointmentForSlot(staffName, slot.start);
                        })
                    ) && (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 mx-auto text-muted-foreground/30 mb-4" />
                        <p className="text-muted-foreground">
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
                    <div className="h-12 flex items-center justify-center font-medium text-muted-foreground border-b border-border">
                      Saat
                    </div>
                    {timeSlots.map((slot) => (
                      <div
                        key={slot.start}
                        className="h-16 flex items-center justify-center text-sm text-muted-foreground border-b border-border"
                      >
                        <div className="text-center">
                          <div className="text-sm text-muted-foreground">
                            {slot.start}
                          </div>
                          {/* <div className="text-sm text-muted-foreground">
                            {slot.end}
                          </div> */}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Staff Columns */}
                  {staff.slice(0, 2).map((staffMember, staffIndex) => {
                    const staffName =
                      `${staffMember.firstName} ${staffMember.lastName}`.trim();
                    
                    // Define static classes for better dark mode support
                    const headerClasses = staffIndex === 0 
                      ? "h-12 flex items-center justify-center font-medium text-foreground border-b border-border bg-blue-50 dark:bg-blue-900/20"
                      : "h-12 flex items-center justify-center font-medium text-foreground border-b border-border bg-green-50 dark:bg-green-900/20";
                    
                    const appointmentBgClasses = staffIndex === 0
                      ? "bg-blue-100 dark:bg-blue-900/30 rounded-md p-2 h-full"
                      : "bg-green-100 dark:bg-green-900/30 rounded-md p-2 h-full";
                    
                    const appointmentTextClasses = staffIndex === 0
                      ? "text-xs font-medium text-blue-900 dark:text-blue-100"
                      : "text-xs font-medium text-green-900 dark:text-green-100";
                    
                    const notesTextClasses = staffIndex === 0
                      ? "text-xs text-blue-700 dark:text-blue-200"
                      : "text-xs text-green-700 dark:text-green-200";

                    return (
                      <div key={staffMember.id} className="space-y-3">
                        <div className={headerClasses}>
                          {staffName}
                        </div>
                        {timeSlots.map((slot) => {
                          const appointment = getAppointmentForSlot(
                            staffName,
                            slot.start
                          );
                          const customerName = appointment?.customer
                            ? `${appointment.customer.firstName || ""} ${
                                appointment.customer.lastName || ""
                              }`.trim()
                            : appointment?.manualCustomerName || "";

                          return (
                            <div
                              key={slot.start}
                              className="h-16 border border-border rounded-lg p-2"
                            >
                              {appointment ? (
                                <div className={appointmentBgClasses}>
                                  <div className={appointmentTextClasses}>
                                    {customerName || "Müşteri"}
                                  </div>
                                  {appointment.notes && (
                                    <div className={notesTextClasses}>
                                      {appointment.notes}
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="h-full bg-muted rounded-md hover:bg-muted/80 cursor-pointer transition-colors"></div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Weekly View */}
          <TabsContent value="weekly">
            <Card>
              <CardContent className="p-4 lg:p-6">
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
                      const dateStr = dateToLocalString(date);
                      const dayAppointments = appointments.filter(
                        (apt) => apt.date === dateStr
                      );

                      return (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-3">
                            <div>
                              <div className="font-semibold text-lg">
                                {date.toLocaleDateString("tr-TR", {
                                  weekday: "long",
                                })}
                              </div>
                              <div className="text-sm text-muted-foreground">
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
                                .map((apt, aptIndex) => {
                                  const staffName = `${
                                    apt.staff.firstName || ""
                                  } ${apt.staff.lastName || ""}`.trim();
                                  const customerName = apt.customer
                                    ? `${apt.customer.firstName || ""} ${
                                        apt.customer.lastName || ""
                                      }`.trim()
                                    : apt.manualCustomerName || "Müşteri";
                                  const staffIndex = staff.findIndex(
                                    (s) =>
                                      `${s.firstName} ${s.lastName}`.trim() ===
                                      staffName
                                  );
                                  const colorClass =
                                    staffIndex === 0
                                      ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-200"
                                      : "bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-200";

                                  return (
                                    <div
                                      key={aptIndex}
                                      className={`p-2 rounded text-xs ${colorClass}`}
                                    >
                                      <div className="font-medium">
                                        {apt.startTime} - {customerName}
                                      </div>
                                    </div>
                                  );
                                })}
                              {dayAppointments.length > 3 && (
                                <div className="text-xs text-muted-foreground text-center">
                                  +{dayAppointments.length - 3} daha fazla
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="text-sm text-muted-foreground text-center py-2">
                              Randevu yok
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Week Grid - V2 Style */}
                <div className="hidden lg:grid lg:grid-cols-8 gap-2">
                  <div className="font-medium text-muted-foreground p-2">
                    Saat
                  </div>
                  {getWeekDates(currentWeek).map((date, index) => (
                    <div
                      key={index}
                      className="text-center p-2 font-medium text-foreground"
                    >
                      <div className="text-sm">
                        {date.toLocaleDateString("tr-TR", { weekday: "short" })}
                      </div>
                      <div className="text-lg">{date.getDate()}</div>
                    </div>
                  ))}

                  {/* Time slots for week view - All 45-minute slots */}
                  {timeSlots.map((slot) => (
                    <div key={slot.start} className="contents">
                      <div className="text-sm text-muted-foreground p-2 border-t">
                        {slot.start}
                      </div>
                      {getWeekDates(currentWeek).map((date, dayIndex) => {
                        const dateStr = dateToLocalString(date);
                        const appointment = appointments.find(
                          (apt) =>
                            apt.date === dateStr && apt.startTime === slot.start
                        );

                        return (
                          <div
                            key={dayIndex}
                            className="h-16 border border-border rounded-lg p-1 border-t"
                          >
                            {appointment
                              ? (() => {
                                  const staffName = `${
                                    appointment.staff.firstName || ""
                                  } ${appointment.staff.lastName || ""}`.trim();
                                  const staffIndex = staff.findIndex(
                                    (s) =>
                                      `${s.firstName} ${s.lastName}`.trim() ===
                                      staffName
                                  );
                                  
                                  const bgClass = staffIndex === 0
                                    ? "bg-blue-100 dark:bg-blue-900/30 rounded-md p-1 h-full"
                                    : "bg-green-100 dark:bg-green-900/30 rounded-md p-1 h-full";
                                  
                                  const textClass = staffIndex === 0
                                    ? "text-xs font-medium text-blue-900 dark:text-blue-100"
                                    : "text-xs font-medium text-green-900 dark:text-green-100";
                                  
                                  const customerName = appointment.customer
                                    ? `${
                                        appointment.customer.firstName || ""
                                      } ${
                                        appointment.customer.lastName || ""
                                      }`.trim()
                                    : appointment.manualCustomerName ||
                                      "Müşteri";

                                  return (
                                    <div className={bgClass}>
                                      <div className={textClass}>
                                        {customerName}
                                      </div>
                                    </div>
                                  );
                                })()
                              : null}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Monthly View */}
          <TabsContent value="monthly">
            <Card>
              <CardContent className="p-4 lg:p-6">
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
                        className="text-center font-bold text-sm text-muted-foreground p-2"
                      >
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {getMonthDays(currentMonth).map((day, index) => {
                      const dayAppointments = day
                        ? appointments.filter(
                            (apt) => apt.date === dateToLocalString(day)
                          )
                        : [];

                      return (
                        <div
                          key={index}
                          className="aspect-square border border-border rounded p-1"
                        >
                          {day && (
                            <>
                              <div className="text-sm font-medium text-foreground mb-1">
                                {day.getDate()}
                              </div>
                              {dayAppointments.length > 0 && (
                                <div className="space-y-1">
                                  {staff.map((staffMember, staffIndex) => {
                                    const staffName =
                                      `${staffMember.firstName} ${staffMember.lastName}`.trim();
                                    const staffAppointments =
                                      dayAppointments.filter((apt) => {
                                        const aptStaffName = `${
                                          apt.staff.firstName || ""
                                        } ${apt.staff.lastName || ""}`.trim();
                                        return aptStaffName === staffName;
                                      });

                                    if (staffAppointments.length === 0)
                                      return null;

                                    const indicatorClass =
                                      staffIndex === 0
                                        ? "w-full h-1 bg-blue-200 dark:bg-blue-600 rounded"
                                        : "w-full h-1 bg-green-200 dark:bg-green-600 rounded";
                                    return (
                                      <div
                                        key={staffMember.id}
                                        className={indicatorClass}
                                      ></div>
                                    );
                                  })}
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend for mobile */}
                  <div className="flex items-center justify-center space-x-4 mt-4 text-xs">
                    {staff.map((staffMember, index) => {
                      const mobileLegendClass =
                        index === 0 
                          ? "w-3 h-1 bg-blue-200 dark:bg-blue-600 rounded mr-1" 
                          : "w-3 h-1 bg-green-200 dark:bg-green-600 rounded mr-1";
                      return (
                        <div key={staffMember.id} className="flex items-center">
                          <div className={mobileLegendClass}></div>
                          <span>
                            {staffMember.firstName} {staffMember.lastName}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Desktop Month Grid - V2 Style */}
                <div className="hidden lg:grid lg:grid-cols-7 gap-2">
                  {/* Day headers */}
                  {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                    (day) => (
                      <div
                        key={day}
                        className="text-center font-medium text-muted-foreground p-2"
                      >
                        {day}
                      </div>
                    )
                  )}

                  {/* Calendar days */}
                  {getMonthDays(currentMonth).map((day, index) => {
                    const dayAppointments = day
                      ? appointments.filter(
                          (apt) => apt.date === dateToLocalString(day)
                        )
                      : [];

                    return (
                      <div
                        key={index}
                        className="h-24 border border-border rounded-lg p-1"
                      >
                        {day && (
                          <>
                            <div className="text-sm font-medium text-foreground mb-1">
                              {day.getDate()}
                            </div>
                            {dayAppointments.length > 0 && (
                              <div className="text-xs bg-primary/10 text-primary rounded px-1 py-0.5 mb-1">
                                {dayAppointments.length} randevu
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
