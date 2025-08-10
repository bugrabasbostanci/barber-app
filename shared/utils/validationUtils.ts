/**
 * Validation utility functions for the barber appointment system
 */

import { z } from 'zod';
import { isValidEmail, isValidTurkishPhone } from './stringUtils';

// Common validation schemas
export const emailSchema = z.string().email('Geçerli bir email adresi giriniz');
export const phoneSchema = z.string().refine(isValidTurkishPhone, 'Geçerli bir telefon numarası giriniz');
export const nameSchema = z.string().min(2, 'İsim en az 2 karakter olmalıdır').max(50, 'İsim en fazla 50 karakter olabilir');
export const passwordSchema = z.string().min(6, 'Şifre en az 6 karakter olmalıdır');

// Turkish ID validation
export function isValidTurkishId(id: string): boolean {
  if (!id || id.length !== 11) return false;
  
  const digits = id.split('').map(Number);
  
  // All digits cannot be the same
  if (digits.every(digit => digit === digits[0])) return false;
  
  // Check the algorithm
  const oddSum = digits[0] + digits[2] + digits[4] + digits[6] + digits[8];
  const evenSum = digits[1] + digits[3] + digits[5] + digits[7];
  
  const check1 = (oddSum * 7 - evenSum) % 10;
  const check2 = (oddSum + evenSum + digits[9]) % 10;
  
  return check1 === digits[9] && check2 === digits[10];
}

// Date validation
export function isValidDate(dateStr: string): boolean {
  const date = new Date(dateStr);
  return date instanceof Date && !isNaN(date.getTime());
}

export function isDateInFuture(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date > today;
}

export function isDateInPast(dateStr: string): boolean {
  const date = new Date(dateStr);
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  return date < today;
}

// Time validation
export function isValidTime(timeStr: string): boolean {
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  return timeRegex.test(timeStr);
}

export function isTimeInRange(timeStr: string, startTime: string, endTime: string): boolean {
  if (!isValidTime(timeStr) || !isValidTime(startTime) || !isValidTime(endTime)) {
    return false;
  }
  
  const timeToMinutes = (time: string): number => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };
  
  const timeMinutes = timeToMinutes(timeStr);
  const startMinutes = timeToMinutes(startTime);
  const endMinutes = timeToMinutes(endTime);
  
  return timeMinutes >= startMinutes && timeMinutes <= endMinutes;
}

// Form validation helpers
export interface ValidationError {
  field: string;
  message: string;
}

export function validateRequired(value: any, fieldName: string): ValidationError | null {
  if (value === undefined || value === null || value === '') {
    return {
      field: fieldName,
      message: `${fieldName} alanı gereklidir`
    };
  }
  return null;
}

export function validateMinLength(value: string, minLength: number, fieldName: string): ValidationError | null {
  if (value && value.length < minLength) {
    return {
      field: fieldName,
      message: `${fieldName} en az ${minLength} karakter olmalıdır`
    };
  }
  return null;
}

export function validateMaxLength(value: string, maxLength: number, fieldName: string): ValidationError | null {
  if (value && value.length > maxLength) {
    return {
      field: fieldName,
      message: `${fieldName} en fazla ${maxLength} karakter olabilir`
    };
  }
  return null;
}

export function validateEmail(email: string): ValidationError | null {
  if (email && !isValidEmail(email)) {
    return {
      field: 'email',
      message: 'Geçerli bir email adresi giriniz'
    };
  }
  return null;
}

export function validatePhone(phone: string): ValidationError | null {
  if (phone && !isValidTurkishPhone(phone)) {
    return {
      field: 'phone',
      message: 'Geçerli bir telefon numarası giriniz'
    };
  }
  return null;
}

// Complex validation schemas for forms
export const customerInfoSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  email: emailSchema,
  phone: phoneSchema,
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional()
});

export const appointmentSchema = z.object({
  date: z.string().refine(isValidDate, 'Geçerli bir tarih giriniz'),
  startTime: z.string().refine(isValidTime, 'Geçerli bir saat giriniz'),
  staffId: z.string().min(1, 'Berber seçimi gereklidir'),
  customerId: z.string().optional(),
  notes: z.string().max(500, 'Notlar en fazla 500 karakter olabilir').optional()
});

export const profileUpdateSchema = z.object({
  firstName: nameSchema,
  lastName: nameSchema,
  phone: phoneSchema,
  email: emailSchema.optional()
});

// Batch validation helper
export function validateForm<T>(
  data: T,
  schema: z.ZodSchema<T>
): { isValid: boolean; errors: Record<string, string> } {
  try {
    schema.parse(data);
    return { isValid: true, errors: {} };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach(err => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { isValid: false, errors };
    }
    return { isValid: false, errors: { general: 'Doğrulama hatası oluştu' } };
  }
}