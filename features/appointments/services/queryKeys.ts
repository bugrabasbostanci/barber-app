// Centralized query keys for appointments
import { AppointmentFilters, AppointmentQueryKeys } from '../types';

// Create consistent query keys structure
export const appointmentQueryKeys: AppointmentQueryKeys = {
  // Base key
  all: ['appointments'] as const,
  
  // List queries
  lists: () => [...appointmentQueryKeys.all, 'list'] as const,
  list: (filters?: AppointmentFilters) => 
    filters ? [...appointmentQueryKeys.lists(), filters] as const 
            : [...appointmentQueryKeys.lists()] as const,
  
  // Detail queries
  details: () => [...appointmentQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...appointmentQueryKeys.details(), id] as const,
  
  // Customer-specific queries
  myAppointments: () => [...appointmentQueryKeys.all, 'my'] as const,
  
  // Barber-specific queries
  barberAppointments: (filters?: AppointmentFilters) => 
    filters ? [...appointmentQueryKeys.all, 'barber', filters] as const
            : [...appointmentQueryKeys.all, 'barber'] as const,
  
  // Calendar view queries
  dayView: (date: string) => [...appointmentQueryKeys.all, 'day', date] as const,
  weekView: (startDate: string) => [...appointmentQueryKeys.all, 'week', startDate] as const,
  monthView: (year: number, month: number) => 
    [...appointmentQueryKeys.all, 'month', year, month] as const,
};

// Helper function to invalidate related queries
export const getInvalidationKeys = {
  // Invalidate all appointment queries
  all: () => ({ queryKey: appointmentQueryKeys.all }),
  
  // Invalidate all barber queries
  barber: () => ({ queryKey: [...appointmentQueryKeys.all, 'barber'] }),
  
  // Invalidate customer queries
  customer: () => ({ queryKey: appointmentQueryKeys.myAppointments() }),
  
  // Invalidate specific date queries
  date: (date: string) => [
    { queryKey: appointmentQueryKeys.dayView(date) },
    { queryKey: appointmentQueryKeys.barberAppointments({ startDate: date, endDate: date }) }
  ],
  
  // Invalidate date range queries
  dateRange: (startDate: string, endDate: string) => [
    { queryKey: appointmentQueryKeys.barberAppointments({ startDate, endDate }) }
  ],
};