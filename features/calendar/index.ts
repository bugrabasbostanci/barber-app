// Components
export { CalendarContainer } from './components/CalendarContainer';
export { CalendarHeader } from './components/CalendarHeader';
export { DayView } from './components/views/DayView';
export { WeekView } from './components/views/WeekView';
export { MonthView } from './components/views/MonthView';
export { AppointmentCell } from './components/cells/AppointmentCell';
export { EmptySlot } from './components/cells/EmptySlot';

// Hooks
export { useCalendarData } from './hooks/useCalendarData';
export { useCalendarNavigation } from './hooks/useCalendarNavigation';

// Services
export { CalendarService } from './services/calendarService';

// Types
export type {
  ViewType,
  CalendarProps,
  CalendarViewProps,
  StaffMember,
  TimeSlot,
  CalendarDay,
  CalendarWeek,
  CalendarHeaderProps,
  DayViewProps,
  WeekViewProps,
  MonthViewProps,
  TimeSlotProps,
  AppointmentCellProps,
  EmptySlotProps,
} from './types/calendar.types';