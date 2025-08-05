"use client";

import React, { createContext, useContext, useCallback, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '../stores/authStore';
import { User } from '@supabase/supabase-js';

// Extended user type with role and profile info
export interface AuthUser extends User {
  role?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  isGoogleUser?: boolean;
  isEmailUser?: boolean;
}

interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  hydrated: boolean;
}

interface AuthContextType {
  // State
  user: AuthUser | null;
  loading: boolean;
  initialized: boolean;
  hydrated: boolean;
  
  // Actions
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
  
  // Role-based utilities
  isCustomer: () => boolean;
  isBarber: () => boolean;
  isStaff: () => boolean;
  isAdmin: () => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  
  // User info utilities
  getDisplayName: () => string;
  getUserInitials: () => string;
  isProfileComplete: () => boolean;
  requiresProfileCompletion: () => boolean;
  
  // Navigation helpers
  getDefaultRoute: () => string;
  redirectToRole: () => void;
  
  // Permission checks
  canAccessRoute: (route: string) => boolean;
  canBookAppointments: () => boolean;
  canManageAppointments: () => boolean;
  canAccessBarberPanel: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Route permissions mapping
const ROUTE_PERMISSIONS: Record<string, string[]> = {
  '/profile': ['CUSTOMER', 'BARBER', 'ADMIN'],
  '/my-appointments': ['CUSTOMER'],
  '/book-appointment': ['CUSTOMER'],
  '/barber/dashboard': ['BARBER', 'ADMIN'],
  '/barber/appointments': ['BARBER', 'ADMIN'],
  '/barber/calendar': ['BARBER', 'ADMIN'],
  '/barber/schedule': ['BARBER', 'ADMIN'],
};

// Default routes by role
const DEFAULT_ROUTES: Record<string, string> = {
  CUSTOMER: '/',
  BARBER: '/barber/dashboard',
  ADMIN: '/barber/dashboard',
  EMPLOYEE: '/barber/dashboard',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  
  // Get state and actions from Zustand store
  const {
    user: zustandUser,
    loading,
    initialized,
    hydrated,
    signOut: zustandSignOut,
    refreshUser: zustandRefreshUser,
    initialize,
    setHydrated,
  } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    setHydrated(true);
    initialize();
  }, [initialize, setHydrated]);

  // Enhanced signOut with navigation
  const signOut = useCallback(async () => {
    await zustandSignOut();
    // Navigation is handled in the store, but we can add additional logic here
  }, [zustandSignOut]);

  const refreshUser = useCallback(async () => {
    await zustandRefreshUser();
  }, [zustandRefreshUser]);

  // Role-based utilities
  const isCustomer = useCallback((): boolean => {
    return zustandUser?.role === 'CUSTOMER';
  }, [zustandUser?.role]);

  const isBarber = useCallback((): boolean => {
    return zustandUser?.role === 'BARBER';
  }, [zustandUser?.role]);

  const isStaff = useCallback((): boolean => {
    return ['EMPLOYEE', 'BARBER', 'ADMIN'].includes(zustandUser?.role || '');
  }, [zustandUser?.role]);

  const isAdmin = useCallback((): boolean => {
    return zustandUser?.role === 'ADMIN';
  }, [zustandUser?.role]);

  const hasRole = useCallback((role: string): boolean => {
    return zustandUser?.role === role;
  }, [zustandUser?.role]);

  const hasAnyRole = useCallback((roles: string[]): boolean => {
    return roles.includes(zustandUser?.role || '');
  }, [zustandUser?.role]);

  // User info utilities
  const getDisplayName = useCallback((): string => {
    if (zustandUser?.firstName && zustandUser?.lastName) {
      return `${zustandUser.firstName} ${zustandUser.lastName}`;
    }
    if (zustandUser?.email) {
      return zustandUser.email.split('@')[0];
    }
    return 'Kullanıcı';
  }, [zustandUser]);

  const getUserInitials = useCallback((): string => {
    if (zustandUser?.firstName && zustandUser?.lastName) {
      return (zustandUser.firstName.charAt(0) + zustandUser.lastName.charAt(0)).toUpperCase();
    }
    if (zustandUser?.email) {
      return zustandUser.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [zustandUser]);

  const isProfileComplete = useCallback((): boolean => {
    if (!zustandUser) return false;
    return !!(zustandUser.firstName && zustandUser.lastName && zustandUser.role);
  }, [zustandUser]);

  const requiresProfileCompletion = useCallback((): boolean => {
    return !!zustandUser && !isProfileComplete();
  }, [zustandUser, isProfileComplete]);

  // Navigation helpers
  const getDefaultRoute = useCallback((): string => {
    if (!zustandUser?.role) return '/';
    return DEFAULT_ROUTES[zustandUser.role] || '/';
  }, [zustandUser?.role]);

  const redirectToRole = useCallback(() => {
    const defaultRoute = getDefaultRoute();
    router.push(defaultRoute);
  }, [getDefaultRoute, router]);

  // Permission checks
  const canAccessRoute = useCallback((route: string): boolean => {
    if (!zustandUser) return false;
    
    const allowedRoles = ROUTE_PERMISSIONS[route];
    if (!allowedRoles) return true; // Public route

    return allowedRoles.includes(zustandUser.role || '');
  }, [zustandUser]);

  const canBookAppointments = useCallback((): boolean => {
    return isCustomer();
  }, [isCustomer]);

  const canManageAppointments = useCallback((): boolean => {
    return isStaff();
  }, [isStaff]);

  const canAccessBarberPanel = useCallback((): boolean => {
    return isBarber() || isAdmin();
  }, [isBarber, isAdmin]);

  const contextValue: AuthContextType = {
    // State (from Zustand)
    user: zustandUser,
    loading,
    initialized,
    hydrated,
    
    // Actions
    signOut,
    refreshUser,
    
    // Role-based utilities
    isCustomer,
    isBarber,
    isStaff,
    isAdmin,
    hasRole,
    hasAnyRole,
    
    // User info utilities
    getDisplayName,
    getUserInitials,
    isProfileComplete,
    requiresProfileCompletion,
    
    // Navigation helpers
    getDefaultRoute,
    redirectToRole,
    
    // Permission checks
    canAccessRoute,
    canBookAppointments,
    canManageAppointments,
    canAccessBarberPanel,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
}

// Specialized hooks for convenience
export function useAuthUser() {
  const { user } = useAuthContext();
  return user;
}

export function useAuthLoading() {
  const { loading } = useAuthContext();
  return loading;
}

export function useUserRole() {
  const { user } = useAuthContext();
  return user?.role || null;
}

export function useIsAuthenticated() {
  const { user, initialized } = useAuthContext();
  return { isAuthenticated: !!user, initialized };
}

// Role-specific hooks
export function useIsCustomer() {
  const { isCustomer } = useAuthContext();
  return isCustomer();
}

export function useIsBarber() {
  const { isBarber } = useAuthContext();
  return isBarber();
}

export function useIsStaff() {
  const { isStaff } = useAuthContext();
  return isStaff();
}

export function useCanBookAppointments() {
  const { canBookAppointments } = useAuthContext();
  return canBookAppointments();
}

export function useCanAccessBarberPanel() {
  const { canAccessBarberPanel } = useAuthContext();
  return canAccessBarberPanel();
}