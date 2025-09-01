"use client";

import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useBarberAppointmentsStore, useBarberAvailabilityStore } from '@/lib/stores/barber';
import { toast } from 'sonner';

export interface OptimisticOperation {
  id: string;
  type: 'appointment' | 'availability' | 'bulk';
  timestamp: number;
  rollback: () => void;
}

export function useOptimisticUpdates() {
  const queryClient = useQueryClient();
  const appointmentsStore = useBarberAppointmentsStore();
  const availabilityStore = useBarberAvailabilityStore();
  const pendingOperations = useRef<Map<string, OptimisticOperation>>(new Map());

  // Create optimistic operation tracker
  const createOperation = useCallback((type: OptimisticOperation['type'], rollback: () => void): string => {
    const id = `${type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const operation: OptimisticOperation = {
      id,
      type,
      timestamp: Date.now(),
      rollback,
    };
    
    pendingOperations.current.set(id, operation);
    return id;
  }, []);

  // Complete optimistic operation
  const completeOperation = useCallback((operationId: string, success: boolean = true) => {
    const operation = pendingOperations.current.get(operationId);
    if (operation) {
      if (!success) {
        // Execute rollback if operation failed
        try {
          operation.rollback();
          toast.error('Change rolled back', {
            description: 'Operation failed and returned to previous state.',
          });
        } catch (error) {
          console.error('Rollback failed:', error);
          toast.error('Rollback error', {
            description: 'Change could not be rolled back. Page will refresh.',
          });
          // Force refresh if rollback fails
          window.location.reload();
        }
      } else {
        toast.success('Change saved', {
          description: 'Your operation completed successfully.',
        });
      }
      
      pendingOperations.current.delete(operationId);
    }
  }, []);

  // Get pending operations count
  const getPendingCount = useCallback(() => {
    return pendingOperations.current.size;
  }, []);

  // Check if specific operation is pending
  const isOperationPending = useCallback((operationId: string) => {
    return pendingOperations.current.has(operationId);
  }, []);

  // Get operations by type
  const getOperationsByType = useCallback((type: OptimisticOperation['type']) => {
    return Array.from(pendingOperations.current.values()).filter(op => op.type === type);
  }, []);

  // Clear all pending operations (useful for cleanup)
  const clearAllOperations = useCallback((executeRollbacks: boolean = false) => {
    if (executeRollbacks) {
      Array.from(pendingOperations.current.values()).forEach(operation => {
        try {
          operation.rollback();
        } catch (error) {
          console.error('Rollback failed during cleanup:', error);
        }
      });
      toast.info('All pending changes rolled back');
    }
    
    pendingOperations.current.clear();
  }, []);

  // Appointment-specific optimistic updates
  const optimisticAppointmentUpdate = useCallback(async (
    appointmentId: string,
    updates: any,
    apiCall: () => Promise<any>
  ) => {
    const originalAppointments = [...appointmentsStore.appointments];
    
    // Apply optimistic update
    const optimisticAppointments = originalAppointments.map(apt =>
      apt.id === appointmentId ? { ...apt, ...updates } : apt
    );
    appointmentsStore.setAppointments(optimisticAppointments);

    // Create rollback operation
    const operationId = createOperation('appointment', () => {
      appointmentsStore.setAppointments(originalAppointments);
    });

    try {
      const result = await apiCall();
      completeOperation(operationId, true);
      return result;
    } catch (error) {
      completeOperation(operationId, false);
      throw error;
    }
  }, [appointmentsStore, createOperation, completeOperation]);

  // Availability-specific optimistic updates
  const optimisticAvailabilityUpdate = useCallback(async (
    updates: any,
    apiCall: () => Promise<any>
  ) => {
    const originalWeeklySchedule = { ...availabilityStore.weeklySchedule };
    const originalCustomSlots = [...availabilityStore.customSlots];
    
    // Apply optimistic update
    if (updates.weeklySchedule) {
      availabilityStore.setWeeklySchedule(updates.weeklySchedule);
    }
    if (updates.customSlots) {
      // Handle custom slots update logic here
      updates.customSlots.forEach((slot: any) => {
        if (slot.id) {
          availabilityStore.updateCustomSlot(slot.id, slot);
        } else {
          availabilityStore.addCustomSlot(slot);
        }
      });
    }

    // Create rollback operation
    const operationId = createOperation('availability', () => {
      availabilityStore.setWeeklySchedule(originalWeeklySchedule);
      // Reset custom slots by clearing and re-adding
      availabilityStore.clearCache();
      originalCustomSlots.forEach(slot => availabilityStore.addCustomSlot(slot));
    });

    try {
      const result = await apiCall();
      completeOperation(operationId, true);
      return result;
    } catch (error) {
      completeOperation(operationId, false);
      throw error;
    }
  }, [availabilityStore, createOperation, completeOperation]);

  // Bulk operations with optimistic updates
  const optimisticBulkUpdate = useCallback(async (
    appointments: any[],
    updates: any,
    apiCall: () => Promise<any>
  ) => {
    const originalAppointments = [...appointmentsStore.appointments];
    const appointmentIds = appointments.map(apt => apt.id);
    
    // Apply optimistic update
    const optimisticAppointments = originalAppointments.map(apt =>
      appointmentIds.includes(apt.id) ? { ...apt, ...updates } : apt
    );
    appointmentsStore.setAppointments(optimisticAppointments);

    // Create rollback operation
    const operationId = createOperation('bulk', () => {
      appointmentsStore.setAppointments(originalAppointments);
    });

    try {
      const result = await apiCall();
      completeOperation(operationId, true);
      return result;
    } catch (error) {
      completeOperation(operationId, false);
      throw error;
    }
  }, [appointmentsStore, createOperation, completeOperation]);

  // Network status aware optimistic updates
  const safeOptimisticUpdate = useCallback(async (
    updateFn: () => Promise<any>,
    fallbackFn?: () => void
  ) => {
    if (!navigator.onLine) {
      toast.warning('No internet connection', {
        description: 'Changes will be applied when connection is restored.',
      });
      
      if (fallbackFn) {
        fallbackFn();
      }
      return;
    }

    try {
      return await updateFn();
    } catch (error) {
      if (!navigator.onLine) {
        toast.error('Connection lost', {
          description: 'Please check your internet connection.',
        });
      }
      throw error;
    }
  }, []);

  return {
    // Operation management
    createOperation,
    completeOperation,
    getPendingCount,
    isOperationPending,
    getOperationsByType,
    clearAllOperations,
    
    // Optimistic update helpers
    optimisticAppointmentUpdate,
    optimisticAvailabilityUpdate,
    optimisticBulkUpdate,
    safeOptimisticUpdate,
    
    // State
    pendingOperations: pendingOperations.current,
  };
}

// Hook for optimistic UI feedback
export function useOptimisticFeedback() {
  const { getPendingCount } = useOptimisticUpdates();
  
  const showOptimisticFeedback = useCallback((message: string, type: 'success' | 'info' | 'warning' = 'info') => {
    const pendingCount = getPendingCount();
    const description = pendingCount > 0 
      ? `${pendingCount} changes processing...`
      : 'Change applied';
    
    toast[type](message, { description });
  }, [getPendingCount]);

  return {
    showOptimisticFeedback,
    getPendingCount,
  };
}