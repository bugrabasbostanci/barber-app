"use client";

import { useMemo } from 'react';
import { BaseAppointment, CreateManualAppointmentData } from '../types';

// Validation error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
}

// Business rules from CLAUDE.md
const BUSINESS_RULES = {
  WORKING_HOURS_START: '09:30',
  WORKING_HOURS_END: '21:30',
  APPOINTMENT_DURATION: 45, // minutes
  CLOSED_DAY: 0, // Sunday (0 = Sunday in JavaScript)
  BOOKING_WINDOW_DAYS: 7,
  CANCELLATION_HOURS: 2,
};

export function useAppointmentValidation() {
  // Validate appointment time
  const validateAppointmentTime = useMemo(() => (
    date: string, 
    startTime: string
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    
    // Validate date format
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      errors.push({
        field: 'date',
        message: 'Geçerli bir tarih girin',
        code: 'INVALID_DATE_FORMAT'
      });
      return { isValid: false, errors };
    }
    
    // Check if date is Sunday
    if (appointmentDate.getDay() === BUSINESS_RULES.CLOSED_DAY) {
      errors.push({
        field: 'date',
        message: 'Pazar günü randevu verilemez',
        code: 'CLOSED_ON_SUNDAY'
      });
    }
    
    // Check if date is in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    appointmentDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate < today) {
      errors.push({
        field: 'date',
        message: 'Geçmiş tarih için randevu verilemez',
        code: 'PAST_DATE'
      });
    }
    
    // Check booking window (7 days in advance)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + BUSINESS_RULES.BOOKING_WINDOW_DAYS);
    maxDate.setHours(0, 0, 0, 0);
    
    if (appointmentDate > maxDate) {
      errors.push({
        field: 'date',
        message: `En fazla ${BUSINESS_RULES.BOOKING_WINDOW_DAYS} gün önceden randevu alınabilir`,
        code: 'BOOKING_WINDOW_EXCEEDED'
      });
    }
    
    // Validate time format (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      errors.push({
        field: 'startTime',
        message: 'Geçerli bir saat girin (HH:MM)',
        code: 'INVALID_TIME_FORMAT'
      });
      return { isValid: errors.length === 0, errors };
    }
    
    // Check working hours
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const workingStartMinutes = 9 * 60 + 30; // 09:30
    const workingEndMinutes = 21 * 60 + 30; // 21:30
    
    if (startMinutes < workingStartMinutes || startMinutes > workingEndMinutes) {
      errors.push({
        field: 'startTime',
        message: `Çalışma saatleri: ${BUSINESS_RULES.WORKING_HOURS_START} - ${BUSINESS_RULES.WORKING_HOURS_END}`,
        code: 'OUTSIDE_WORKING_HOURS'
      });
    }
    
    // Check if appointment time is in the past for today's appointments
    const now = new Date();
    const appointmentDateTime = new Date(`${date}T${startTime}`);
    
    if (appointmentDate.getTime() === today.getTime() && appointmentDateTime <= now) {
      errors.push({
        field: 'startTime',
        message: 'Geçmiş saat için randevu verilemez',
        code: 'PAST_TIME'
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }, []);

  // Validate manual appointment creation
  const validateManualAppointment = useMemo(() => (
    data: CreateManualAppointmentData
  ): ValidationResult => {
    const errors: ValidationError[] = [];
    
    // Validate basic appointment time
    const timeValidation = validateAppointmentTime(data.date, data.startTime);
    errors.push(...timeValidation.errors);
    
    // Validate customer information
    if (data.customerType === 'new') {
      if (!data.customerName?.trim()) {
        errors.push({
          field: 'customerName',
          message: 'Müşteri adı gereklidir',
          code: 'CUSTOMER_NAME_REQUIRED'
        });
      }
      
      if (!data.customerPhone?.trim()) {
        errors.push({
          field: 'customerPhone',
          message: 'Müşteri telefonu gereklidir',
          code: 'CUSTOMER_PHONE_REQUIRED'
        });
      } else if (!/^[0-9+\-\s()]{10,}$/.test(data.customerPhone.trim())) {
        errors.push({
          field: 'customerPhone',
          message: 'Geçerli bir telefon numarası girin',
          code: 'INVALID_PHONE_FORMAT'
        });
      }
    } else if (data.customerType === 'existing') {
      if (!data.existingCustomerId) {
        errors.push({
          field: 'existingCustomerId',
          message: 'Müşteri seçimi gereklidir',
          code: 'EXISTING_CUSTOMER_REQUIRED'
        });
      }
    }
    
    // Validate staff
    if (!data.staffId) {
      errors.push({
        field: 'staffId',
        message: 'Personel seçimi gereklidir',
        code: 'STAFF_REQUIRED'
      });
    }
    
    return { isValid: errors.length === 0, errors };
  }, [validateAppointmentTime]);

  // Check if appointment can be cancelled
  const canCancelAppointment = useMemo(() => (
    appointment: BaseAppointment
  ): { canCancel: boolean; reason?: string } => {
    // Check status
    if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
      return {
        canCancel: false,
        reason: 'Bu durumda olan randevular iptal edilemez'
      };
    }
    
    // Check time constraint (2 hours before)
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const hoursUntilAppointment = (appointmentDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);
    
    if (hoursUntilAppointment < BUSINESS_RULES.CANCELLATION_HOURS) {
      return {
        canCancel: false,
        reason: `Randevu saatinden en az ${BUSINESS_RULES.CANCELLATION_HOURS} saat önce iptal edilmelidir`
      };
    }
    
    return { canCancel: true };
  }, []);

  // Check if time slot is available (helper for avoiding double booking)
  const isTimeSlotValid = useMemo(() => (
    date: string,
    startTime: string,
    existingAppointments: BaseAppointment[] = [],
    excludeAppointmentId?: string
  ): { isValid: boolean; reason?: string } => {
    // First check basic time validation
    const timeValidation = validateAppointmentTime(date, startTime);
    if (!timeValidation.isValid) {
      return {
        isValid: false,
        reason: timeValidation.errors[0]?.message
      };
    }
    
    // Calculate end time
    const [hours, minutes] = startTime.split(':').map(Number);
    const startMinutes = hours * 60 + minutes;
    const endMinutes = startMinutes + BUSINESS_RULES.APPOINTMENT_DURATION;
    const endHours = Math.floor(endMinutes / 60);
    const endMins = endMinutes % 60;
    const endTime = `${endHours.toString().padStart(2, '0')}:${endMins.toString().padStart(2, '0')}`;
    
    // Check for conflicts with existing appointments
    const conflictingAppointment = existingAppointments.find(apt => {
      // Skip self if updating
      if (excludeAppointmentId && apt.id === excludeAppointmentId) return false;
      
      // Skip if different date
      if (apt.date !== date) return false;
      
      // Skip if cancelled or no-show (these slots are available for new bookings)
      if (['CANCELLED', 'NO_SHOW'].includes(apt.status)) return false;
      
      // Check time overlap
      const aptStartMinutes = apt.startTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      const aptEndMinutes = apt.endTime.split(':').map(Number).reduce((h, m) => h * 60 + m);
      
      // Check if times overlap
      return (startMinutes < aptEndMinutes && endMinutes > aptStartMinutes);
    });
    
    if (conflictingAppointment) {
      return {
        isValid: false,
        reason: `Bu saatte başka bir randevu var (${conflictingAppointment.startTime} - ${conflictingAppointment.endTime})`
      };
    }
    
    return { isValid: true };
  }, [validateAppointmentTime]);

  return {
    validateAppointmentTime,
    validateManualAppointment,
    canCancelAppointment,
    isTimeSlotValid,
    BUSINESS_RULES,
  };
}