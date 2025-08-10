/**
 * Enhanced useAuth hook that extends the existing auth system
 */

'use client';

// Re-export existing auth hooks
export * from '../../hooks/useAuth';

// Additional auth utilities and enhanced hooks
import { useCallback } from 'react';
import { 
  useAuth as useBaseAuth,
  useIsAuthenticated,
  useUserRole,
  useIsBarber,
  useIsCustomer,
  useCanBookAppointments,
  useCanAccessBarberPanel
} from '../../hooks/useAuth';

export interface AuthPermissions {
  canBookAppointments: boolean;
  canAccessBarberPanel: boolean;
  canManageAppointments: boolean;
  canViewSchedule: boolean;
  canEditProfile: boolean;
}

export function useAuthPermissions(): AuthPermissions {
  const canBookAppointments = useCanBookAppointments();
  const canAccessBarberPanel = useCanAccessBarberPanel();
  const isBarber = useIsBarber();
  const authStatus = useIsAuthenticated();
  const isAuthenticated = typeof authStatus === 'boolean' ? authStatus : authStatus?.isAuthenticated || false;

  return {
    canBookAppointments,
    canAccessBarberPanel,
    canManageAppointments: isBarber,
    canViewSchedule: isBarber,
    canEditProfile: isAuthenticated
  };
}

export function useAuthActions() {
  const auth = useBaseAuth();

  const requireAuth = useCallback((action: () => void) => {
    if (!auth.user) {
      // Redirect to login or show login modal
      console.warn('Authentication required');
      return;
    }
    action();
  }, [auth.user]);

  const requireRole = useCallback((requiredRole: string, action: () => void) => {
    if (!auth.user) {
      console.warn('Authentication required');
      return;
    }
    
    if (auth.user.role !== requiredRole) {
      console.warn(`Role ${requiredRole} required`);
      return;
    }
    
    action();
  }, [auth.user]);

  const requireBarber = useCallback((action: () => void) => {
    requireRole('BARBER', action);
  }, [requireRole]);

  const requireCustomer = useCallback((action: () => void) => {
    requireRole('CUSTOMER', action);
  }, [requireRole]);

  return {
    requireAuth,
    requireRole,
    requireBarber,
    requireCustomer
  };
}

export function useAuthStatus() {
  const auth = useBaseAuth();
  const isAuthenticated = useIsAuthenticated();
  const role = useUserRole();
  const isBarber = useIsBarber();
  const isCustomer = useIsCustomer();

  return {
    isAuthenticated,
    isLoading: auth.loading,
    user: auth.user,
    role,
    isBarber,
    isCustomer,
    isGuest: !isAuthenticated
  };
}

export function useAuthGuard(options: {
  requireAuth?: boolean;
  requireRole?: string;
  redirectTo?: string;
  onUnauthorized?: () => void;
} = {}) {
  const { requireAuth = false, requireRole, redirectTo, onUnauthorized } = options;
  const auth = useAuthStatus();

  const canAccess = useCallback(() => {
    if (requireAuth && !auth.isAuthenticated) {
      onUnauthorized?.();
      return false;
    }

    if (requireRole && auth.role !== requireRole) {
      onUnauthorized?.();
      return false;
    }

    return true;
  }, [requireAuth, requireRole, auth.isAuthenticated, auth.role, onUnauthorized]);

  const checkAccess = useCallback(() => {
    if (!canAccess()) {
      if (redirectTo) {
        window.location.href = redirectTo;
      }
      return false;
    }
    return true;
  }, [canAccess, redirectTo]);

  return {
    canAccess,
    checkAccess,
    isAuthorized: canAccess(),
    ...auth
  };
}

// Hook for component-level permission checks
export function usePermissionCheck() {
  const permissions = useAuthPermissions();

  const checkPermission = useCallback((permission: keyof AuthPermissions): boolean => {
    return permissions[permission];
  }, [permissions]);

  const requirePermission = useCallback((permission: keyof AuthPermissions, action: () => void) => {
    if (checkPermission(permission)) {
      action();
    } else {
      console.warn(`Permission ${permission} required`);
    }
  }, [checkPermission]);

  return {
    ...permissions,
    checkPermission,
    requirePermission
  };
}

// Hook for session management
export function useAuthSession() {
  const auth = useBaseAuth();

  const refreshSession = useCallback(async () => {
    // Implement session refresh logic
    // This would typically call your auth service to refresh the token
    console.log('Refreshing session...');
  }, []);

  const extendSession = useCallback(() => {
    // Extend session expiry
    console.log('Extending session...');
  }, []);

  const endSession = useCallback(async () => {
    await auth.signOut();
  }, [auth]);

  return {
    refreshSession,
    extendSession,
    endSession,
    isActive: !!auth.user
  };
}