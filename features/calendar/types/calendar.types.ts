import { Appointment } from "@/features/appointments";

export type ViewType = "day" | "week" | "month";

export interface CalendarProps {
  className?: string;
}

export interface CalendarViewProps {
  currentDate: Date;
  viewType: ViewType;
  appointments: Appointment[];
  staffMembers: StaffMember[];
  onDateChange: (date: Date) => void;
  onViewTypeChange: (viewType: ViewType) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: string, time: string, staffId?: string) => void;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  appointment?: Appointment;
  staffId: string;
}

export interface CalendarDay {
  date: Date;
  dateString: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  appointments: Appointment[];
  timeSlots: TimeSlot[];
}

export interface CalendarWeek {
  days: CalendarDay[];
  weekNumber: number;
}

export interface CalendarHeaderProps {
  currentDate: Date;
  viewType: ViewType;
  onPrevious: () => void;
  onNext: () => void;
  onToday: () => void;
  onViewTypeChange: (viewType: ViewType) => void;
}

export interface DayViewProps {
  date: Date;
  appointments: Appointment[];
  staffMembers: StaffMember[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (time: string, staffId?: string) => void;
}

export interface WeekViewProps {
  currentDate: Date;
  appointments: Appointment[];
  staffMembers: StaffMember[];
  onAppointmentClick?: (appointment: Appointment) => void;
  onTimeSlotClick?: (date: string, time: string, staffId?: string) => void;
}

export interface MonthViewProps {
  currentDate: Date;
  appointments: Appointment[];
  onDateClick: (date: Date) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export interface TimeSlotProps {
  time: string;
  appointment?: Appointment;
  available: boolean;
  staffId: string;
  onClick?: (time: string, staffId?: string) => void;
  onAppointmentClick?: (appointment: Appointment) => void;
}

export interface AppointmentCellProps {
  appointment: Appointment;
  onClick?: (appointment: Appointment) => void;
}

export interface EmptySlotProps {
  time: string;
  staffId: string;
  available: boolean;
  onClick?: (time: string, staffId?: string) => void;
}
