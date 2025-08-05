import { useState, useEffect } from 'react';
import { AppointmentService } from '../services/appointmentService';
import { Appointment, AppointmentFilters } from '../types/appointment.types';

export function useAppointments(initialFilters?: AppointmentFilters) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<AppointmentFilters>(initialFilters || {});

  const fetchAppointments = async (currentFilters?: AppointmentFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await AppointmentService.getAppointments(currentFilters || filters);
      setAppointments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch appointments');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<AppointmentFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchAppointments(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchAppointments({});
  };

  const refreshAppointments = () => {
    fetchAppointments();
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  return {
    appointments,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refreshAppointments,
  };
}