"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from './auth-context';
import { BookingProvider } from './booking-context';
import { AppointmentsProvider } from './appointments-context';
import { ProfileProvider } from './profile-context';

interface AppContextsProviderProps {
  children: ReactNode;
}

/**
 * Main provider that wraps all contexts in the correct order
 * Order matters: Auth must be first, then others can depend on it
 */
export function AppContextsProvider({ children }: AppContextsProviderProps) {
  return (
    <AuthProvider>
      <ProfileProvider>
        <AppointmentsProvider>
          <BookingProvider>
            {children}
          </BookingProvider>
        </AppointmentsProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}

// Re-export all context hooks for convenience
export { useAuth, useAuthUser, useAuthLoading, useUserRole, useIsAuthenticated, useIsCustomer, useIsBarber, useIsStaff, useCanBookAppointments, useCanAccessBarberPanel } from './auth-context';
export { useBooking } from './booking-context';
export { useAppointments } from './appointments-context';
export { useProfile } from './profile-context';

// Re-export types for convenience
export type { AuthUser } from './auth-context';
export type { BookingData, CustomerInfo, Staff, TimeSlot } from './booking-context';
export type { Appointment } from './appointments-context';
export type { UserProfile, ProfileFormData } from './profile-context';