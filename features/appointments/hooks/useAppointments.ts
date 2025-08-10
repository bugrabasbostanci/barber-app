"use client";

import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { 
  CustomerAppointment, 
  BarberAppointment, 
  AppointmentFilters 
} from '../types';
import { appointmentService } from '../services/appointmentService';
import { appointmentQueryKeys } from '../services/queryKeys';

// Cache configuration
const DEFAULT_STALE_TIME = 5 * 60 * 1000; // 5 minutes
const DEFAULT_GC_TIME = 10 * 60 * 1000; // 10 minutes

// Customer appointments hook
export function useMyAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.myAppointments(),
    queryFn: appointmentService.customer.getMyAppointments,
    enabled: !!user,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

// Barber appointments hook with filtering
export function useBarberAppointments(filters?: AppointmentFilters) {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.barberAppointments(filters),
    queryFn: () => appointmentService.barber.getAppointments(filters),
    enabled: !!user,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

// Day view appointments hook
export function useDayAppointments(date: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.dayView(date),
    queryFn: () => appointmentService.barber.getDayAppointments(date),
    enabled: !!user && !!date,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

// Week view appointments hook
export function useWeekAppointments(startDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.weekView(startDate),
    queryFn: () => appointmentService.barber.getWeekAppointments(startDate),
    enabled: !!user && !!startDate,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

// Month view appointments hook
export function useMonthAppointments(year: number, month: number) {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.monthView(year, month),
    queryFn: () => appointmentService.barber.getMonthAppointments(year, month),
    enabled: !!user && !!year && !!month,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}

// Single appointment details hook
export function useAppointmentDetails(appointmentId: string, isBarber = false) {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentQueryKeys.detail(appointmentId),
    queryFn: () => 
      isBarber 
        ? appointmentService.barber.getAppointmentDetails(appointmentId)
        : appointmentService.customer.getAppointmentDetails(appointmentId),
    enabled: !!user && !!appointmentId,
    staleTime: DEFAULT_STALE_TIME,
    gcTime: DEFAULT_GC_TIME,
  });
}