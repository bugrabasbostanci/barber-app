"use client";

import { useEffect } from 'react';
import { useBarberAppointmentActions } from './useBarberAppointmentActions';
import { useAuth, useIsBarber } from '@/contexts/auth-context';

/**
 * Main hook for barber appointments functionality
 * Combines state management and actions with initialization logic
 */
export function useBarberAppointments() {
  const { user } = useAuth();
  const isBarber = useIsBarber();
  const appointmentActions = useBarberAppointmentActions();

  // Auto-fetch appointments on mount and when user changes
  useEffect(() => {
    if (user && isBarber) {
      appointmentActions.fetchAppointments();
      appointmentActions.fetchAppointmentStats();
    }
  }, [user, isBarber, appointmentActions.fetchAppointments, appointmentActions.fetchAppointmentStats]); // Fixed dependencies

  // Auto-apply filters when appointments or filters change
  useEffect(() => {
    appointmentActions.applyFilters();
  }, [appointmentActions.appointments, appointmentActions.filters]); // More specific dependencies

  return appointmentActions;
}