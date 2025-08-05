/**
 * Date utility functions for the barber app
 */

export class DateUtils {
  /**
   * Format date to Turkish locale string
   */
  static formatTurkishDate(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  }

  /**
   * Format date to short Turkish format
   */
  static formatTurkishDateShort(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  }

  /**
   * Convert date to local string format (YYYY-MM-DD)
   */
  static dateToLocalString(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Check if date is today
   */
  static isToday(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    
    return dateObj.getDate() === today.getDate() &&
           dateObj.getMonth() === today.getMonth() &&
           dateObj.getFullYear() === today.getFullYear();
  }

  /**
   * Check if date is tomorrow
   */
  static isTomorrow(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return dateObj.getDate() === tomorrow.getDate() &&
           dateObj.getMonth() === tomorrow.getMonth() &&
           dateObj.getFullYear() === tomorrow.getFullYear();
  }

  /**
   * Check if date is in the past
   */
  static isPast(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    return dateObj < today;
  }

  /**
   * Check if date is in the future
   */
  static isFuture(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    return dateObj > today;
  }

  /**
   * Get day name in Turkish
   */
  static getDayName(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', { weekday: 'long' });
  }

  /**
   * Get month name in Turkish
   */
  static getMonthName(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('tr-TR', { month: 'long' });
  }

  /**
   * Add days to a date
   */
  static addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  /**
   * Add minutes to a time string (HH:MM)
   */
  static addMinutesToTime(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const totalMinutes = hours * 60 + mins + minutes;
    
    const newHours = Math.floor(totalMinutes / 60);
    const newMins = totalMinutes % 60;
    
    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
  }

  /**
   * Check if time is within working hours (09:30 - 21:30)
   */
  static isWithinWorkingHours(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    const startTime = 9 * 60 + 30; // 09:30
    const endTime = 21 * 60 + 30; // 21:30
    
    return timeInMinutes >= startTime && timeInMinutes <= endTime;
  }

  /**
   * Check if date is Sunday (closed day)
   */
  static isSunday(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.getDay() === 0;
  }

  /**
   * Check if date is valid for booking (not past, not Sunday, not more than 7 days ahead)
   */
  static isValidBookingDate(date: string | Date): boolean {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Not in the past
    if (this.isPast(dateObj)) return false;
    
    // Not Sunday
    if (this.isSunday(dateObj)) return false;
    
    // Not more than 7 days in advance
    const maxDate = this.addDays(new Date(), 7);
    if (dateObj > maxDate) return false;
    
    return true;
  }

  /**
   * Get relative time string (e.g., "2 hours ago", "in 3 days")
   */
  static getRelativeTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    const now = new Date();
    const diffMs = dateObj.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.ceil(diffMs / (1000 * 60));

    if (this.isToday(dateObj)) {
      if (Math.abs(diffHours) < 1) {
        if (diffMinutes > 0) return `${diffMinutes} dakika sonra`;
        return `${Math.abs(diffMinutes)} dakika önce`;
      }
      if (diffHours > 0) return `${diffHours} saat sonra`;
      return `${Math.abs(diffHours)} saat önce`;
    }

    if (this.isTomorrow(dateObj)) return 'Yarın';
    
    if (diffDays === -1) return 'Dün';
    
    if (diffDays > 0 && diffDays <= 7) return `${diffDays} gün sonra`;
    
    if (diffDays < 0 && diffDays >= -7) return `${Math.abs(diffDays)} gün önce`;
    
    return this.formatTurkishDateShort(dateObj);
  }

  /**
   * Format time range (e.g., "09:30 - 10:15")
   */
  static formatTimeRange(startTime: string, endTime: string): string {
    return `${startTime} - ${endTime}`;
  }

  /**
   * Parse date string to Date object safely
   */
  static parseDate(dateString: string): Date | null {
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? null : date;
    } catch {
      return null;
    }
  }

  /**
   * Get week number of the year
   */
  static getWeekNumber(date: Date): number {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  }
}