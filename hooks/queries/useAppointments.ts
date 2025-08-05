"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, type Appointment } from '@/lib/api/appointments';
import { useMemo } from 'react';

// Query keys
const QUERY_KEYS = {
  appointments: ['appointments'] as const,
  myAppointments: ['appointments', 'my'] as const,
} as const;

// Get user's appointments
export function useMyAppointments() {
  return useQuery({
    queryKey: QUERY_KEYS.myAppointments,
    queryFn: appointmentsApi.getMyAppointments,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Cancel appointment mutation
export function useCancelAppointment() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onSuccess: () => {
      // Invalidate and refetch appointments
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myAppointments });
    },
  });
}

// Utility hooks for appointment data processing
export function useAppointmentUtils() {
  const { data: appointments = [] } = useMyAppointments();
  
  const getUpcomingAppointments = useMemo(() => {
    return () => {
      const now = new Date();
      return appointments.filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
        return appointmentDate > now && ['SCHEDULED', 'CONFIRMED'].includes(appointment.status);
      });
    };
  }, [appointments]);
  
  const getPastAppointments = useMemo(() => {
    return () => {
      const now = new Date();
      return appointments.filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.startTime}`);
        return appointmentDate < now || ['COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(appointment.status);
      });
    };
  }, [appointments]);
  
  const canCancelAppointment = useMemo(() => {
    return (appointment: Appointment) => {
      if (!['SCHEDULED', 'CONFIRMED'].includes(appointment.status)) {
        return false;
      }
      
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      
      return appointmentDateTime > twoHoursFromNow;
    };
  }, []);
  
  return {
    getUpcomingAppointments,
    getPastAppointments,
    canCancelAppointment,
  };
}