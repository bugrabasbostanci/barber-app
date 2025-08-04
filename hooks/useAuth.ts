"use client";

// Re-export from AuthContext for backward compatibility
export { 
  useAuth, 
  useAuthUser as useUser, 
  useAuthLoading,
  useUserRole,
  useIsAuthenticated,
  useIsCustomer,
  useIsBarber,
  useIsStaff,
  useCanBookAppointments,
  useCanAccessBarberPanel
} from '@/contexts/auth-context';