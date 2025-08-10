"use client";

import { useMemo } from "react";
import { CalendarAppointment } from "../types";
import { useCalendarNavigation } from "../hooks/useCalendarNavigation";
import { useCalendarData } from "../hooks/useCalendarData";
import { useCalendarState } from "../hooks/useCalendarState";
import { CalendarHeader } from "./CalendarHeader";
import { DayView } from "./DayView";
import { WeekView } from "./WeekView";
import { MonthView } from "./MonthView";

interface CalendarContainerProps {
  appointments: CalendarAppointment[];
  onAppointmentClick?: (appointment: CalendarAppointment) => void;
  onCreateAppointment?: (date: Date, time?: string) => void;
  className?: string;
}

export function CalendarContainer({
  appointments = [],
  onAppointmentClick,
  onCreateAppointment,
  className = ""
}: CalendarContainerProps) {
  // Navigation state
  const navigation = useCalendarNavigation();
  const { currentDate, viewType } = navigation;

  // Calendar data
  const {
    calendarData,
    monthData,
    weekData,
    dayData,
    getAppointmentsCount
  } = useCalendarData(currentDate, viewType, appointments);

  // Calendar state management
  const {
    selectedDate,
    handleDateSelect,
    isLoading
  } = useCalendarState();

  // Generate title based on view type and current date
  const title = useMemo(() => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long'
    };

    if (viewType === 'day') {
      return currentDate.toLocaleDateString('tr-TR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }

    if (viewType === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay());
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return weekStart.toLocaleDateString('tr-TR', options);
      } else {
        return `${weekStart.toLocaleDateString('tr-TR', { month: 'long' })} - ${weekEnd.toLocaleDateString('tr-TR', options)}`;
      }
    }

    return currentDate.toLocaleDateString('tr-TR', options);
  }, [currentDate, viewType]);

  // Calculate appointment count for current view
  const appointmentCount = useMemo(() => {
    if (viewType === 'day') {
      return getAppointmentsCount(currentDate);
    }
    
    if (viewType === 'week') {
      return weekData.reduce((total, day) => total + day.appointments.length, 0);
    }
    
    return monthData.appointments.length;
  }, [viewType, currentDate, getAppointmentsCount, weekData, monthData.appointments.length]);

  // Handle date click for month/week view
  const handleDateClick = (date: Date) => {
    handleDateSelect(date);
    onCreateAppointment?.(date);
  };

  // Handle create appointment with time
  const handleCreateAppointmentWithTime = (date: Date, time: string) => {
    onCreateAppointment?.(date, time);
  };

  return (
    <div className={`flex flex-col h-full ${className}`}>
      {/* Calendar Header */}
      <CalendarHeader
        navigation={navigation}
        title={title}
        appointmentCount={appointmentCount}
      />

      {/* Calendar Content */}
      <div className="flex-1 p-4">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2" />
              <p className="text-muted-foreground">Yükleniyor...</p>
            </div>
          </div>
        ) : (
          <>
            {viewType === 'day' && (
              <DayView
                dayData={dayData}
                onAppointmentClick={onAppointmentClick}
                onCreateAppointment={handleCreateAppointmentWithTime}
              />
            )}

            {viewType === 'week' && (
              <WeekView
                weekData={weekData}
                onAppointmentClick={onAppointmentClick}
                onCreateAppointment={handleDateClick}
              />
            )}

            {viewType === 'month' && (
              <MonthView
                monthData={monthData}
                onDateClick={handleDateClick}
                onAppointmentClick={onAppointmentClick}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}