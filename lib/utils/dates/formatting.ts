// lib/date-time.ts
// Native JavaScript + Intl.DateTimeFormat ile tarih yönetimi
// Luxon dependency'si kaldırıldı - Bundle size optimize edildi

// Türkiye timezone'u
export const TURKEY_TZ = "Europe/Istanbul";
export const DEFAULT_TZ = TURKEY_TZ;

/**
 * Tarih string'ini timezone-agnostic Date objesine çevirir
 * @param dateStr - "2025-07-31" formatında tarih
 */
export function localDateToUTC(dateStr: string): Date {
  // UTC'de tarihi oluştur (timezone shift'i önlemek için)
  return new Date(dateStr + 'T12:00:00.000Z');
}

/**
 * Local tarih ve saat string'lerini UTC Date objesine çevirir (timezone-safe)
 * @param dateStr - "2025-07-31" formatında tarih
 * @param timeStr - "14:30" formatında saat
 */
export function localDateTimeToUTC(dateStr: string, timeStr: string): Date {
  // Local timezone'da tarih+saat oluştur
  const [year, month, day] = dateStr.split('-').map(Number);
  const [hours, minutes] = timeStr.split(':').map(Number);
  // month - 1 çünkü JavaScript ayları 0-based
  return new Date(year, month - 1, day, hours, minutes);
}

/**
 * Date objesini local tarih string'ine çevirir
 * @param date - Date objesi
 */
export function utcToLocalDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Date objesini local saat string'ine çevirir
 * @param date - Date objesi
 */
export function utcToLocalTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Date objesini local datetime objesine çevirir
 * @param date - Date objesi
 */
export function utcToLocalDateTime(date: Date): {
  date: string;
  time: string;
} {
  return {
    date: utcToLocalDate(date),
    time: utcToLocalTime(date),
  };
}

/**
 * Sadece saat bilgisi için Date oluşturur (1970-01-01 bazlı)
 * @param timeStr - "14:30" formatında saat
 */
export function createUTCTime(timeStr: string): Date {
  return new Date(`1970-01-01T${timeStr}:00Z`);
}

/**
 * Date objesinden saat string'i çıkarır
 * @param date - Date objesi (1970-01-01 bazlı)
 */
export function extractTimeString(date: Date): string {
  // UTC saati olarak çıkar (timezone dönüşümü yapma)
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

/**
 * Türkçe tarih formatı - Modern Intl.DateTimeFormat kullanarak
 * @param dateStr - "2025-07-31" formatında tarih
 */
export function formatTurkishDate(dateStr: string): string {
  // Local timezone'da tarih oluştur (timezone offset problemini önler)
  const date = new Date(dateStr + 'T00:00:00');
  
  // Modern web standard ile Türkçe formatlama
  return new Intl.DateTimeFormat('tr-TR', {
    weekday: 'long',   // "Çarşamba"
    year: 'numeric',   // "2025"  
    month: 'long',     // "Temmuz"
    day: 'numeric'     // "30"
  }).format(date);
}

/**
 * JavaScript Date'den YYYY-MM-DD formatına çevirir (timezone-safe)
 * @param date - JavaScript Date objesi
 */
export function dateToLocalString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Kullanıcının timezone'unu algılar (basitleştirildi)
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
 * @param date1 - İlk tarih
 * @param date2 - İkinci tarih
 */
export function getHoursDifference(date1: Date, date2: Date): number {
  const diffMs = Math.abs(date1.getTime() - date2.getTime());
  return diffMs / (1000 * 60 * 60); // milliseconds to hours
}

/**
 * Randevu saatinin geçip geçmediğini kontrol eder
 * @param dateStr - "2025-07-31" formatında tarih
 * @param timeStr - "14:30" formatında saat
 */
export function isAppointmentPast(dateStr: string, timeStr: string): boolean {
  const appointmentTime = new Date(`${dateStr}T${timeStr}:00`);
  const now = new Date();
  return appointmentTime < now;
}

/**
 * Randevunun iptal edilebilir olup olmadığını kontrol eder
 * @param dateStr - "2025-07-31" formatında tarih
 * @param timeStr - "14:30" formatında saat
 * @param cancellationHours - İptal için gereken minimum saat
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
 * English date format - Modern Intl.DateTimeFormat
 * @param dateStr - Date string in "2025-07-31" format
 */
export function formatEnglishDate(dateStr: string): string {
  // Create date in local timezone (prevents timezone offset issues)
  const date = new Date(dateStr + 'T00:00:00');
  
  // Modern web standard with English formatting
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',   // "Wednesday"
    year: 'numeric',   // "2025"  
    month: 'long',     // "July"
    day: 'numeric'     // "30"
  }).format(date);
}

/**
 * English date format (short version)
 * @param dateStr - Date string in "2025-07-31" format
 */
export function formatEnglishDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  
  return new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Türkçe tarih formatı (kısa versiyon)
 * @param dateStr - "2025-07-31" formatında tarih
 */
export function formatTurkishDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  
  return new Intl.DateTimeFormat('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
}

/**
 * Tarih aralığı kontrolü
 * @param dateStr - Kontrol edilecek tarih
 * @param startDate - Başlangıç tarihi  
 * @param endDate - Bitiş tarihi
 */
export function isDateInRange(dateStr: string, startDate: string, endDate: string): boolean {
  const date = new Date(dateStr + 'T00:00:00');
  const start = new Date(startDate + 'T00:00:00');
  const end = new Date(endDate + 'T00:00:00');
  
  return date >= start && date <= end;
}