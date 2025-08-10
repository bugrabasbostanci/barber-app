"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, type Appointment } from '@/lib/api/appointments';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';

// Query keys
export const appointmentKeys = {
  all: ['appointments'] as const,
  myAppointments: () => [...appointmentKeys.all, 'my'] as const,
  barberAppointments: (date?: string) => [...appointmentKeys.all, 'barber', date] as const,
};

// Get my appointments query
export function useMyAppointments() {
  const { user } = useAuth();

  return useQuery({
    queryKey: appointmentKeys.myAppointments(),
    queryFn: appointmentsApi.getMyAppointments,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Invalidate appointments cache (for external use)
export function useInvalidateAppointments() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
  };
}

// Cancel appointment mutation
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentsApi.cancelAppointment,
    onMutate: async (appointmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentKeys.myAppointments() });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData<Appointment[]>(
        appointmentKeys.myAppointments()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Appointment[]>(
        appointmentKeys.myAppointments(),
        (old) => 
          old?.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'CANCELLED' as const }
              : apt
          ) ?? old
      );

      // Return a context object with the snapshotted value
      return { previousAppointments };
    },
    onError: (err, appointmentId, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        appointmentKeys.myAppointments(),
        context?.previousAppointments
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: appointmentKeys.myAppointments() });
    },
  });
}

// Custom hook for appointment utilities (similar to context utilities)
export function useAppointmentUtils() {
  const { data: appointments = [] } = useMyAppointments();

  return useMemo(() => {
    const getUpcomingAppointments = (): Appointment[] => {
      const now = new Date();
      return appointments.filter(apt => {
        if (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') return false;
        
        const appointmentDateTime = new Date(`${apt.date}T${apt.startTime}`);
        return appointmentDateTime > now;
      }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateA.getTime() - dateB.getTime();
      });
    };

    const getPastAppointments = (): Appointment[] => {
      const now = new Date();
      return appointments.filter(apt => {
        const appointmentDateTime = new Date(`${apt.date}T${apt.startTime}`);
        return appointmentDateTime <= now || apt.status === 'COMPLETED';
      }).sort((a, b) => {
        const dateA = new Date(`${a.date}T${a.startTime}`);
        const dateB = new Date(`${b.date}T${b.startTime}`);
        return dateB.getTime() - dateA.getTime(); // Most recent first
      });
    };

    const getAppointmentsByStatus = (status: Appointment['status']): Appointment[] => {
      return appointments.filter(apt => apt.status === status);
    };

    const canCancelAppointment = (appointment: Appointment): boolean => {
      if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CONFIRMED') {
        return false;
      }

      // Check if appointment is at least 2 hours away
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
      const now = new Date();
      const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

      return appointmentDateTime > twoHoursFromNow;
    };

    return {
      appointments,
      getUpcomingAppointments,
      getPastAppointments,
      getAppointmentsByStatus,
      canCancelAppointment,
    };
  }, [appointments]);
}