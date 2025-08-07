"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Barber-specific appointment types
export interface BarberAppointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  service: string;
  duration: number;
  price: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  status: string;
  dateRange: {
    start: string;
    end: string;
  } | null;
  searchTerm: string;
}

export interface AppointmentStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  todayAppointments: number;
  weekRevenue: number;
  monthRevenue: number;
}

interface BarberAppointmentsState {
  appointments: BarberAppointment[];
  filteredAppointments: BarberAppointment[];
  selectedAppointment: BarberAppointment | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string;
  successMessage: string;
  
  // Filters and search
  filters: AppointmentFilters;
  
  // Statistics
  stats: AppointmentStats | null;
  
  // Flags
  hasInitialized: boolean;
  lastFetch: number | null;
  
  // Edit state
  isEditingAppointment: boolean;
  editingAppointmentId: string | null;
  appointmentNotes: string;
}

interface BarberAppointmentsContextType {
  // State
  appointments: BarberAppointment[];
  filteredAppointments: BarberAppointment[];
  selectedAppointment: BarberAppointment | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string;
  successMessage: string;
  filters: AppointmentFilters;
  stats: AppointmentStats | null;
  hasInitialized: boolean;
  isEditingAppointment: boolean;
  appointmentNotes: string;
  
  // Actions
  fetchAppointments: (force?: boolean) => Promise<void>;
  fetchAppointmentStats: () => Promise<void>;
  confirmAppointment: (appointmentId: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>;
  completeAppointment: (appointmentId: string) => Promise<boolean>;
  markNoShow: (appointmentId: string) => Promise<boolean>;
  updateAppointmentNotes: (appointmentId: string, notes: string) => Promise<boolean>;
  deleteAppointment: (appointmentId: string) => Promise<boolean>;
  
  // Selection and editing
  selectAppointment: (appointment: BarberAppointment | null) => void;
  startEditingAppointment: (appointmentId: string) => void;
  stopEditingAppointment: () => void;
  setAppointmentNotes: (notes: string) => void;
  saveAppointmentNotes: () => Promise<boolean>;
  
  // Filtering and search
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  
  // Utilities
  clearMessages: () => void;
  getAppointmentsByDate: (date: string) => BarberAppointment[];
  getAppointmentsByStatus: (status: string) => BarberAppointment[];
  getTodayAppointments: () => BarberAppointment[];
  getUpcomingAppointments: () => BarberAppointment[];
}

const BarberAppointmentsContext = createContext<BarberAppointmentsContextType | undefined>(undefined);

const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for real-time data

const initialFilters: AppointmentFilters = {
  status: 'all',
  dateRange: null,
  searchTerm: '',
};

const initialStats: AppointmentStats = {
  totalAppointments: 0,
  confirmedAppointments: 0,
  pendingAppointments: 0,
  cancelledAppointments: 0,
  completedAppointments: 0,
  noShowAppointments: 0,
  todayAppointments: 0,
  weekRevenue: 0,
  monthRevenue: 0,
};

const initialState: BarberAppointmentsState = {
  appointments: [],
  filteredAppointments: [],
  selectedAppointment: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: '',
  successMessage: '',
  filters: initialFilters,
  stats: initialStats,
  hasInitialized: false,
  lastFetch: null,
  isEditingAppointment: false,
  editingAppointmentId: null,
  appointmentNotes: '',
};

export function BarberAppointmentsProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BarberAppointmentsState>(initialState);
  const { user, isBarber } = useAuth();

  // Only provide context if user is actually a barber
  const shouldProvideContext = isBarber();

