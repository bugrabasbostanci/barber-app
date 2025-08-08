"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { getCacheConfig, createBarberQueryKey, OPTIMISTIC_CONFIG, getRetryConfig } from './cache-config';

// Types based on the barber API response
export interface BarberAppointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'NO_SHOW';
  notes?: string | null;
  customer?: {
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
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

export interface CreateManualAppointmentData {
  customerType: 'new' | 'existing';
  existingCustomerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  staffId: string;
  startTime: string;
  notes?: string;
}

// Query keys for barber appointments
export const barberAppointmentKeys = {
  all: createBarberQueryKey(['appointments']),
  list: (filters?: { startDate?: string; endDate?: string }) => 
    createBarberQueryKey(['appointments', 'list'], ...(filters ? [filters] : [])),
  dayView: (date: string) => 
    createBarberQueryKey(['appointments', 'day'], date),
  weekView: (startDate: string) => 
    createBarberQueryKey(['appointments', 'week'], startDate),
  monthView: (year: number, month: number) => 
    createBarberQueryKey(['appointments', 'month'], year, month),
};

// Barber appointments API functions
const barberAppointmentsApi = {
  getAppointments: async (filters?: { startDate?: string; endDate?: string }): Promise<BarberAppointment[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.startDate) searchParams.append('startDate', filters.startDate);
    if (filters?.endDate) searchParams.append('endDate', filters.endDate);
    
    const response = await fetch(`/api/barber/appointments?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch barber appointments');
    }
    
    const result = await response.json();
    return result.data;
  },

  createManualAppointment: async (data: CreateManualAppointmentData): Promise<BarberAppointment> => {
    const response = await fetch('/api/barber/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create appointment');
    }
    
    const result = await response.json();
    return result.data;
  }
};

// Get barber appointments with date range filtering
export function useBarberAppointments(filters?: { startDate?: string; endDate?: string }) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('appointments');

  return useQuery({
    queryKey: barberAppointmentKeys.list(filters),
    queryFn: () => barberAppointmentsApi.getAppointments(filters),
    enabled: !!user, // Only run if user is authenticated
    ...cacheConfig,
    ...getRetryConfig('critical'),
  });
}

// Get appointments for a specific day
export function useBarberDayAppointments(date: string) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('appointments');

  return useQuery({
    queryKey: barberAppointmentKeys.dayView(date),
    queryFn: () => barberAppointmentsApi.getAppointments({ startDate: date, endDate: date }),
    enabled: !!user && !!date,
    ...cacheConfig,
    ...getRetryConfig('critical'),
  });
}

// Get appointments for a week range
export function useBarberWeekAppointments(startDate: string) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('appointments');

  // Calculate end date (6 days after start)
  const endDate = useMemo(() => {
    if (!startDate) return '';
    const date = new Date(startDate);
    date.setDate(date.getDate() + 6);
    return date.toISOString().split('T')[0];
  }, [startDate]);

  return useQuery({
    queryKey: barberAppointmentKeys.weekView(startDate),
    queryFn: () => barberAppointmentsApi.getAppointments({ startDate, endDate }),
    enabled: !!user && !!startDate,
    ...cacheConfig,
    ...getRetryConfig('critical'),
  });
}

// Get appointments for a month
export function useBarberMonthAppointments(year: number, month: number) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('appointments');

  const { startDate, endDate } = useMemo(() => {
    if (!year || !month) return { startDate: '', endDate: '' };
    
    const start = new Date(year, month - 1, 1);
    const end = new Date(year, month, 0);
    
    return {
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
    };
  }, [year, month]);

  return useQuery({
    queryKey: barberAppointmentKeys.monthView(year, month),
    queryFn: () => barberAppointmentsApi.getAppointments({ startDate, endDate }),
    enabled: !!user && !!year && !!month,
    ...cacheConfig,
    ...getRetryConfig('critical'),
  });
}

// Create manual appointment mutation
export function useCreateManualAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: barberAppointmentsApi.createManualAppointment,
    onMutate: async (newAppointment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: barberAppointmentKeys.all });

      // Optimistically add the new appointment to relevant queries
      const optimisticAppointment: BarberAppointment = {
        id: `temp-${Date.now()}`,
        date: newAppointment.date,
        startTime: newAppointment.startTime,
        endTime: '', // Will be calculated by the server
        status: 'CONFIRMED',
        notes: newAppointment.notes || null,
        customer: newAppointment.customerType === 'existing' ? null : undefined,
        manualCustomerName: newAppointment.customerType === 'new' ? newAppointment.customerName || null : null,
        manualCustomerPhone: newAppointment.customerType === 'new' ? newAppointment.customerPhone || null : null,
        staff: {
          id: newAppointment.staffId,
          firstName: '',
          lastName: '',
          role: '',
        },
        shop: {
          name: '',
          address: '',
        },
        createdAt: new Date().toISOString(),
      };

      // Update day view
      queryClient.setQueryData<BarberAppointment[]>(
        barberAppointmentKeys.dayView(newAppointment.date),
        (old) => old ? [...old, optimisticAppointment] : [optimisticAppointment]
      );

      return { optimisticAppointment };
    },
    onError: (err, newAppointment, context) => {
      // Remove optimistic appointment on error
      if (context?.optimisticAppointment) {
        queryClient.setQueryData<BarberAppointment[]>(
          barberAppointmentKeys.dayView(newAppointment.date),
          (old) => old?.filter(apt => apt.id !== context.optimisticAppointment.id) || []
        );
      }
    },
    onSuccess: (data, variables) => {
      // Update the day view with the real appointment data
      queryClient.setQueryData<BarberAppointment[]>(
        barberAppointmentKeys.dayView(variables.date),
        (old) => {
          if (!old) return [data];
          // Replace optimistic appointment with real one
          const withoutOptimistic = old.filter(apt => !apt.id.startsWith('temp-'));
          return [...withoutOptimistic, data];
        }
      );
    },
    onSettled: (data, error, variables) => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: barberAppointmentKeys.all });
    },
  });
}

// Custom hook for appointment utilities (barber-specific)
// Update appointment status mutation (confirm/cancel/complete)
export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: BarberAppointment['status'] }) => {
      const response = await fetch(`/api/barber/appointments/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update appointment status');
      }
      
      const result = await response.json();
      return result.data;
    },
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: barberAppointmentKeys.all });

      // Find the original appointment
      let originalAppointment: BarberAppointment | null = null;
      
      // Optimistically update all relevant queries
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: barberAppointmentKeys.all },
        (old) => {
          if (!old) return old;
          return old.map(apt => {
            if (apt.id === id) {
              originalAppointment = apt;
              return { ...apt, status };
            }
            return apt;
          });
        }
      );

      return { originalAppointment };
    },
    onError: (err, { id }, context) => {
      // Rollback optimistic update
      if (context?.originalAppointment) {
        queryClient.setQueriesData<BarberAppointment[]>(
          { queryKey: barberAppointmentKeys.all },
          (old) => {
            if (!old) return old;
            return old.map(apt => 
              apt.id === id ? context.originalAppointment! : apt
            );
          }
        );
      }
    },
    onSuccess: (updatedAppointment, { id }) => {
      // Update with server response
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: barberAppointmentKeys.all },
        (old) => {
          if (!old) return old;
          return old.map(apt => apt.id === id ? updatedAppointment : apt);
        }
      );
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: barberAppointmentKeys.all });
    },
  });
}

