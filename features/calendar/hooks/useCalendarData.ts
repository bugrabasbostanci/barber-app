"use client";

import { useMemo } from 'react';
import { CalendarViewType, CalendarAppointment, CalendarDate, CalendarWeek, CalendarMonth, CalendarDayData, CalendarTimeSlot } from '../types';

// Business rules - can be extracted to config later
const WORKING_HOURS = { start: '09:30', end: '21:30' };
const APPOINTMENT_DURATION = 45; // minutes
const TIME_SLOT_INTERVAL = 15; // minutes
const CLOSED_DAYS = [0]; // Sunday

export function useCalendarData(
  currentDate: Date,
  viewType: CalendarViewType,
  appointments: CalendarAppointment[]
) {
  // Generate time slots for day view
  const generateTimeSlots = useMemo(() => (date: Date): CalendarTimeSlot[] => {
    const slots: CalendarTimeSlot[] = [];
    const [startHour, startMinute] = WORKING_HOURS.start.split(':').map(Number);
    const [endHour, endMinute] = WORKING_HOURS.end.split(':').map(Number);
    
    let currentTime = startHour * 60 + startMinute; // Convert to minutes
    const endTime = endHour * 60 + endMinute;
    
    while (currentTime <= endTime) {
      const hours = Math.floor(currentTime / 60);
      const minutes = currentTime % 60;
      const timeString = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      
      // Check if there's an appointment at this time
      const dateString = date.toISOString().split('T')[0];
      const appointment = appointments.find(apt => 
        apt.date === dateString && apt.startTime === timeString
      );
      
      slots.push({
        time: timeString,
        isAvailable: !appointment || ['CANCELLED', 'NO_SHOW'].includes(appointment.status),
        appointment: appointment
      });
      
      currentTime += TIME_SLOT_INTERVAL;
    }
    
    return slots;
  }, [appointments]);

  // Generate calendar dates for month view
  const generateCalendarMonth = useMemo((): CalendarMonth => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const today = new Date();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Start from the first Sunday of the calendar view
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    // End at the last Saturday of the calendar view
    const endDate = new Date(lastDay);
    endDate.setDate(endDate.getDate() + (6 - lastDay.getDay()));
    
    const weeks: CalendarWeek[] = [];
    let currentWeekStart = new Date(startDate);
    
    while (currentWeekStart <= endDate) {
      const days: CalendarDate[] = [];
      
      for (let i = 0; i < 7; i++) {
        const currentDay = new Date(currentWeekStart);
        currentDay.setDate(currentDay.getDate() + i);
        
        const dateString = currentDay.toISOString().split('T')[0];
        const dayAppointments = appointments.filter(apt => apt.date === dateString);
        
        days.push({
          year: currentDay.getFullYear(),
          month: currentDay.getMonth() + 1,
          day: currentDay.getDate(),
          date: new Date(currentDay),
          isToday: currentDay.toDateString() === today.toDateString(),
          isCurrentMonth: currentDay.getMonth() === month,
          appointments: dayAppointments,
        });
      }
      
      weeks.push({
        days,
        weekNumber: Math.ceil((currentWeekStart.getDate() + firstDay.getDay()) / 7)
      });
      
      currentWeekStart.setDate(currentWeekStart.getDate() + 7);
    }
    
    return {
      year,
      month: month + 1,
      weeks,
      appointments: appointments.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate.getMonth() === month && aptDate.getFullYear() === year;
      })
    };
  }, [currentDate, appointments]);

  // Generate week data
  const generateCalendarWeek = useMemo((): CalendarDate[] => {
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay()); // Start from Sunday
    
    const week: CalendarDate[] = [];
    const today = new Date();
    
    for (let i = 0; i < 7; i++) {
      const dayDate = new Date(startOfWeek);
      dayDate.setDate(startOfWeek.getDate() + i);
      
      const dateString = dayDate.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.date === dateString);
      
      week.push({
        year: dayDate.getFullYear(),
        month: dayDate.getMonth() + 1,
        day: dayDate.getDate(),
        date: new Date(dayDate),
        isToday: dayDate.toDateString() === today.toDateString(),
        isCurrentMonth: dayDate.getMonth() === currentDate.getMonth(),
        appointments: dayAppointments,
      });
    }
    
    return week;
  }, [currentDate, appointments]);

  // Generate day data
  const generateCalendarDay = useMemo((): CalendarDayData => {
    const dateString = currentDate.toISOString().split('T')[0];
    const dayAppointments = appointments.filter(apt => apt.date === dateString);
    const timeSlots = generateTimeSlots(currentDate);
    
    return {
      date: new Date(currentDate),
      timeSlots,
      appointments: dayAppointments,
    };
  }, [currentDate, appointments, generateTimeSlots]);

  // Helper functions
  const isDateClosed = useMemo(() => (date: Date): boolean => {
    return CLOSED_DAYS.includes(date.getDay());
  }, []);

  const getAppointmentsForDate = useMemo(() => (date: Date): CalendarAppointment[] => {
    const dateString = date.toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === dateString);
  }, [appointments]);

  const getAppointmentsCount = useMemo(() => (date: Date): number => {
    return getAppointmentsForDate(date).length;
  }, [getAppointmentsForDate]);

  // Return appropriate data based on view type
  const calendarData = useMemo(() => {
    switch (viewType) {
      case 'day':
        return generateCalendarDay;
      case 'week':
        return generateCalendarWeek;
      case 'month':
        return generateCalendarMonth;
      default:
        return generateCalendarMonth;
    }
  }, [viewType, generateCalendarDay, generateCalendarWeek, generateCalendarMonth]);

  return {
    calendarData,
    monthData: generateCalendarMonth,
    weekData: generateCalendarWeek,
    dayData: generateCalendarDay,
    isDateClosed,
    getAppointmentsForDate,
    getAppointmentsCount,
    generateTimeSlots,
  };
}