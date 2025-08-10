"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/auth-context';
import { useMemo } from 'react';
import { getCacheConfig, createBarberQueryKey, OPTIMISTIC_CONFIG, getRetryConfig } from './cache-config';

// Types for availability management
export interface TimeBlock {
  id: string;
  date: string;
  startTime: string | null;
  endTime: string | null;
  reason: string;
  isFullDay: boolean;
  staffId: string;
  staff: {
    firstName: string;
    lastName: string;
  };
}

export interface BlockedDate {
  date: string;
  isFullDay: boolean;
  startTime: string | null;
  endTime: string | null;
  staffId: string;
  reason: string;
}

export interface CreateTimeBlockData {
  date: string;
  staffId: string;
  startTime?: string;
  endTime?: string;
  reason: string;
  isFullDay: boolean;
}

export interface UpdateTimeBlockData extends CreateTimeBlockData {
  id: string;
}

// Query keys for availability
export const availabilityKeys = {
  all: createBarberQueryKey(['availability']),
  timeBlocks: (filters?: { staffId?: string; date?: string }) => 
    createBarberQueryKey(['availability', 'timeBlocks'], ...(filters ? [filters] : [])),
  blockedDates: (filters?: { staffId?: string; startDate?: string; endDate?: string }) => 
    createBarberQueryKey(['availability', 'blockedDates'], ...(filters ? [filters] : [])),
  staffAvailability: (staffId: string, date: string) => 
    createBarberQueryKey(['availability', 'staff'], staffId, date),
};

// Availability API functions
const availabilityApi = {
  getTimeBlocks: async (filters?: { staffId?: string; date?: string }): Promise<TimeBlock[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.staffId) searchParams.append('staffId', filters.staffId);
    if (filters?.date) searchParams.append('date', filters.date);
    
    const response = await fetch(`/api/time-blocks?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch time blocks');
    }
    
    const result = await response.json();
    return result.data;
  },

  createTimeBlock: async (data: CreateTimeBlockData): Promise<TimeBlock> => {
    const response = await fetch('/api/time-blocks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to create time block');
    }
    
    const result = await response.json();
    return result.timeBlock;
  },

  updateTimeBlock: async (data: UpdateTimeBlockData): Promise<TimeBlock> => {
    const { id, ...updateData } = data;
    const response = await fetch(`/api/time-blocks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update time block');
    }
    
    const result = await response.json();
    return result.timeBlock;
  },

  deleteTimeBlock: async (id: string): Promise<void> => {
    const response = await fetch(`/api/time-blocks/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to delete time block');
    }
  },

  getBlockedDates: async (filters?: { staffId?: string; startDate?: string; endDate?: string }): Promise<BlockedDate[]> => {
    const searchParams = new URLSearchParams();
    if (filters?.staffId) searchParams.append('staffId', filters.staffId);
    if (filters?.startDate) searchParams.append('startDate', filters.startDate);
    if (filters?.endDate) searchParams.append('endDate', filters.endDate);
    
    const response = await fetch(`/api/blocked-dates?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch blocked dates');
    }
    
    const result = await response.json();
    return result.data;
  },
};

// Get time blocks with filtering
export function useTimeBlocks(filters?: { staffId?: string; date?: string }) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('availability');

  return useQuery({
    queryKey: availabilityKeys.timeBlocks(filters),
    queryFn: () => availabilityApi.getTimeBlocks(filters),
    enabled: !!user, // Only run if user is authenticated
    ...cacheConfig,
    ...getRetryConfig('default'),
  });
}

// Get blocked dates with filtering
export function useBlockedDates(filters?: { staffId?: string; startDate?: string; endDate?: string }) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('availability');

  return useQuery({
    queryKey: availabilityKeys.blockedDates(filters),
    queryFn: () => availabilityApi.getBlockedDates(filters),
    enabled: !!user,
    ...cacheConfig,
    ...getRetryConfig('default'),
  });
}

// Get availability for a specific staff member on a specific date
export function useStaffAvailability(staffId: string, date: string) {
  const { user } = useAuth();
  const cacheConfig = getCacheConfig('availability');

  return useQuery({
    queryKey: availabilityKeys.staffAvailability(staffId, date),
    queryFn: () => Promise.all([
      availabilityApi.getTimeBlocks({ staffId, date }),
      availabilityApi.getBlockedDates({ staffId, startDate: date, endDate: date }),
    ]).then(([timeBlocks, blockedDates]) => ({
      timeBlocks,
      blockedDates,
    })),
    enabled: !!user && !!staffId && !!date,
    ...cacheConfig,
    ...getRetryConfig('default'),
  });
}

