/**
 * Business rules utility functions for the barber appointment system
 * Consolidates business logic from lib/business-rules.ts
 */

// Re-export all business rules from existing lib
export * from '@/lib/business-rules';

// Additional business rule utilities
export function isWorkingDay(date: Date): boolean {
  const dayOfWeek = date.getDay();
  // Sunday is 0, we're closed on Sundays
  return dayOfWeek !== 0;
}

export function getNextWorkingDay(date: Date): Date {
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  
  while (!isWorkingDay(nextDay)) {
    nextDay.setDate(nextDay.getDate() + 1);
  }
  
  return nextDay;
}

export function getPreviousWorkingDay(date: Date): Date {
  const prevDay = new Date(date);
  prevDay.setDate(prevDay.getDate() - 1);
  
  while (!isWorkingDay(prevDay)) {
    prevDay.setDate(prevDay.getDate() - 1);
  }
  
  return prevDay;
}

export function getWorkingDaysInRange(startDate: Date, endDate: Date): Date[] {
  const workingDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (isWorkingDay(currentDate)) {
      workingDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return workingDays;
}

export function countWorkingDaysBetween(startDate: Date, endDate: Date): number {
  return getWorkingDaysInRange(startDate, endDate).length;
}

export function isWithinBookingWindow(appointmentDate: Date): boolean {
  try {
    const dateStr = appointmentDate.toISOString().split('T')[0];
    const { validateBookingWindow } = require('@/lib/business-rules');
    validateBookingWindow(dateStr);
    return true;
  } catch {
    return false;
  }
}

export function isWithinWorkingHours(timeStr: string): boolean {
  try {
    const { validateWorkingHours } = require('@/lib/business-rules');
    validateWorkingHours(timeStr);
    return true;
  } catch {
    return false;
  }
}

export function canBookOnDate(date: Date): boolean {
  return isWorkingDay(date) && isWithinBookingWindow(date);
}

export function canBookAtTime(date: Date, timeStr: string): boolean {
  try {
    const dateStr = date.toISOString().split('T')[0];
    const { validateAppointmentCreation } = require('@/lib/business-rules');
    validateAppointmentCreation({ date: dateStr, startTime: timeStr });
    return true;
  } catch {
    return false;
  }
}

export function getEarliestBookableDate(): Date {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  if (isWorkingDay(tomorrow)) {
    return tomorrow;
  }
  
  return getNextWorkingDay(tomorrow);
}

export function getLatestBookableDate(): Date {
  const today = new Date();
  const maxDate = new Date(today);
  
  // Add booking window days (counting only working days)
  let workingDaysAdded = 0;
  while (workingDaysAdded < 7) { // BOOKING_WINDOW_DAYS = 7
    maxDate.setDate(maxDate.getDate() + 1);
    if (isWorkingDay(maxDate)) {
      workingDaysAdded++;
    }
  }
  
  return maxDate;
}

export function getBookableTimeSlots(date: Date): string[] {
  if (!canBookOnDate(date)) {
    return [];
  }
  
  const { generateTimeSlots } = require('@/lib/utils/time-slots');
  const allSlots = generateTimeSlots();
  
  return allSlots
    .map((slot: any) => slot.start)
    .filter((time: string) => isWithinWorkingHours(time));
}

export function formatBusinessHours(): string {
  const { WORKING_HOURS } = require('@/lib/constants');
  return `${WORKING_HOURS.start} - ${WORKING_HOURS.end}`;
}

export function getAppointmentDuration(): number {
  const { APPOINTMENT_DURATION } = require('@/lib/constants');
  return APPOINTMENT_DURATION;
}

export function getCancellationHours(): number {
  const { CANCELLATION_HOURS } = require('@/lib/constants');
  return CANCELLATION_HOURS;
}

export function getBookingWindowDays(): number {
  const { BOOKING_WINDOW_DAYS } = require('@/lib/constants');
  return BOOKING_WINDOW_DAYS;
}