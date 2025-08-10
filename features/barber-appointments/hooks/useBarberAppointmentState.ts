"use client";

import { useState, useCallback } from 'react';
import { BarberAppointmentState, AppointmentFilters, AppointmentStats, BarberAppointment } from '../types';

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

const initialState: BarberAppointmentState = {
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

export function useBarberAppointmentState() {
  const [state, setState] = useState<BarberAppointmentState>(initialState);

  // State updaters
  const updateState = useCallback((updates: Partial<BarberAppointmentState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    updateState({ isLoading: loading });
  }, [updateState]);

  const setSaving = useCallback((saving: boolean) => {
    updateState({ isSaving: saving });
  }, [updateState]);

  const setDeleting = useCallback((deleting: boolean) => {
    updateState({ isDeleting: deleting });
  }, [updateState]);

  const setError = useCallback((error: string) => {
    updateState({ error, successMessage: '' });
  }, [updateState]);

  const setSuccess = useCallback((successMessage: string) => {
    updateState({ successMessage, error: '' });
  }, [updateState]);

  const clearMessages = useCallback(() => {
    updateState({ error: '', successMessage: '' });
  }, [updateState]);

  // Data setters
  const setAppointments = useCallback((appointments: BarberAppointment[]) => {
    updateState({ 
      appointments, 
      hasInitialized: true,
      lastFetch: Date.now()
    });
  }, [updateState]);

  const setFilteredAppointments = useCallback((filteredAppointments: BarberAppointment[]) => {
    updateState({ filteredAppointments });
  }, [updateState]);

  const setSelectedAppointment = useCallback((selectedAppointment: BarberAppointment | null) => {
    updateState({ selectedAppointment });
  }, [updateState]);

  const setStats = useCallback((stats: AppointmentStats) => {
    updateState({ stats });
  }, [updateState]);

  const setFilters = useCallback((filters: Partial<AppointmentFilters>) => {
    updateState({ 
      filters: { ...state.filters, ...filters }
    });
  }, [updateState, state.filters]);

  const resetFilters = useCallback(() => {
    updateState({ filters: initialFilters });
  }, [updateState]);

  // Editing state
  const startEditingAppointment = useCallback((appointmentId: string) => {
    const appointment = state.appointments.find(apt => apt.id === appointmentId);
    updateState({
      isEditingAppointment: true,
      editingAppointmentId: appointmentId,
      appointmentNotes: appointment?.notes || ''
    });
  }, [updateState, state.appointments]);

  const stopEditingAppointment = useCallback(() => {
    updateState({
      isEditingAppointment: false,
      editingAppointmentId: null,
      appointmentNotes: ''
    });
  }, [updateState]);

  const setAppointmentNotes = useCallback((notes: string) => {
    updateState({ appointmentNotes: notes });
  }, [updateState]);

  // Cache helpers - removed needsRefresh function to avoid TypeScript issues

  return {
    // State
    ...state,
    
    // State updaters
    updateState,
    setLoading,
    setSaving,
    setDeleting,
    setError,
    setSuccess,
    clearMessages,
    
    // Data setters
    setAppointments,
    setFilteredAppointments,
    setSelectedAppointment,
    setStats,
    setFilters,
    resetFilters,
    
    // Editing
    startEditingAppointment,
    stopEditingAppointment,
    setAppointmentNotes,
  };
}