// Bulk update appointment status mutation
export function useBulkUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ ids, status }: { ids: string[]; status: BarberAppointment['status'] }) => {
      const response = await fetch('/api/barber/appointments/bulk/status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids, status }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk update appointment status');
      }
      
      const result = await response.json();
      return result.data;
    },
    onMutate: async ({ ids, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: barberAppointmentKeys.all });

      // Store original appointments
      const originalAppointments: BarberAppointment[] = [];
      
      // Optimistically update all relevant queries
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: barberAppointmentKeys.all },
        (old) => {
          if (!old) return old;
          return old.map(apt => {
            if (ids.includes(apt.id)) {
              originalAppointments.push(apt);
              return { ...apt, status };
            }
            return apt;
          });
        }
      );

      return { originalAppointments };
    },
    onError: (err, { ids }, context) => {
      // Rollback optimistic update
      if (context?.originalAppointments) {
        queryClient.setQueriesData<BarberAppointment[]>(
          { queryKey: barberAppointmentKeys.all },
          (old) => {
            if (!old) return old;
            const originalMap = new Map(context.originalAppointments.map(apt => [apt.id, apt]));
            return old.map(apt => originalMap.get(apt.id) || apt);
          }
        );
      }
    },
    onSuccess: (updatedAppointments: BarberAppointment[]) => {
      // Update with server response
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: barberAppointmentKeys.all },
        (old) => {
          if (!old) return old;
          const updatedMap = new Map(updatedAppointments.map((apt: BarberAppointment) => [apt.id, apt]));
          return old.map(apt => updatedMap.get(apt.id) || apt);
        }
      );
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: barberAppointmentKeys.all });
    },
  });
}

