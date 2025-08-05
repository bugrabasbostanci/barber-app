import { useState, useMemo } from 'react';
import { Appointment, AppointmentFilters } from '../types/appointment.types';

export function useAppointmentFilters(appointments: Appointment[]) {
  const [filters, setFilters] = useState<AppointmentFilters>({});

  const filteredAppointments = useMemo(() => {
    return appointments.filter((appointment) => {
      // Status filter
      if (filters.status && appointment.status !== filters.status) {
        return false;
      }

      // Date filter
      if (filters.date && appointment.date !== filters.date) {
        return false;
      }

      // Staff filter
      if (filters.staffId && appointment.staff.id !== filters.staffId) {
        return false;
      }

      // Search filter
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        const customerName = appointment.customer 
          ? `${appointment.customer.firstName} ${appointment.customer.lastName}`.toLowerCase()
          : appointment.manualCustomerName?.toLowerCase() || '';
        
        const staffName = `${appointment.staff.firstName} ${appointment.staff.lastName}`.toLowerCase();
        const phone = appointment.customer?.phone || appointment.manualCustomerPhone || '';
        
        const matchesSearch = 
          customerName.includes(searchTerm) ||
          staffName.includes(searchTerm) ||
          phone.includes(searchTerm) ||
          appointment.notes?.toLowerCase().includes(searchTerm);

        if (!matchesSearch) {
          return false;
        }
      }

      return true;
    });
  }, [appointments, filters]);

  const updateFilters = (newFilters: Partial<AppointmentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const getFilterCounts = () => {
    const counts = appointments.reduce((acc, appointment) => {
      acc[appointment.status] = (acc[appointment.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: appointments.length,
      confirmed: counts.confirmed || 0,
      pending: counts.pending || 0,
      cancelled: counts.cancelled || 0,
      completed: counts.completed || 0,
    };
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date === today);
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(appointment => appointment.date >= today && appointment.status !== 'cancelled');
  };

  return {
    filters,
    filteredAppointments,
    updateFilters,
    clearFilters,
    getFilterCounts,
    getTodayAppointments,
    getUpcomingAppointments,
  };
}