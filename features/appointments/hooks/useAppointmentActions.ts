"use client";

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  BarberAppointment, 
  CustomerAppointment,
  CreateManualAppointmentData,
  UpdateAppointmentData,
  BulkUpdateAppointmentData,
  BaseAppointment
} from '../types';
import { appointmentService } from '../services/appointmentService';
import { appointmentQueryKeys, getInvalidationKeys } from '../services/queryKeys';

// Customer appointment actions
export function useCancelAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentService.customer.cancelAppointment,
    onMutate: async (appointmentId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: appointmentQueryKeys.myAppointments() });

      // Snapshot the previous value
      const previousAppointments = queryClient.getQueryData<CustomerAppointment[]>(
        appointmentQueryKeys.myAppointments()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<CustomerAppointment[]>(
        appointmentQueryKeys.myAppointments(),
        (old) => 
          old?.map(apt => 
            apt.id === appointmentId 
              ? { ...apt, status: 'CANCELLED' as const }
              : apt
          ) ?? old
      );

      return { previousAppointments };
    },
    onError: (err, appointmentId, context) => {
      // Rollback on error
      if (context?.previousAppointments) {
        queryClient.setQueryData(
          appointmentQueryKeys.myAppointments(),
          context.previousAppointments
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries(getInvalidationKeys.customer());
    },
  });
}

// Barber appointment actions
export function useCreateManualAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentService.barber.createManualAppointment,
    onMutate: async (newAppointment) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(getInvalidationKeys.barber());

      // Create optimistic appointment
      const optimisticAppointment: BarberAppointment = {
        id: `temp-${Date.now()}`,
        date: newAppointment.date,
        startTime: newAppointment.startTime,
        endTime: '', // Will be calculated by server
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

      // Update day view optimistically
      queryClient.setQueryData<BarberAppointment[]>(
        appointmentQueryKeys.dayView(newAppointment.date),
        (old) => old ? [...old, optimisticAppointment] : [optimisticAppointment]
      );

      return { optimisticAppointment };
    },
    onError: (err, newAppointment, context) => {
      // Remove optimistic appointment on error
      if (context?.optimisticAppointment) {
        queryClient.setQueryData<BarberAppointment[]>(
          appointmentQueryKeys.dayView(newAppointment.date),
          (old) => old?.filter(apt => apt.id !== context.optimisticAppointment.id) || []
        );
      }
    },
    onSuccess: (data, variables) => {
      // Replace optimistic appointment with real data
      queryClient.setQueryData<BarberAppointment[]>(
        appointmentQueryKeys.dayView(variables.date),
        (old) => {
          if (!old) return [data];
          const withoutOptimistic = old.filter(apt => !apt.id.startsWith('temp-'));
          return [...withoutOptimistic, data];
        }
      );
    },
    onSettled: (data, error, variables) => {
      // Invalidate related queries
      queryClient.invalidateQueries(getInvalidationKeys.barber());
      queryClient.invalidateQueries(...getInvalidationKeys.date(variables.date));
    },
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: BaseAppointment['status'] }) =>
      appointmentService.barber.updateAppointmentStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries(getInvalidationKeys.barber());

      let originalAppointment: BarberAppointment | null = null;
      
      // Optimistically update all relevant queries
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: [...appointmentQueryKeys.all, 'barber'] },
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
          { queryKey: [...appointmentQueryKeys.all, 'barber'] },
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
        { queryKey: [...appointmentQueryKeys.all, 'barber'] },
        (old) => {
          if (!old) return old;
          return old.map(apt => apt.id === id ? updatedAppointment : apt);
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(getInvalidationKeys.barber());
    },
  });
}

export function useBulkUpdateAppointmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentService.barber.bulkUpdateStatus,
    onMutate: async ({ ids, status }) => {
      await queryClient.cancelQueries(getInvalidationKeys.barber());

      const originalAppointments: BarberAppointment[] = [];
      
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: [...appointmentQueryKeys.all, 'barber'] },
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
      if (context?.originalAppointments) {
        queryClient.setQueriesData<BarberAppointment[]>(
          { queryKey: [...appointmentQueryKeys.all, 'barber'] },
          (old) => {
            if (!old) return old;
            const originalMap = new Map(context.originalAppointments.map(apt => [apt.id, apt]));
            return old.map(apt => originalMap.get(apt.id) || apt);
          }
        );
      }
    },
    onSuccess: (updatedAppointments: BarberAppointment[]) => {
      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: [...appointmentQueryKeys.all, 'barber'] },
        (old) => {
          if (!old) return old;
          const updatedMap = new Map(updatedAppointments.map(apt => [apt.id, apt]));
          return old.map(apt => updatedMap.get(apt.id) || apt);
        }
      );
    },
    onSettled: () => {
      queryClient.invalidateQueries(getInvalidationKeys.barber());
    },
  });
}

export function useDeleteAppointment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: appointmentService.barber.deleteAppointment,
    onMutate: async (appointmentId) => {
      await queryClient.cancelQueries(getInvalidationKeys.barber());

      let removedAppointment: BarberAppointment | null = null;

      queryClient.setQueriesData<BarberAppointment[]>(
        { queryKey: [...appointmentQueryKeys.all, 'barber'] },
        (old) => {
          if (!old) return old;
          return old.filter(apt => {
            if (apt.id === appointmentId) {
              removedAppointment = apt;
              return false;
            }
            return true;
          });
        }
      );

      return { removedAppointment };
    },
    onError: (err, appointmentId, context) => {
      if (context?.removedAppointment) {
        queryClient.setQueriesData<BarberAppointment[]>(
          { queryKey: [...appointmentQueryKeys.all, 'barber'] },
          (old) => old ? [...old, context.removedAppointment!] : [context.removedAppointment!]
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries(getInvalidationKeys.barber());
    },
  });
}