"use client";

import { useState, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AppointmentCalendarSkeleton } from "@/components/skeletons/appointment-calendar-skeleton";
import { CalendarHeader } from "./components/calendar-header";
import { StaffLegend } from "./components/staff-legend";
import { AppointmentModal } from "./components/appointment-modal";
import { DailyView } from "./components/daily-view";
import { WeeklyView } from "./components/weekly-view";
import { MonthlyView } from "./components/monthly-view";
import { generateTimeSlots } from "@/lib/utils/dates/time-slots";
import { useAuthCheck } from "@/lib/hooks/use-auth-check";

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
  useAuthCheck();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeek, setCurrentWeek] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
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

  const timeSlots = generateTimeSlots();

  const handleAppointmentClick = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  if (loading) {
    return <AppointmentCalendarSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <CalendarHeader />

      <div className="p-6">
        <StaffLegend staff={staff} />

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

          <TabsContent value="daily">
            <DailyView
              selectedDate={selectedDate}
              onDateChange={setSelectedDate}
              appointments={appointments}
              staff={staff}
              timeSlots={timeSlots}
              onAppointmentClick={handleAppointmentClick}
            />
          </TabsContent>

          <TabsContent value="weekly">
            <WeeklyView
              currentWeek={currentWeek}
              onWeekChange={setCurrentWeek}
              appointments={appointments}
              staff={staff}
              timeSlots={timeSlots}
            />
          </TabsContent>

          <TabsContent value="monthly">
            <MonthlyView
              currentMonth={currentMonth}
              onMonthChange={setCurrentMonth}
              appointments={appointments}
              staff={staff}
            />
          </TabsContent>
        </Tabs>
      </div>

      <AppointmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        appointment={selectedAppointment}
      />
    </div>
  );
}
