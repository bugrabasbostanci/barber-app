"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Types
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  shop: {
    name: string;
    address: string;
  };
  createdAt: string;
}

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string;
  lastFetch: number | null;
  hasInitialized: boolean;
}

interface AppointmentsContextType {
  // State
  appointments: Appointment[];
  isLoading: boolean;
  error: string;
  hasInitialized: boolean;
  
  // Actions  
  fetchAppointments: (force?: boolean) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
  clearError: () => void;
  
  // Utilities
  getUpcomingAppointments: () => Appointment[];
  getPastAppointments: () => Appointment[];
  getAppointmentsByStatus: (status: Appointment['status']) => Appointment[];
  canCancelAppointment: (appointment: Appointment) => boolean;
}

const AppointmentsContext = createContext<AppointmentsContextType | undefined>(undefined);

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialState: AppointmentsState = {
  appointments: [],
  isLoading: false,
  error: '',
  lastFetch: null,
  hasInitialized: false,
};

export function AppointmentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AppointmentsState>(initialState);
  const { user } = useAuth();

  // Auto-fetch on mount if user is available and is a customer
  useEffect(() => {
    if (user && user.role === 'CUSTOMER' && !state.hasInitialized) {
      fetchAppointments();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAppointments = useCallback(async (force: boolean = false) => {
    if (!user || user.role !== 'CUSTOMER') return;

    // Skip if recently fetched and not forced
    const now = Date.now();
    if (!force && state.lastFetch && (now - state.lastFetch) < CACHE_DURATION) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const response = await fetch('/api/my-appointments', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          setState(prev => ({
            ...prev,
            appointments: result.data,
            isLoading: false,
            error: '',
            lastFetch: now,
            hasInitialized: true,
          }));
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Randevular yüklenemedi',
            isLoading: false,
            hasInitialized: true,
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: 'Randevular yüklenemedi',
          isLoading: false,
          hasInitialized: true,
        }));
      }
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setState(prev => ({
        ...prev,
        error: 'Bağlantı hatası. Lütfen tekrar deneyin.',
        isLoading: false,
        hasInitialized: true,
      }));
    }
  }, [user, state.lastFetch]);

  const cancelAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!user) return false;

    setState(prev => ({ ...prev, error: '' }));

    try {
      const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          // Update the local state immediately for better UX
          setState(prev => ({
            ...prev,
            appointments: prev.appointments.map(apt => 
              apt.id === appointmentId 
                ? { ...apt, status: 'CANCELLED' as const }
                : apt
            ),
          }));
          return true;
        } else {
          setState(prev => ({
            ...prev,
            error: result.error || 'Randevu iptal edilemedi',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          error: 'Randevu iptal edilemedi',
        }));
      }
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setState(prev => ({
        ...prev,
        error: 'Bağlantı hatası. Lütfen tekrar deneyin.',
      }));
    }

    return false;
  }, [user]);

  const refreshAppointments = useCallback(async () => {
    await fetchAppointments(true);
  }, [fetchAppointments]);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }));
  }, []);

  // Utilities
  const getUpcomingAppointments = useCallback((): Appointment[] => {
    const now = new Date();
    return state.appointments.filter(apt => {
      if (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') return false;
      
      const appointmentDateTime = new Date(`${apt.date}T${apt.startTime}`);
      return appointmentDateTime > now;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [state.appointments]);

  const getPastAppointments = useCallback((): Appointment[] => {
    const now = new Date();
    return state.appointments.filter(apt => {
      const appointmentDateTime = new Date(`${apt.date}T${apt.startTime}`);
      return appointmentDateTime <= now || apt.status === 'COMPLETED';
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.startTime}`);
      const dateB = new Date(`${b.date}T${b.startTime}`);
      return dateB.getTime() - dateA.getTime(); // Most recent first
    });
  }, [state.appointments]);

  const getAppointmentsByStatus = useCallback((status: Appointment['status']): Appointment[] => {
    return state.appointments.filter(apt => apt.status === status);
  }, [state.appointments]);

  const canCancelAppointment = useCallback((appointment: Appointment): boolean => {
    if (appointment.status !== 'SCHEDULED' && appointment.status !== 'CONFIRMED') {
      return false;
    }

    // Check if appointment is at least 2 hours away
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const twoHoursFromNow = new Date(now.getTime() + (2 * 60 * 60 * 1000));

    return appointmentDateTime > twoHoursFromNow;
  }, []);

  const contextValue: AppointmentsContextType = {
    appointments: state.appointments,
    isLoading: state.isLoading,
    error: state.error,
    hasInitialized: state.hasInitialized,
    fetchAppointments,
    cancelAppointment,
    refreshAppointments,
    clearError,
    getUpcomingAppointments,
    getPastAppointments,
    getAppointmentsByStatus,
    canCancelAppointment,
  };

  return (
    <AppointmentsContext.Provider value={contextValue}>
      {children}
    </AppointmentsContext.Provider>
  );
}

export function useAppointments() {
  const context = useContext(AppointmentsContext);
  if (context === undefined) {
    throw new Error('useAppointments must be used within an AppointmentsProvider');
  }
  return context;
}