// Re-export from shared utilities for backward compatibility
import { DateUtils } from '@/shared/utils/dateUtils';
export { DateUtils };

// Legacy function mappings for backward compatibility
export const formatTurkishDate = DateUtils.formatTurkishDate;
export const formatTurkishDateShort = DateUtils.formatTurkishDateShort;
export const dateToLocalString = DateUtils.dateToLocalString;

// Keep original timezone-specific functions for now
export const TURKEY_TZ = "Europe/Istanbul";
export const DEFAULT_TZ = TURKEY_TZ;

/**
 * Tarih string'ini timezone-agnostic Date objesine çevirir
 */
export function localDateToUTC(dateStr: string): Date {
  return new Date(dateStr + 'T12:00:00.000Z');
}

/**
 * Local tarih ve saat string'lerini UTC Date objesine çevirir
 */
export function localDateTimeToUTC(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Date objesini local tarih string'ine çevirir
 */
export function utcToLocalDate(date: Date): string {
  return DateUtils.dateToLocalString(date);
}

/**
 * Date objesini local saat string'ine çevirir
 */
export function utcToLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Date objesini local datetime objesine çevirir
 */
export function utcToLocalDateTime(date: Date): { date: string; time: string } {
  return {
    date: utcToLocalDate(date),
    time: utcToLocalTime(date),
  };
}

/**
 * Sadece saat bilgisi için Date oluşturur
 */
export function createUTCTime(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00Z`);
}

/**
 * Date objesinden saat string'i çıkarır
 */
export function extractTimeString(date: Date): string {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Kullanıcının timezone'unu algılar
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || DEFAULT_TZ;
  } catch {
    return DEFAULT_TZ;
  }
}

/**
 * İki tarih arasındaki saat farkını hesaplar
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return diffMs / (1000 * 60 * 60);
}

/**
 * Randevu saatinin geçip geçmediğini kontrol eder
 */
export function isAppointmentPast(dateStr: string, timeStr: string): boolean {
  const appointmentTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  return appointmentTime < now;
}

/**
 * Randevunun iptal edilebilir olup olmadığını kontrol eder
 */
export function canCancelAppointment(
  dateStr: string,
  timeStr: string,
  cancellationHours: number
): boolean {
  const appointmentTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  const hoursDiff = getHoursDifference(appointmentTime, now);
  return appointmentTime > now && hoursDiff >= cancellationHours;
}

/**
 * Tarih aralığı kontrolü
 */
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  return date >= start && date <= end;
}