// Create time block mutation
export function useCreateTimeBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: availabilityApi.createTimeBlock,
    onMutate: async (newTimeBlock) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      // Optimistically add the new time block
      const optimisticTimeBlock: TimeBlock = {
        id: `temp-${Date.now()}`,
        date: newTimeBlock.date,
        startTime: newTimeBlock.isFullDay ? null : newTimeBlock.startTime || null,
        endTime: newTimeBlock.isFullDay ? null : newTimeBlock.endTime || null,
        reason: newTimeBlock.reason,
        isFullDay: newTimeBlock.isFullDay,
        staffId: newTimeBlock.staffId,
        staff: {
          firstName: '',
          lastName: '',
        },
      };

      // Update time blocks query
      queryClient.setQueryData<TimeBlock[]>(
        availabilityKeys.timeBlocks({ staffId: newTimeBlock.staffId, date: newTimeBlock.date }),
        (old) => old ? [...old, optimisticTimeBlock] : [optimisticTimeBlock]
      );

      return { optimisticTimeBlock };
    },
    onError: (err, newTimeBlock, context) => {
      // Remove optimistic time block on error
      if (context?.optimisticTimeBlock) {
        queryClient.setQueryData<TimeBlock[]>(
          availabilityKeys.timeBlocks({ staffId: newTimeBlock.staffId, date: newTimeBlock.date }),
          (old) => old?.filter(block => block.id !== context.optimisticTimeBlock.id) || []
        );
      }
    },
    onSuccess: (data, variables) => {
      // Update with real data
      queryClient.setQueryData<TimeBlock[]>(
        availabilityKeys.timeBlocks({ staffId: variables.staffId, date: variables.date }),
        (old) => {
          if (!old) return [data];
          // Replace optimistic block with real one
          const withoutOptimistic = old.filter(block => !block.id.startsWith('temp-'));
          return [...withoutOptimistic, data];
        }
      );
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Update time block mutation
export function useUpdateTimeBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: availabilityApi.updateTimeBlock,
    onMutate: async (updatedTimeBlock) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      // Store the original time block for rollback
      let originalTimeBlock: TimeBlock | null = null;

      // Optimistically update all relevant queries
      queryClient.setQueriesData<TimeBlock[]>(
        { queryKey: availabilityKeys.timeBlocks() },
        (old) => {
          if (!old) return old;
          return old.map(block => {
            if (block.id === updatedTimeBlock.id) {
              originalTimeBlock = block;
              return {
                ...block,
                startTime: updatedTimeBlock.isFullDay ? null : updatedTimeBlock.startTime || null,
                endTime: updatedTimeBlock.isFullDay ? null : updatedTimeBlock.endTime || null,
                reason: updatedTimeBlock.reason,
                isFullDay: updatedTimeBlock.isFullDay,
              };
            }
            return block;
          });
        }
      );

      return { originalTimeBlock };
    },
    onError: (err, variables, context) => {
      // Rollback optimistic update
      if (context?.originalTimeBlock) {
        queryClient.setQueriesData<TimeBlock[]>(
          { queryKey: availabilityKeys.timeBlocks() },
          (old) => {
            if (!old) return old;
            return old.map(block => 
              block.id === variables.id ? context.originalTimeBlock! : block
            );
          }
        );
      }
    },
    onSuccess: (updatedTimeBlock) => {
      // Update with server response
      queryClient.setQueriesData<TimeBlock[]>(
        { queryKey: availabilityKeys.timeBlocks() },
        (old) => {
          if (!old) return old;
          return old.map(block => block.id === updatedTimeBlock.id ? updatedTimeBlock : block);
        }
      );
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Delete time block mutation
export function useDeleteTimeBlock() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: availabilityApi.deleteTimeBlock,
    onMutate: async (timeBlockId) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      // Find and remove the time block optimistically
      let removedTimeBlock: TimeBlock | null = null;

      // Update all time blocks queries
      queryClient.setQueriesData<TimeBlock[]>(
        { queryKey: availabilityKeys.timeBlocks() },
        (old) => {
          if (!old) return old;
          const updated = old.filter(block => {
            if (block.id === timeBlockId) {
              removedTimeBlock = block;
              return false;
            }
            return true;
          });
          return updated;
        }
      );

      return { removedTimeBlock };
    },
    onError: (err, timeBlockId, context) => {
      // Add the time block back on error
      if (context?.removedTimeBlock) {
        queryClient.setQueriesData<TimeBlock[]>(
          { queryKey: availabilityKeys.timeBlocks() },
          (old) => old ? [...old, context.removedTimeBlock!] : [context.removedTimeBlock!]
        );
      }
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Bulk time block operations
export function useBulkCreateTimeBlocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeBlocks: CreateTimeBlockData[]) => {
      const response = await fetch('/api/time-blocks/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ timeBlocks }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk create time blocks');
      }
      
      const result = await response.json();
      return result.timeBlocks;
    },
    onMutate: async (newTimeBlocks) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      // Create optimistic time blocks
      const optimisticTimeBlocks: TimeBlock[] = newTimeBlocks.map((block, index) => ({
        id: `temp-bulk-${Date.now()}-${index}`,
        date: block.date,
        startTime: block.isFullDay ? null : block.startTime || null,
        endTime: block.isFullDay ? null : block.endTime || null,
        reason: block.reason,
        isFullDay: block.isFullDay,
        staffId: block.staffId,
        staff: {
          firstName: '',
          lastName: '',
        },
      }));

      // Update all time blocks queries
      queryClient.setQueriesData<TimeBlock[]>(
        { queryKey: availabilityKeys.timeBlocks() },
        (old) => old ? [...old, ...optimisticTimeBlocks] : optimisticTimeBlocks
      );

      return { optimisticTimeBlocks };
    },
    onError: (err, newTimeBlocks, context) => {
      // Remove optimistic time blocks on error
      if (context?.optimisticTimeBlocks) {
        const optimisticIds = new Set(context.optimisticTimeBlocks.map(block => block.id));
        queryClient.setQueriesData<TimeBlock[]>(
          { queryKey: availabilityKeys.timeBlocks() },
          (old) => old?.filter(block => !optimisticIds.has(block.id)) || []
        );
      }
    },
    onSuccess: (createdTimeBlocks, variables, context) => {
      // Replace optimistic blocks with real ones
      if (context?.optimisticTimeBlocks) {
        const optimisticIds = new Set(context.optimisticTimeBlocks.map(block => block.id));
        queryClient.setQueriesData<TimeBlock[]>(
          { queryKey: availabilityKeys.timeBlocks() },
          (old) => {
            if (!old) return createdTimeBlocks;
            const withoutOptimistic = old.filter(block => !optimisticIds.has(block.id));
            return [...withoutOptimistic, ...createdTimeBlocks];
          }
        );
      }
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Bulk delete time blocks
export function useBulkDeleteTimeBlocks() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (timeBlockIds: string[]) => {
      const response = await fetch('/api/time-blocks/bulk', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: timeBlockIds }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to bulk delete time blocks');
      }
      
      return timeBlockIds;
    },
    onMutate: async (timeBlockIds) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: availabilityKeys.all });

      // Store removed time blocks for rollback
      const removedTimeBlocks: TimeBlock[] = [];

      // Remove time blocks optimistically
      queryClient.setQueriesData<TimeBlock[]>(
        { queryKey: availabilityKeys.timeBlocks() },
        (old) => {
          if (!old) return old;
          return old.filter(block => {
            if (timeBlockIds.includes(block.id)) {
              removedTimeBlocks.push(block);
              return false;
            }
            return true;
          });
        }
      );

      return { removedTimeBlocks };
    },
    onError: (err, timeBlockIds, context) => {
      // Add the time blocks back on error
      if (context?.removedTimeBlocks) {
        queryClient.setQueriesData<TimeBlock[]>(
          { queryKey: availabilityKeys.timeBlocks() },
          (old) => old ? [...old, ...context.removedTimeBlocks] : context.removedTimeBlocks
        );
      }
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Quick availability toggle mutation
export function useToggleAvailability() {
  const queryClient = useQueryClient();
  const createTimeBlock = useCreateTimeBlock();
  const deleteTimeBlock = useDeleteTimeBlock();

  return useMutation({
    mutationFn: async ({ date, staffId, isBlocking }: { date: string; staffId: string; isBlocking: boolean }) => {
      if (isBlocking) {
        // Create a full-day block
        return createTimeBlock.mutateAsync({
          date,
          staffId,
          reason: 'Müsait değil',
          isFullDay: true,
        });
      } else {
        // Find and delete full-day blocks for this date
        const timeBlocks = queryClient.getQueryData<TimeBlock[]>(
          availabilityKeys.timeBlocks({ staffId, date })
        ) || [];
        
        const fullDayBlock = timeBlocks.find(block => 
          block.date === date && block.staffId === staffId && block.isFullDay
        );
        
        if (fullDayBlock) {
          return deleteTimeBlock.mutateAsync(fullDayBlock.id);
        }
        
        return Promise.resolve();
      }
    },
    onSettled: () => {
      // Always invalidate related queries
      queryClient.invalidateQueries({ queryKey: availabilityKeys.all });
    },
  });
}

// Custom hook for availability utilities
export function useAvailabilityUtils() {
  const { data: timeBlocks = [] } = useTimeBlocks();
  const { data: blockedDates = [] } = useBlockedDates();

  return useMemo(() => {
    const isDateFullyBlocked = (date: string, staffId?: string): boolean => {
      const blocksForDate = timeBlocks.filter(block => 
        block.date === date && (staffId ? block.staffId === staffId : true)
      );
      return blocksForDate.some(block => block.isFullDay);
    };

    const getTimeBlocksForDate = (date: string, staffId?: string): TimeBlock[] => {
      return timeBlocks.filter(block => 
        block.date === date && (staffId ? block.staffId === staffId : true)
      );
    };

    const getBlockedDatesInRange = (startDate: string, endDate: string, staffId?: string): BlockedDate[] => {
      return blockedDates.filter(block => 
        block.date >= startDate && 
        block.date <= endDate && 
        (staffId ? block.staffId === staffId : true)
      );
    };

    const isTimeSlotBlocked = (date: string, time: string, staffId?: string): boolean => {
      const blocksForDate = timeBlocks.filter(block => 
        block.date === date && (staffId ? block.staffId === staffId : true)
      );

      return blocksForDate.some(block => {
        // Full day blocks
        if (block.isFullDay) return true;

        // Time range blocks
        if (block.startTime && block.endTime) {
          return time >= block.startTime && time < block.endTime;
        }

        return false;
      });
    };

    const getAvailableHours = (date: string, staffId?: string): string[] => {
      const workingHours = [
        '09:30', '10:15', '11:00', '11:45', '12:30', '13:15', '14:00', '14:45', 
        '15:30', '16:15', '17:00', '17:45', '18:30', '19:15', '20:00', '20:45'
      ];

      if (isDateFullyBlocked(date, staffId)) {
        return [];
      }

      return workingHours.filter(hour => !isTimeSlotBlocked(date, hour, staffId));
    };

    // Statistics
    const getAvailabilityStats = (startDate: string, endDate: string, staffId?: string) => {
      const rangeBlocks = getBlockedDatesInRange(startDate, endDate, staffId);
      const fullDayBlocks = rangeBlocks.filter(block => block.isFullDay).length;
      const partialBlocks = rangeBlocks.filter(block => !block.isFullDay).length;

      return {
        totalBlocks: rangeBlocks.length,
        fullDayBlocks,
        partialBlocks,
        blockedDates: [...new Set(rangeBlocks.map(block => block.date))].length,
      };
    };

    // Enhanced utilities with optimistic state awareness
    const isPendingOptimisticUpdate = (date: string, staffId?: string): boolean => {
      // Check if there are any temporary/optimistic time blocks for this date
      const blocksForDate = timeBlocks.filter(block => 
        block.date === date && (staffId ? block.staffId === staffId : true)
      );
      return blocksForDate.some(block => block.id.startsWith('temp-'));
    };

    const getOptimisticTimeBlocks = (date: string, staffId?: string): TimeBlock[] => {
      return timeBlocks.filter(block => 
        block.date === date && 
        (staffId ? block.staffId === staffId : true) &&
        block.id.startsWith('temp-')
      );
    };

    return {
      timeBlocks,
      blockedDates,
      isDateFullyBlocked,
      getTimeBlocksForDate,
      getBlockedDatesInRange,
      isTimeSlotBlocked,
      getAvailableHours,
      getAvailabilityStats,
      isPendingOptimisticUpdate,
      getOptimisticTimeBlocks,
    };
  }, [timeBlocks, blockedDates]);
}