// Delete appointment mutation
export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (appointmentId: string) => {
      const response = await fetch(`/api/barber/appointments/${appointmentId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete appointment');
      }
      
      return appointmentId;
    },
    onMutate: async (appointmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: barberAppointmentKeys.all });

      // Find and remove the appointment optimistically
      let removedAppointment: BarberAppointment | null = null;

      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: barberAppointmentKeys.all },
        (old) => {
          if (!old) return old;
          const updated = old.filter(apt => {
            if (apt.id === appointmentId) {
              removedAppointment = apt;
              return false;
            }
            return true;
          });
          return updated;
        }
      );

      return { removedAppointment };
    },
    onError: (err, appointmentId, context) => {
      // Add the appointment back on error
      if (context?.removedAppointment) {
        queryClient.setQueriesData<BarberAppointment[]>(
          { queryKey: barberAppointmentKeys.all },
          (old) => old ? [...old, context.removedAppointment!] : [context.removedAppointment!]
        );
      }
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: barberAppointmentKeys.all });
    },
  });
}

export function useBarberAppointmentUtils() {
  const { data: appointments = [] } = useBarberAppointments();

  return useMemo(() => {
    const getTodaysAppointments = (): BarberAppointment[] => {
      const today = new Date().toISOString().split('T')[0];
      return appointments.filter(apt => apt.date === today && apt.status !== 'CANCELLED');
    };

    const getUpcomingAppointments = (): BarberAppointment[] => {
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const currentTime = now.toTimeString().slice(0, 5);

      return appointments.filter(apt => {
        if (apt.status === 'CANCELLED' || apt.status === 'COMPLETED') return false;
        
        // Future dates
        if (apt.date > today) return true;
        
        // Today's appointments that haven't started yet
        if (apt.date === today && apt.startTime > currentTime) return true;
        
        return false;
      }).sort((a, b) => {
        const dateCompare = a.date.localeCompare(b.date);
        if (dateCompare !== 0) return dateCompare;
        return a.startTime.localeCompare(b.startTime);
      });
    };

    const getAppointmentsByStatus = (status: BarberAppointment['status']): BarberAppointment[] => {
      return appointments.filter(apt => apt.status === status);
    };

    const getAppointmentsByDateRange = (startDate: string, endDate: string): BarberAppointment[] => {
      return appointments.filter(apt => apt.date >= startDate && apt.date <= endDate);
    };

    const getCustomerName = (appointment: BarberAppointment): string => {
      if (appointment.manualCustomerName) {
        return appointment.manualCustomerName;
      }
      if (appointment.customer) {
        return `${appointment.customer.firstName} ${appointment.customer.lastName}`;
      }
      return 'Müşteri bilgisi yok';
    };

    const getCustomerPhone = (appointment: BarberAppointment): string => {
      return appointment.manualCustomerPhone || appointment.customer?.phone || '';
    };

    // Statistics
    const getStatsForDateRange = (startDate: string, endDate: string) => {
      const rangeAppointments = getAppointmentsByDateRange(startDate, endDate);
      
      return {
        total: rangeAppointments.length,
        completed: rangeAppointments.filter(apt => apt.status === 'COMPLETED').length,
        cancelled: rangeAppointments.filter(apt => apt.status === 'CANCELLED').length,
        noShow: rangeAppointments.filter(apt => apt.status === 'NO_SHOW').length,
        upcoming: rangeAppointments.filter(apt => 
          apt.status === 'SCHEDULED' || apt.status === 'CONFIRMED'
        ).length,
      };
    };

    return {
      appointments,
      getTodaysAppointments,
      getUpcomingAppointments,
      getAppointmentsByStatus,
      getAppointmentsByDateRange,
      getCustomerName,
      getCustomerPhone,
      getStatsForDateRange,
    };
  }, [appointments]);
}