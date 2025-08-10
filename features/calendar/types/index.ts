// Calendar feature types

export type CalendarViewType = "day" | "week" | "month";

export interface CalendarAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  customer?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface CalendarDate {
  year: number;
  month: number; // 1-12
  day: number;
  date: Date;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: CalendarAppointment[];
}

export interface CalendarWeek {
  days: CalendarDate[];
  weekNumber: number;
}

export interface CalendarMonth {
  year: number;
  month: number;
  weeks: CalendarWeek[];
  appointments: CalendarAppointment[];
}

export interface CalendarNavigation {
  currentDate: Date;
  viewType: CalendarViewType;
  goToNext: () => void;
  goToPrevious: () => void;
  goToToday: () => void;
  setViewType: (view: CalendarViewType) => void;
  setCurrentDate: (date: Date) => void;
}

export interface CalendarTimeSlot {
  time: string; // HH:MM format
  isAvailable: boolean;
  appointment?: CalendarAppointment;
}

export interface CalendarDayData {
  date: Date;
  timeSlots: CalendarTimeSlot[];
  appointments: CalendarAppointment[];
}

export interface CalendarFilters {
  staffId?: string;
  status?: CalendarAppointment['status'][];
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface CalendarSettings {
  workingHours: {
    start: string; // HH:MM
    end: string;   // HH:MM
  };
  appointmentDuration: number; // minutes
  timeSlotInterval: number;    // minutes
  closedDays: number[];        // 0-6 (Sunday-Saturday)
}