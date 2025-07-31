"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  User,
  Grid3X3,
  List,
  Phone,
  MessageSquare,
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
  notes?: string;
  customer?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>("week");
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [staffMembers, setStaffMembers] = useState<
    Array<{ id: string; firstName: string; lastName: string; role: string }>
  >([]);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch staff members
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch("/api/staff");
        if (response.ok) {
          const staffData = await response.json();
          setStaffMembers(staffData);
        }
      } catch (error) {
        console.error("Error fetching staff:", error);
      }
    }
    fetchStaff();
  }, []);

  // Fetch appointments from API
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);

        // Calculate date range based on view type
        let startDate: string;
        let endDate: string;

        if (viewType === "day") {
          startDate = dateToLocalString(currentDate);
          endDate = dateToLocalString(currentDate);
        } else if (viewType === "week") {
          const start = new Date(currentDate);
          const day = start.getDay();
          const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
          start.setDate(diff);

          const end = new Date(start);
          end.setDate(start.getDate() + 6);

          startDate = dateToLocalString(start);
          endDate = dateToLocalString(end);
        } else {
          // month
          const year = currentDate.getFullYear();
          const month = currentDate.getMonth();

          // Get first and last day of month
          const firstDay = new Date(year, month, 1);
          const lastDay = new Date(year, month + 1, 0);

          startDate = dateToLocalString(firstDay);
          endDate = dateToLocalString(lastDay);
        }

        const response = await fetch(
          `/api/barber/appointments?startDate=${startDate}&endDate=${endDate}`
        );

        if (response.ok) {
          const appointmentsData = await response.json();
          setAppointments(appointmentsData);
        } else {
          console.error("Failed to fetch appointments:", response.statusText);
          setAppointments([]);
        }

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
      return new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        weekday: "long",
      }).format(currentDate);
    } else if (viewType === "week") {
      const start = new Date(currentDate);
      const day = start.getDay();
      const diff = start.getDate() - day + (day === 0 ? -6 : 1); // Monday
      start.setDate(diff);

      const end = new Date(start);
      end.setDate(start.getDate() + 6);

      const startStr = new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
      }).format(start);
      const endStr = new Intl.DateTimeFormat("tr-TR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }).format(end);

      return `${startStr} - ${endStr}`;
    } else {
      return new Intl.DateTimeFormat("tr-TR", {
        month: "long",
        year: "numeric",
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
    const filtered = appointments.filter((apt) => apt.date === dateStr);
    return filtered;
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // Calculate daily capacity for each staff member
  const calculateDayCapacity = (date: Date, staffId?: string) => {
    const dayAppointments = getAppointmentsForDate(date);
    const totalSlots = 16; // 09:30-20:45, 45-minute intervals

    if (staffId) {
      // Individual staff capacity
      const staffAppointments = dayAppointments.filter(
        (apt) => apt.staff.id === staffId
      );
      return {
        occupied: staffAppointments.length,
        total: totalSlots,
        percentage: Math.round((staffAppointments.length / totalSlots) * 100),
      };
    } else {
      // Overall capacity across all staff
      const totalCapacity = totalSlots * staffMembers.length;
      return {
        occupied: dayAppointments.length,
        total: totalCapacity,
        percentage: Math.round((dayAppointments.length / totalCapacity) * 100),
      };
    }
  };

  const getCapacityColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600 bg-red-50";
    if (percentage >= 70) return "text-orange-600 bg-orange-50";
    if (percentage >= 40) return "text-blue-600 bg-blue-50";
    return "text-green-600 bg-green-50";
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
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
            <span className="ml-3 text-muted-foreground">Yükleniyor...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            {/* Navigation and Title */}
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("prev")}
                  className="h-9 w-9 p-0"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigateDate("next")}
                  className="h-9 w-9 p-0 ml-1"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div>
                <h2 className="text-lg font-semibold">{getDateTitle()}</h2>
                <p className="text-sm text-muted-foreground">
                  {appointments.length} randevu
                </p>
              </div>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
              <Button
                variant={viewType === "day" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("day")}
                className="h-8 px-3"
              >
                <List className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Gün</span>
              </Button>
              <Button
                variant={viewType === "week" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("week")}
                className="h-8 px-3"
              >
                <Grid3X3 className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Hafta</span>
              </Button>
              <Button
                variant={viewType === "month" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewType("month")}
                className="h-8 px-3"
              >
                <CalendarIcon className="h-4 w-4 mr-1" />
                <span className="hidden sm:inline">Ay</span>
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Calendar Content */}
      {viewType === "day" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4" />
                Günlük Program
              </CardTitle>
              {staffMembers.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  {staffMembers.map((staff, index) => (
                    <div key={staff.id} className="flex items-center gap-1">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          staff.role === "BARBER"
                            ? "bg-primary"
                            : "bg-secondary"
                        )}
                      />
                      <span>{staff.firstName}</span>
                      {index < staffMembers.length - 1 && (
                        <span className="mx-1">•</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] w-full">
              <div className="divide-y divide-border">
                {/* Header Row */}
                <div className="flex bg-muted/30">
                  <div className="w-16 p-2 flex-shrink-0 border-r">
                    <div className="text-xs font-medium text-center text-muted-foreground">
                      Saat
                    </div>
                  </div>
                  {staffMembers.map((staff) => (
                    <div
                      key={staff.id}
                      className="flex-1 p-2 border-r last:border-r-0"
                    >
                      <div className="text-xs font-medium text-center">
                        <div className="flex items-center justify-center gap-1">
                          <div
                            className={cn(
                              "w-2 h-2 rounded-full",
                              staff.role === "BARBER"
                                ? "bg-primary"
                                : "bg-secondary"
                            )}
                          />
                          {staff.firstName} {staff.lastName}
                        </div>
                        <div className="text-muted-foreground mt-1">
                          {staff.role === "BARBER" ? "Berber" : "Çalışan"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Time Slots */}
                {timeSlots.map((timeSlot) => {
                  return (
                    <div
                      key={timeSlot}
                      className="flex hover:bg-muted/20 transition-colors"
                    >
                      {/* Time Column */}
                      <div className="w-16 p-3 flex-shrink-0 border-r">
                        <div className="text-sm font-medium text-center">
                          {timeSlot}
                        </div>
                      </div>

                      {/* Staff Columns */}
                      {staffMembers.map((staff) => {
                        const staffAppointments = getAppointmentsForDate(
                          currentDate
                        ).filter((apt) => {
                          // Exact match first
                          if (apt.startTime.substring(0, 5) === timeSlot && apt.staff.id === staff.id) {
                            return true;
                          }
                          
                          // Flexible time matching for appointments that don't match exact slots
                          const appointmentTime = apt.startTime.substring(0, 5);
                          const [aptHour, aptMin] = appointmentTime.split(':').map(Number);
                          const [slotHour, slotMin] = timeSlot.split(':').map(Number);
                          
                          const aptMinutes = aptHour * 60 + aptMin;
                          const slotMinutes = slotHour * 60 + slotMin;
                          
                          // Show appointment in the closest time slot (within 30 minutes)
                          const timeDiff = Math.abs(aptMinutes - slotMinutes);
                          return timeDiff <= 30 && apt.staff.id === staff.id;
                        });


                        return (
                          <div
                            key={staff.id}
                            className="flex-1 p-2 border-r last:border-r-0"
                          >
                            {staffAppointments.length > 0 ? (
                              staffAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  onClick={() =>
                                    handleAppointmentClick(appointment)
                                  }
                                  className="flex items-center gap-2 p-2 bg-card border rounded hover:shadow-sm transition-all group cursor-pointer"
                                >
                                  <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="h-3 w-3 text-primary" />
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="font-medium text-sm truncate leading-tight">
                                      {appointment.customer
                                        ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                        : appointment.manualCustomerName}
                                    </p>
                                    {appointment.notes && (
                                      <p className="text-xs text-muted-foreground truncate">
                                        {appointment.notes}
                                      </p>
                                    )}
                                  </div>
                                  <div
                                    className={cn(
                                      "w-2 h-2 rounded-full flex-shrink-0",
                                      appointment.status === "CONFIRMED"
                                        ? "bg-green-500"
                                        : appointment.status === "SCHEDULED"
                                        ? "bg-blue-500"
                                        : "bg-muted-foreground/50"
                                    )}
                                  />
                                </div>
                              ))
                            ) : (
                              <div className="text-center py-2">
                                <div className="text-muted-foreground text-xs">
                                  —
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {viewType === "week" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Grid3X3 className="h-4 w-4" />
              Haftalık Program
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[600px] w-full">
              <div className="overflow-x-auto">
                <div className="min-w-[800px]">
                  <div className="grid grid-cols-8 gap-px bg-border">
                    {/* Time column header */}
                    <div className="bg-background p-3 text-xs font-medium text-muted-foreground">
                      Saat
                    </div>

                    {/* Day headers */}
                    {getWeekDays().map((day) => (
                      <div
                        key={day.toISOString()}
                        className="bg-background p-3 text-center"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {new Intl.DateTimeFormat("tr-TR", {
                            weekday: "short",
                          }).format(day)}
                        </div>
                        <div
                          className={cn(
                            "text-sm font-semibold mt-1",
                            dateToLocalString(day) ===
                              dateToLocalString(new Date())
                              ? "text-primary"
                              : "text-foreground"
                          )}
                        >
                          {day.getDate().toString().padStart(2, "0")}
                        </div>
                      </div>
                    ))}

                    {/* Time slots and appointments */}
                    {timeSlots.map((timeSlot) => (
                      <div key={timeSlot} className="contents">
                        <div className="bg-background p-3 text-xs font-medium text-muted-foreground border-r">
                          {timeSlot}
                        </div>
                        {getWeekDays().map((day) => {
                          const dayAppointments = getAppointmentsForDate(
                            day
                          ).filter((apt) => {
                            // Exact match first
                            if (apt.startTime.substring(0, 5) === timeSlot) {
                              return true;
                            }
                            
                            // Flexible time matching for appointments that don't match exact slots
                            const appointmentTime = apt.startTime.substring(0, 5);
                            const [aptHour, aptMin] = appointmentTime.split(':').map(Number);
                            const [slotHour, slotMin] = timeSlot.split(':').map(Number);
                            
                            const aptMinutes = aptHour * 60 + aptMin;
                            const slotMinutes = slotHour * 60 + slotMin;
                            
                            // Show appointment in the closest time slot (within 30 minutes)
                            const timeDiff = Math.abs(aptMinutes - slotMinutes);
                            return timeDiff <= 30;
                          });


                          return (
                            <div
                              key={`${day.toISOString()}-${timeSlot}`}
                              className="bg-background p-2 min-h-[50px] hover:bg-muted/50 transition-colors"
                            >
                              {dayAppointments.map((appointment) => (
                                <div
                                  key={appointment.id}
                                  onClick={() =>
                                    handleAppointmentClick(appointment)
                                  }
                                  className="text-xs p-2 bg-card border rounded mb-1 hover:shadow-sm cursor-pointer transition-shadow"
                                >
                                  <div className="font-medium truncate text-foreground">
                                    {appointment.customer
                                      ? `${appointment.customer.firstName} ${appointment.customer.lastName}`
                                      : appointment.manualCustomerName}
                                  </div>
                                  <div className="text-muted-foreground truncate">
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
                </div>
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {viewType === "month" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CalendarIcon className="h-4 w-4" />
              Aylık Görünüm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <MonthlyCalendar
              currentDate={currentDate}
              getAppointmentsForDate={getAppointmentsForDate}
              onAppointmentClick={handleAppointmentClick}
              staffMembers={staffMembers}
              calculateDayCapacity={calculateDayCapacity}
              getCapacityColor={getCapacityColor}
            />
          </CardContent>
        </Card>
      )}

      {/* Appointment Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5" />
              Randevu Detayları
            </DialogTitle>
          </DialogHeader>

          {selectedAppointment && (
            <div className="space-y-4">
              {/* Customer Info */}
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {selectedAppointment.customer
                        ? `${selectedAppointment.customer.firstName} ${selectedAppointment.customer.lastName}`
                        : selectedAppointment.manualCustomerName}
                    </h3>
                    <p className="text-sm text-muted-foreground">Müşteri</p>
                  </div>
                </div>

                {/* Customer Phone */}
                <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Telefon</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.customer?.phone ||
                        selectedAppointment.manualCustomerPhone ||
                        "Telefon numarası yok"}
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Appointment Info */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium">Tarih</p>
                    <p className="text-sm text-muted-foreground">
                      {new Intl.DateTimeFormat("tr-TR", {
                        day: "2-digit",
                        month: "long",
                        year: "numeric",
                        weekday: "long",
                      }).format(
                        new Date(selectedAppointment.date + "T00:00:00")
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Saat</p>
                    <p className="text-sm text-muted-foreground">
                      {selectedAppointment.startTime} -{" "}
                      {selectedAppointment.endTime}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm font-medium">Berber</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedAppointment.staff.firstName}{" "}
                    {selectedAppointment.staff.lastName}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Durum</p>
                  <Badge
                    variant={
                      selectedAppointment.status === "CONFIRMED"
                        ? "default"
                        : selectedAppointment.status === "SCHEDULED"
                        ? "secondary"
                        : "outline"
                    }
                    className="mt-1"
                  >
                    {selectedAppointment.status === "CONFIRMED"
                      ? "Onaylandı"
                      : selectedAppointment.status === "SCHEDULED"
                      ? "Planlandı"
                      : selectedAppointment.status === "COMPLETED"
                      ? "Tamamlandı"
                      : selectedAppointment.status === "CANCELLED"
                      ? "İptal Edildi"
                      : "Gelmedi"}
                  </Badge>
                </div>
              </div>

              {/* Notes */}
              {selectedAppointment.notes && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                      <p className="text-sm font-medium">Not</p>
                    </div>
                    <div className="p-3 bg-muted/50 rounded-lg">
                      <p className="text-sm text-muted-foreground">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  </div>
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleModalClose}
                  className="flex-1"
                >
                  Kapat
                </Button>
                {/* Future: Add edit/cancel buttons here */}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Monthly Calendar Component
function MonthlyCalendar({
  currentDate,
  getAppointmentsForDate,
  onAppointmentClick,
  staffMembers,
  calculateDayCapacity,
  getCapacityColor,
}: {
  currentDate: Date;
  getAppointmentsForDate: (date: Date) => Appointment[];
  onAppointmentClick: (appointment: Appointment) => void;
  staffMembers: Array<{
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  }>;
  calculateDayCapacity: (
    date: Date,
    staffId?: string
  ) => { occupied: number; total: number; percentage: number };
  getCapacityColor: (percentage: number) => string;
}) {
  // Get all days in the current month
  const getMonthDays = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    // First day of month
    const firstDay = new Date(year, month, 1);

    // Start from Monday of the week containing first day
    const startDate = new Date(firstDay);
    const dayOfWeek = firstDay.getDay();
    const daysToSubtract = dayOfWeek === 0 ? 6 : dayOfWeek - 1; // Monday = 0
    startDate.setDate(firstDay.getDate() - daysToSubtract);

    // Generate 6 weeks (42 days) to fill the calendar grid
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }

    return days;
  };

  const monthDays = getMonthDays();
  const today = new Date();
  const currentMonth = currentDate.getMonth();

  return (
    <div className="space-y-4">
      {/* Day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-muted-foreground"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 bg-border">
        {monthDays.map((day, index) => {
          const dayAppointments = getAppointmentsForDate(day);
          const isToday = dateToLocalString(day) === dateToLocalString(today);
          const isCurrentMonth = day.getMonth() === currentMonth;

          return (
            <div
              key={index}
              className={cn(
                "min-h-[120px] p-2 bg-background hover:bg-muted/50 transition-colors",
                !isCurrentMonth && "opacity-50",
                isToday && "bg-primary/5 border-2 border-primary/20"
              )}
            >
              {/* Day number */}
              <div
                className={cn(
                  "text-sm font-medium mb-2 h-6 flex items-center justify-center w-6",
                  isCurrentMonth ? "text-foreground" : "text-muted-foreground",
                  isToday && "bg-primary text-primary-foreground rounded-full"
                )}
              >
                {day.getDate()}
              </div>

              {/* Staff Capacity Display */}
              <div className="space-y-1">
                {staffMembers.map((staff) => {
                  const capacity = calculateDayCapacity(day, staff.id);
                  const colorClass = getCapacityColor(capacity.percentage);

                  return (
                    <div
                      key={staff.id}
                      className={cn(
                        "text-xs p-1.5 rounded border flex items-center justify-between",
                        colorClass
                      )}
                    >
                      <div className="flex items-center gap-1">
                        <div
                          className={cn(
                            "w-1.5 h-1.5 rounded-full",
                            staff.role === "BARBER"
                              ? "bg-primary"
                              : "bg-secondary"
                          )}
                        />
                        <span className="font-medium truncate">
                          {staff.firstName}
                        </span>
                      </div>
                      <div className="font-semibold">
                        {capacity.occupied}/{capacity.total}
                      </div>
                    </div>
                  );
                })}

                {/* Total Appointments Indicator */}
                {dayAppointments.length > 0 && (
                  <div
                    className="text-xs text-muted-foreground font-medium px-1 py-0.5 bg-muted/30 rounded cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => {
                      if (dayAppointments.length > 0) {
                        onAppointmentClick(dayAppointments[0]);
                      }
                    }}
                  >
                    {dayAppointments.length} randevu
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="space-y-3 pt-4 border-t">
        {/* Staff Legend */}
        <div className="flex items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-primary rounded-full"></div>
            <span className="text-xs text-muted-foreground">Berber</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-secondary rounded-full"></div>
            <span className="text-xs text-muted-foreground">Çalışan</span>
          </div>
        </div>

        {/* Capacity Legend */}
        <div className="flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-50 border border-green-200 rounded"></div>
            <span className="text-muted-foreground">%0-40</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-50 border border-blue-200 rounded"></div>
            <span className="text-muted-foreground">%40-70</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-orange-50 border border-orange-200 rounded"></div>
            <span className="text-muted-foreground">%70-90</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-50 border border-red-200 rounded"></div>
            <span className="text-muted-foreground">%90+</span>
          </div>
        </div>
      </div>
    </div>
  );
}
