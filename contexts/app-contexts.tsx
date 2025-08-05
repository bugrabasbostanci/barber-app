"use client";

import React, { ReactNode } from 'react';
import { AuthProvider } from '@/features/auth';
import { BookingProvider } from '@/features/booking';
import { AppointmentsProvider } from '@/features/appointments';
import { ProfileProvider } from '@/features/profile';

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
export { 
  useAuthContext as useAuth,
  useAuthUser, 
  useAuthLoading, 
  useUserRole, 
  useIsAuthenticated, 
  useIsCustomer, 
  useIsBarber, 
  useIsStaff, 
  useCanBookAppointments, 
  useCanAccessBarberPanel 
} from '@/features/auth';

export { useBookingContext as useBooking } from '@/features/booking';
export { useAppointmentsContext as useAppointments } from '@/features/appointments';
export { useProfileContext as useProfile } from '@/features/profile';

// Re-export types for convenience
export type { User as AuthUser } from '@/features/auth';
export type { BookingData, CustomerInfo, Staff, TimeSlot } from '@/features/booking';
export type { Appointment } from '@/features/appointments';
export type { UserProfile, ProfileFormData } from '@/features/profile';