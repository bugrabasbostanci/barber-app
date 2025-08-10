"use client";

import { useCallback } from 'react';
import { BarberAppointmentService } from '../services/appointmentService';
import { BarberAppointment } from '../types';
import { useBarberAppointmentState } from './useBarberAppointmentState';

export function useBarberAppointmentActions() {
  const {
    appointments,
    filters,
    editingAppointmentId,
    appointmentNotes,
    setLoading,
    setSaving,
    setDeleting,
    setError,
    setSuccess,
    setAppointments,
    setFilteredAppointments,
    setSelectedAppointment,
    setStats,
    stopEditingAppointment,
    ...state
  } = useBarberAppointmentState();

  const needsRefresh = state.hasInitialized === false || 
    (state.lastFetch !== null && Date.now() - state.lastFetch > 2 * 60 * 1000);

  // Data fetching
  const fetchAppointments = useCallback(async (force = false) => {
    if (!force && !needsRefresh) return;

    setLoading(true);
    setError('');

    try {
      const data = await BarberAppointmentService.fetchAppointments();
      setAppointments(data);
      applyFilters(data, filters);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  }, [needsRefresh, setLoading, setError, setAppointments, filters]);

  const fetchAppointmentStats = useCallback(async () => {
    try {
      const stats = await BarberAppointmentService.fetchAppointmentStats();
      if (stats) {
        setStats(stats);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  }, [setStats]);

  // Appointment management
  const confirmAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await BarberAppointmentService.confirmAppointment(appointmentId);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Appointment confirmed successfully');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to confirm appointment');
      return false;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setError, setSuccess, fetchAppointments]);

  const cancelAppointment = useCallback(async (appointmentId: string, reason?: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await BarberAppointmentService.cancelAppointment(appointmentId, reason);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Appointment cancelled successfully');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to cancel appointment');
      return false;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setError, setSuccess, fetchAppointments]);

  const completeAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await BarberAppointmentService.completeAppointment(appointmentId);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Appointment completed successfully');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to complete appointment');
      return false;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setError, setSuccess, fetchAppointments]);

  const markNoShow = useCallback(async (appointmentId: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await BarberAppointmentService.markNoShow(appointmentId);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Appointment marked as no-show');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to mark no-show');
      return false;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setError, setSuccess, fetchAppointments]);

  const updateAppointmentNotes = useCallback(async (appointmentId: string, notes: string): Promise<boolean> => {
    setSaving(true);
    try {
      const success = await BarberAppointmentService.updateAppointmentNotes(appointmentId, notes);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Notes updated successfully');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to update notes');
      return false;
    } finally {
      setSaving(false);
    }
  }, [setSaving, setError, setSuccess, fetchAppointments]);

  const saveAppointmentNotes = useCallback(async (): Promise<boolean> => {
    if (!editingAppointmentId) return false;
    
    const success = await updateAppointmentNotes(editingAppointmentId, appointmentNotes);
    if (success) {
      stopEditingAppointment();
    }
    return success;
  }, [editingAppointmentId, appointmentNotes, updateAppointmentNotes, stopEditingAppointment]);

  const deleteAppointment = useCallback(async (appointmentId: string): Promise<boolean> => {
    setDeleting(true);
    try {
      const success = await BarberAppointmentService.deleteAppointment(appointmentId);
      if (success) {
        await fetchAppointments(true);
        setSuccess('Appointment deleted successfully');
      }
      return success;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to delete appointment');
      return false;
    } finally {
      setDeleting(false);
    }
  }, [setDeleting, setError, setSuccess, fetchAppointments]);

  // Filtering and search
  const applyFilters = useCallback((appointmentsToFilter = appointments, currentFilters = filters) => {
    let filtered = [...appointmentsToFilter];

    // Status filter
    if (currentFilters.status !== 'all') {
      filtered = filtered.filter(apt => apt.status === currentFilters.status);
    }

    // Date range filter
    if (currentFilters.dateRange) {
      const startDate = new Date(currentFilters.dateRange.start);
      const endDate = new Date(currentFilters.dateRange.end);
      filtered = filtered.filter(apt => {
        const aptDate = new Date(apt.date);
        return aptDate >= startDate && aptDate <= endDate;
      });
    }

    // Search filter
    if (currentFilters.searchTerm) {
      const searchLower = currentFilters.searchTerm.toLowerCase();
      filtered = filtered.filter(apt =>
        apt.customerName.toLowerCase().includes(searchLower) ||
        apt.customerEmail.toLowerCase().includes(searchLower) ||
        (apt.customerPhone && apt.customerPhone.toLowerCase().includes(searchLower)) ||
        apt.service.toLowerCase().includes(searchLower)
      );
    }

    setFilteredAppointments(filtered);
  }, [appointments, filters, setFilteredAppointments]);

  // Utility functions
  const getAppointmentsByDate = useCallback((date: string): BarberAppointment[] => {
    return appointments.filter(apt => apt.date === date);
  }, [appointments]);

  const getAppointmentsByStatus = useCallback((status: string): BarberAppointment[] => {
    return appointments.filter(apt => apt.status === status);
  }, [appointments]);

  const getTodayAppointments = useCallback((): BarberAppointment[] => {
    const today = new Date().toISOString().split('T')[0];
    return getAppointmentsByDate(today);
  }, [getAppointmentsByDate]);

  const getUpcomingAppointments = useCallback((): BarberAppointment[] => {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().substring(0, 5);

    return appointments.filter(apt => {
      if (apt.date > today) return true;
      if (apt.date === today && apt.time > currentTime) return true;
      return false;
    }).sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.time.localeCompare(b.time);
    });
  }, [appointments]);

  return {
    // State (spread from useBarberAppointmentState)
    ...state,
    appointments,
    filters,
    editingAppointmentId,
    appointmentNotes,
    
    // Actions
    fetchAppointments,
    fetchAppointmentStats,
    confirmAppointment,
    cancelAppointment,
    completeAppointment,
    markNoShow,
    updateAppointmentNotes,
    saveAppointmentNotes,
    deleteAppointment,
    selectAppointment: setSelectedAppointment,
    applyFilters,
    
    // Utilities
    getAppointmentsByDate,
    getAppointmentsByStatus,
    getTodayAppointments,
    getUpcomingAppointments,
  };
}