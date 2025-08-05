import { ViewType, CalendarDay, CalendarWeek, TimeSlot } from '../types/calendar.types';
import { Appointment } from '@/features/appointments';

export class CalendarService {
  static generateTimeSlots(): string[] {
    const slots: string[] = [];
    // Working hours: 09:30 - 21:30, 45-minute slots
    let hour = 9;
    let minute = 30;

    while (hour < 21 || (hour === 21 && minute <= 30)) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);

      minute += 45;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    }

    return slots;
  }

  static getDateRange(currentDate: Date, viewType: ViewType): { startDate: Date; endDate: Date } {
    const start = new Date(currentDate);
    const end = new Date(currentDate);

    switch (viewType) {
      case 'day':
        return { startDate: start, endDate: end };

      case 'week':
        // Get Monday to Sunday
        const dayOfWeek = start.getDay();
        const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        
        start.setDate(start.getDate() + mondayOffset);
        end.setDate(start.getDate() + 6);
        
        return { startDate: start, endDate: end };

      case 'month':
        start.setDate(1);
        end.setMonth(end.getMonth() + 1, 0);
        return { startDate: start, endDate: end };

      default:
        return { startDate: start, endDate: end };
    }
  }

  static generateCalendarDays(
    currentDate: Date, 
    viewType: ViewType, 
    appointments: Appointment[]
  ): CalendarDay[] {
    const { startDate, endDate } = this.getDateRange(currentDate, viewType);
    const days: CalendarDay[] = [];
    const today = new Date();
    const timeSlots = this.generateTimeSlots();
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateString = current.toISOString().split('T')[0];
      const dayAppointments = appointments.filter(apt => apt.date === dateString);
      
      const calendarDay: CalendarDay = {
        date: new Date(current),
        dateString,
        isToday: this.isSameDay(current, today),
        isCurrentMonth: current.getMonth() === currentDate.getMonth(),
        appointments: dayAppointments,
        timeSlots: timeSlots.map(time => ({
          time,
          available: true, // This would be calculated based on existing appointments
          staffId: '', // This would be populated based on context
          appointment: dayAppointments.find(apt => apt.startTime === time)
        }))
      };
      
      days.push(calendarDay);
      current.setDate(current.getDate() + 1);
    }

    return days;
  }

  static generateCalendarWeeks(
    currentDate: Date,
    appointments: Appointment[]
  ): CalendarWeek[] {
    const monthStart = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const monthEnd = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Get the first day of the calendar (might be from previous month)
    const calendarStart = new Date(monthStart);
    const startDayOfWeek = monthStart.getDay();
    const mondayOffset = startDayOfWeek === 0 ? -6 : 1 - startDayOfWeek;
    calendarStart.setDate(monthStart.getDate() + mondayOffset);
    
    // Get the last day of the calendar (might be from next month)
    const calendarEnd = new Date(monthEnd);
    const endDayOfWeek = monthEnd.getDay();
    const sundayOffset = endDayOfWeek === 0 ? 0 : 7 - endDayOfWeek;
    calendarEnd.setDate(monthEnd.getDate() + sundayOffset);
    
    const weeks: CalendarWeek[] = [];
    const current = new Date(calendarStart);
    let weekNumber = 1;
    
    while (current <= calendarEnd) {
      const week: CalendarWeek = {
        days: [],
        weekNumber
      };
      
      // Generate 7 days for the week
      for (let i = 0; i < 7; i++) {
        const dateString = current.toISOString().split('T')[0];
        const dayAppointments = appointments.filter(apt => apt.date === dateString);
        
        week.days.push({
          date: new Date(current),
          dateString,
          isToday: this.isSameDay(current, new Date()),
          isCurrentMonth: current.getMonth() === currentDate.getMonth(),
          appointments: dayAppointments,
          timeSlots: []
        });
        
        current.setDate(current.getDate() + 1);
      }
      
      weeks.push(week);
      weekNumber++;
    }
    
    return weeks;
  }

  static isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  static formatDateForDisplay(date: Date, viewType: ViewType): string {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
    };

    if (viewType === 'day') {
      options.day = 'numeric';
      options.weekday = 'long';
    }

    return date.toLocaleDateString('tr-TR', options);
  }

  static getWeekDays(): string[] {
    return ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  }

  static getMonthNames(): string[] {
    return [
      'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
      'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
    ];
  }

  static navigateDate(currentDate: Date, direction: 'prev' | 'next', viewType: ViewType): Date {
    const newDate = new Date(currentDate);
    
    switch (viewType) {
      case 'day':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1));
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7));
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1));
        break;
    }
    
    return newDate;
  }

  static isTimeSlotAvailable(
    date: string, 
    time: string, 
    staffId: string, 
    appointments: Appointment[]
  ): boolean {
    return !appointments.some(apt => 
      apt.date === date && 
      apt.startTime === time && 
      apt.staff.id === staffId &&
      apt.status !== 'cancelled'
    );
  }

  static getAppointmentConflicts(
    date: string,
    startTime: string,
    staffId: string,
    appointments: Appointment[]
  ): Appointment[] {
    return appointments.filter(apt =>
      apt.date === date &&
      apt.staff.id === staffId &&
      apt.status !== 'cancelled' &&
      this.timesOverlap(startTime, apt.startTime)
    );
  }

  private static timesOverlap(time1: string, time2: string): boolean {
    // Since all appointments are 45 minutes, check if they're the same time
    return time1 === time2;
  }
}