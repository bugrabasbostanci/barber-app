/**
 * Business rules validation for appointment booking system
 */

import { BUSINESS_RULES } from './constants';
import { BadRequestError } from './errors';

export interface AppointmentData {
  date: string; // YYYY-MM-DD format
  startTime: string; // HH:MM format
  endTime?: string; // HH:MM format (optional, calculated if not provided)
}

/**
 * Validates if the appointment date is not on a closed day (Sunday)
 */
export function validateClosedDays(date: string): void {
  const appointmentDate = new Date(date + 'T00:00:00');
  const dayOfWeek = appointmentDate.getDay();
  
  if (BUSINESS_RULES.CLOSED_DAYS.includes(dayOfWeek)) {
    throw new BadRequestError('Pazar günleri kapalıyız. Lütfen başka bir gün seçin.');
  }
}

/**
 * Validates if the appointment time is within working hours
 */
export function validateWorkingHours(startTime: string, endTime?: string): void {
  const { start, end } = BUSINESS_RULES.WORKING_HOURS;
  
  // Convert time strings to minutes for comparison
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = timeToMinutes(startTime);
  const workingStartMinutes = timeToMinutes(start);
  const workingEndMinutes = timeToMinutes(end);
  
  // Check if start time is within working hours
  if (startMinutes < workingStartMinutes || startMinutes >= workingEndMinutes) {
    throw new BadRequestError(`Çalışma saatlerimiz ${start} - ${end} arasındadır.`);
  }
  
  // If end time is provided, validate it as well
  if (endTime) {
    const endMinutes = timeToMinutes(endTime);
    if (endMinutes > workingEndMinutes) {
      throw new BadRequestError(`Randevu saati çalışma saatlerimiz içinde olmalıdır (${start} - ${end}).`);
    }
  } else {
    // Calculate end time and validate
    const calculatedEndMinutes = startMinutes + BUSINESS_RULES.APPOINTMENT_DURATION;
    if (calculatedEndMinutes > workingEndMinutes) {
      throw new BadRequestError(`Bu saat için randevu alınamaz. Çalışma saatlerimiz ${start} - ${end} arasındadır.`);
    }
  }
}

/**
 * Validates if the appointment is within the booking window
 */
export function validateBookingWindow(date: string): void {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const appointmentDate = new Date(date + 'T00:00:00');
  
  // Check if appointment is in the past
  if (appointmentDate < today) {
    throw new BadRequestError('Geçmiş tarih için randevu alınamaz.');
  }
  
  // Calculate max booking date by counting only working days (skip Sundays)
  const maxBookingDate = new Date(today);
  let workingDaysAdded = 0;
  
  while (workingDaysAdded < BUSINESS_RULES.BOOKING_WINDOW_DAYS) {
    maxBookingDate.setDate(maxBookingDate.getDate() + 1);
    const dayOfWeek = maxBookingDate.getDay();
    
    // If it's not a closed day (Sunday), count it as a working day
    if (!BUSINESS_RULES.CLOSED_DAYS.includes(dayOfWeek)) {
      workingDaysAdded++;
    }
  }
  
  // Check if appointment is beyond booking window
  if (appointmentDate > maxBookingDate) {
    throw new BadRequestError(`En fazla ${BUSINESS_RULES.BOOKING_WINDOW_DAYS} gün öncesinden randevu alabilirsiniz.`);
  }
}

/**
 * Validates appointment duration
 */
export function validateAppointmentDuration(startTime: string, endTime: string): void {
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  const duration = endMinutes - startMinutes;
  
  if (duration !== BUSINESS_RULES.APPOINTMENT_DURATION) {
    throw new BadRequestError(`Randevu süresi ${BUSINESS_RULES.APPOINTMENT_DURATION} dakika olmalıdır.`);
  }
}

/**
 * Validates if appointment is within cancellation window
 */
export function validateCancellationWindow(appointmentDate: string, appointmentTime: string): void {
  const now = new Date();
  const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}:00`);
  const timeDifference = appointmentDateTime.getTime() - now.getTime();
  const hoursDifference = timeDifference / (1000 * 60 * 60);
  
  if (hoursDifference < BUSINESS_RULES.CANCELLATION_HOURS) {
    throw new BadRequestError(`Randevunuz ${BUSINESS_RULES.CANCELLATION_HOURS} saat öncesine kadar iptal edilebilir.`);
  }
}

/**
 * Comprehensive validation for appointment creation
 */
export function validateAppointmentCreation(appointmentData: AppointmentData): void {
  const { date, startTime, endTime } = appointmentData;
  
  // Calculate end time if not provided
  const calculatedEndTime = endTime || calculateEndTime(startTime);
  
  // Run all validations
  validateClosedDays(date);
  validateBookingWindow(date);
  validateWorkingHours(startTime, calculatedEndTime);
  validateAppointmentDuration(startTime, calculatedEndTime);
}

/**
 * Calculate end time based on start time and appointment duration
 */
export function calculateEndTime(startTime: string): string {
  const [hours, minutes] = startTime.split(':').map(Number);
  const totalMinutes = hours * 60 + minutes + BUSINESS_RULES.APPOINTMENT_DURATION;
  
  const endHours = Math.floor(totalMinutes / 60);
  const endMinutes = totalMinutes % 60;
  
  return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
}

/**
 * Validates if a time slot is available for booking (used by frontend)
 */
export function isTimeSlotBookable(date: string, startTime: string): boolean {
  try {
    validateAppointmentCreation({ date, startTime });
    return true;
  } catch {
    return false;
  }
}