  // Fetch appointments
  const fetchAppointments = useCallback(async (force: boolean = false) => {
    if (!shouldProvideContext) return;

    const now = Date.now();
    if (!force && state.lastFetch && (now - state.lastFetch) < CACHE_DURATION) {
      return; // Use cached data
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      // Mock data for development - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 400)); // Simulate API delay
      
      const today = new Date();
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      const appointments: BarberAppointment[] = [
        {
          id: '1',
          customerId: 'customer-1',
          customerName: 'Ahmet Yılmaz',
          customerPhone: '0532 123 45 67',
          customerEmail: 'ahmet@example.com',
          date: today.toISOString().split('T')[0],
          time: '14:30',
          status: 'confirmed',
          service: 'Saç Kesimi',
          duration: 45,
          price: 100,
          notes: null,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '2',
          customerId: 'customer-2',
          customerName: 'Mehmet Demir',
          customerPhone: '0541 987 65 43',
          customerEmail: 'mehmet@example.com',
          date: today.toISOString().split('T')[0],
          time: '16:00',
          status: 'pending',
          service: 'Sakal Tıraşı',
          duration: 45,
          price: 80,
          notes: 'Hassas cilde sahip',
          createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        },
        {
          id: '3',
          customerId: 'customer-3',
          customerName: 'Ali Kaya',
          customerPhone: null,
          customerEmail: 'ali@example.com',
          date: tomorrow.toISOString().split('T')[0],
          time: '10:00',
          status: 'confirmed',
          service: 'Komple Bakım',
          duration: 45,
          price: 150,
          notes: null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }
      ];
      
      setState(prev => ({
        ...prev,
        appointments,
        isLoading: false,
        hasInitialized: true,
        lastFetch: now,
      }));

      // Apply current filters
      applyFilters();
    } catch (error) {
      console.error('Failed to fetch appointments:', error);
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Randevular yüklenemedi',
      }));
    }
  }, [shouldProvideContext, state.lastFetch]);

  // Fetch appointment statistics
  const fetchAppointmentStats = useCallback(async () => {
    if (!shouldProvideContext) return;

    try {
      // Mock data for development - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 200)); // Simulate API delay
      
      const stats: AppointmentStats = {
        totalAppointments: 180,
        confirmedAppointments: 145,
        pendingAppointments: 12,
        cancelledAppointments: 15,
        completedAppointments: 150,
        noShowAppointments: 8,
        todayAppointments: 8,
        weekRevenue: 4250,
        monthRevenue: 16800,
      };
      
      setState(prev => ({
        ...prev,
        stats,
      }));
    } catch (error) {
      console.error('Failed to fetch appointment stats:', error);
    }
  }, [shouldProvideContext]);

  // Appointment status actions
  const confirmAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isSaving: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 500));

      // Optimistic update
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'confirmed' as const }
            : apt
        ),
        isSaving: false,
        successMessage: 'Randevu onaylandı',
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to confirm appointment:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Randevu onaylanamadı',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isSaving: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 400));

      // Optimistic update
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'cancelled' as const, notes: reason ? `İptal nedeni: ${reason}` : apt.notes }
            : apt
        ),
        isSaving: false,
        successMessage: 'Randevu iptal edildi',
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to cancel appointment:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Randevu iptal edilemedi',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  const completeAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isSaving: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 300));

      // Optimistic update
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'completed' as const }
            : apt
        ),
        isSaving: false,
        successMessage: 'Randevu tamamlandı',
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to complete appointment:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Randevu tamamlanamadı',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  const markNoShow = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isSaving: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 300));

      // Optimistic update
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, status: 'no_show' as const }
            : apt
        ),
        isSaving: false,
        successMessage: 'Randevu gelmedi olarak işaretlendi',
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to mark no-show:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Randevu güncellenemedi',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  const updateAppointmentNotes = useCallback(async (appointmentId: string, notes: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isSaving: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 300));

      // Optimistic update
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.map(apt => 
          apt.id === appointmentId 
            ? { ...apt, notes }
            : apt
        ),
        isSaving: false,
        successMessage: 'Notlar güncellendi',
        isEditingAppointment: false,
        editingAppointmentId: null,
        appointmentNotes: '',
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to update notes:', error);
      setState(prev => ({
        ...prev,
        isSaving: false,
        error: error instanceof Error ? error.message : 'Notlar güncellenemedi',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  const deleteAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    if (!shouldProvideContext) return false;

    setState(prev => ({ ...prev, isDeleting: true, error: '' }));

    try {
      // Mock API call for development
      await new Promise(resolve => setTimeout(resolve, 400));

      // Remove from state
      setState(prev => ({
        ...prev,
        appointments: prev.appointments.filter(apt => apt.id !== appointmentId),
        isDeleting: false,
        successMessage: 'Randevu silindi',
        selectedAppointment: prev.selectedAppointment?.id === appointmentId ? null : prev.selectedAppointment,
      }));

      applyFilters();
      return true;
    } catch (error) {
      console.error('Failed to delete appointment:', error);
      setState(prev => ({
        ...prev,
        isDeleting: false,
        error: error instanceof Error ? error.message : 'Randevu silinemedi',
      }));
      return false;
    }
  }, [shouldProvideContext]);

  // Selection and editing
  const selectAppointment = useCallback((appointment: BarberAppointment | null) => {
    setState(prev => ({ ...prev, selectedAppointment: appointment }));
  }, []);

  const startEditingAppointment = useCallback((appointmentId: string) => {
    const appointment = state.appointments.find(apt => apt.id === appointmentId);
    if (appointment) {
      setState(prev => ({
        ...prev,
        isEditingAppointment: true,
        editingAppointmentId: appointmentId,
        appointmentNotes: appointment.notes || '',
      }));
    }
  }, [state.appointments]);

  const stopEditingAppointment = useCallback(() => {
    setState(prev => ({
      ...prev,
      isEditingAppointment: false,
      editingAppointmentId: null,
      appointmentNotes: '',
    }));
  }, []);

  const setAppointmentNotes = useCallback((notes: string) => {
    setState(prev => ({ ...prev, appointmentNotes: notes }));
  }, []);

  const saveAppointmentNotes = useCallback(async (): Promise<boolean> => {
    if (!state.editingAppointmentId) return false;
    return await updateAppointmentNotes(state.editingAppointmentId, state.appointmentNotes);
  }, [state.editingAppointmentId, state.appointmentNotes, updateAppointmentNotes]);

  // Filtering and search
  const setFilters = useCallback((newFilters: Partial<AppointmentFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
    }));
    applyFilters();
  }, []);

  const applyFilters = useCallback(() => {
    setState(prev => {
      let filtered = [...prev.appointments];

      // Status filter
      if (prev.filters.status !== 'all') {
        filtered = filtered.filter(apt => apt.status === prev.filters.status);
      }

      // Date range filter
      if (prev.filters.dateRange) {
        const startDate = new Date(prev.filters.dateRange.start);
        const endDate = new Date(prev.filters.dateRange.end);
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.date);
          return aptDate >= startDate && aptDate <= endDate;
        });
      }

      // Search filter
      if (prev.filters.searchTerm) {
        const searchTerm = prev.filters.searchTerm.toLowerCase();
        filtered = filtered.filter(apt => 
          apt.customerName.toLowerCase().includes(searchTerm) ||
          apt.customerEmail.toLowerCase().includes(searchTerm) ||
          (apt.customerPhone && apt.customerPhone.includes(searchTerm))
        );
      }

      return {
        ...prev,
        filteredAppointments: filtered,
      };
    });
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    applyFilters();
  }, [state.filters, applyFilters]);

  // Utility functions
  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: '', successMessage: '' }));
  }, []);

  const getAppointmentsByDate = useCallback((date: string): BarberAppointment[] => {
    return state.appointments.filter(apt => apt.date === date);
  }, [state.appointments]);

  const getAppointmentsByStatus = useCallback((status: string): BarberAppointment[] => {
    return state.appointments.filter(apt => apt.status === status);
  }, [state.appointments]);

  const getTodayAppointments = useCallback((): BarberAppointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsByDate(today);
  }, [getAppointmentsByDate]);

  const getUpcomingAppointments = useCallback((): BarberAppointment[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    return state.appointments.filter(apt => {
      if (apt.date > today) return true;
      if (apt.date === today) {
        const appointmentTime = new Date(`${apt.date}T${apt.time}`);
        return appointmentTime > now;
      }
      return false;
    }).sort((a, b) => {
      const dateA = new Date(`${a.date}T${a.time}`);
      const dateB = new Date(`${b.date}T${b.time}`);
      return dateA.getTime() - dateB.getTime();
    });
  }, [state.appointments]);

  // Auto-fetch on mount
  useEffect(() => {
    if (shouldProvideContext && !state.hasInitialized) {
      fetchAppointments();
      fetchAppointmentStats();
    }
  }, [shouldProvideContext, state.hasInitialized, fetchAppointments, fetchAppointmentStats]);

  const contextValue: BarberAppointmentsContextType = {
    appointments: state.appointments,
    filteredAppointments: state.filteredAppointments,
    selectedAppointment: state.selectedAppointment,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    isDeleting: state.isDeleting,
    error: state.error,
    successMessage: state.successMessage,
    filters: state.filters,
    stats: state.stats,
    hasInitialized: state.hasInitialized,
    isEditingAppointment: state.isEditingAppointment,
    appointmentNotes: state.appointmentNotes,
    fetchAppointments,
    fetchAppointmentStats,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
    updateAppointmentNotes,
    deleteAppointment,
    selectAppointment,
    startEditingAppointment,
    stopEditingAppointment,
    setAppointmentNotes,
    saveAppointmentNotes,
    setFilters,
    resetFilters,
    applyFilters,
    clearMessages,
    getAppointmentsByDate,
    getAppointmentsByStatus,
    getTodayAppointments,
    getUpcomingAppointments,
  };

  // Only provide context if user is a barber
  if (!shouldProvideContext) {
    return <>{children}</>;
  }

  return (
    <BarberAppointmentsContext.Provider value={contextValue}>
      {children}
    </BarberAppointmentsContext.Provider>
  );
}

export function useBarberAppointments() {
  const context = useContext(BarberAppointmentsContext);
  if (context === undefined) {
    throw new Error('useBarberAppointments must be used within a BarberAppointmentsProvider');
  }
  return context;
}