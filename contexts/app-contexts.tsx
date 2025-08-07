"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from './auth-context';
import { BookingProvider } from './booking-context';
import { AppointmentsProvider } from './appointments-context';
import { ProfileProvider } from './profile-context';
import { BarberProfileProvider } from './barber-profile-context';
import { BarberAppointmentsProvider } from './barber-appointments-context';
import { BarberDashboardProvider } from './barber-dashboard-context';

interface AppContextsProviderProps {
  children: ReactNode;
}

/**
 * Main provider that wraps all contexts in the correct order
 * Order matters: Auth must be first, then others can depend on it
 * Barber contexts are added alongside customer contexts for role-specific functionality
 */
export function AppContextsProvider({ children }: AppContextsProviderProps) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <BarberProfileProvider>
          <AppointmentsProvider>
            <BarberAppointmentsProvider>
              <BarberDashboardProvider>
                <BookingProvider>
                  {children}
                </BookingProvider>
              </BarberDashboardProvider>
            </BarberAppointmentsProvider>
          </AppointmentsProvider>
        </BarberProfileProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

// Re-export all context hooks for convenience
export { useAuth, useAuthUser, useAuthLoading, useUserRole, useIsAuthenticated, useIsCustomer, useIsBarber, useIsStaff, useCanBookAppointments, useCanAccessBarberPanel } from './auth-context';
export { useBooking } from './booking-context';
export { useAppointments } from './appointments-context';
export { useProfile } from './profile-context';
export { useBarberProfile } from './barber-profile-context';
export { useBarberAppointments } from './barber-appointments-context';
export { useBarberDashboard } from './barber-dashboard-context';

// Re-export types for convenience
export type { AuthUser } from '@/lib/types/auth';
export type { BookingData, CustomerInfo, Staff, TimeSlot } from './booking-context';
export type { Appointment } from './appointments-context';
export type { UserProfile, ProfileFormData } from './profile-context';
export type { BarberProfile, BarberProfileFormData } from './barber-profile-context';
export type { BarberAppointment, AppointmentFilters, AppointmentStats } from './barber-appointments-context';
export type { DashboardView, CalendarView, TimeRange, DashboardFilters, DashboardStats, QuickAction, DashboardNotification } from './barber-dashboard-context';