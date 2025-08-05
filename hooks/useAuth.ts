"use client";

// Re-export from Auth feature for backward compatibility
export { 
  useAuthContext as useAuth, 
  useAuthUser as useUser, 
  useAuthLoading,
  useUserRole,
  useIsAuthenticated,
  useIsCustomer,
  useIsBarber,
  useIsStaff,
  useCanBookAppointments,
  useCanAccessBarberPanel
} from '@/features/auth';