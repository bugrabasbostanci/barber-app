"use client";

import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { BACKGROUND_SYNC, createBarberQueryKey } from './cache-config';

// Custom hook for background synchronization of appointment data
export function useBackgroundSync() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const intervalsRef = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
  useEffect(() => {
    if (!user || !BACKGROUND_SYNC.appointmentSync.enabled) {
      return;
    }

    // Clear existing intervals
    Object.values(intervalsRef.current).forEach(interval => {
      clearInterval(interval);
    });
    intervalsRef.current = {};

    // Set up appointment sync interval
    const appointmentSyncInterval = setInterval(() => {
      // Invalidate appointment queries to trigger background refetch
      queryClient.invalidateQueries({
        queryKey: createBarberQueryKey(['appointments']),
        type: 'active', // Only invalidate currently active queries
        refetchType: 'none', // Don't immediately refetch, just mark as stale
      });

      // Trigger a background refetch for critical appointment data
      queryClient.refetchQueries({
        queryKey: createBarberQueryKey(['appointments']),
        type: 'active',
      });
    }, BACKGROUND_SYNC.appointmentSync.interval);

    intervalsRef.current.appointments = appointmentSyncInterval;

    // Set up high priority sync for real-time data
    const highPriorityInterval = setInterval(() => {
      BACKGROUND_SYNC.priorities.HIGH.forEach(queryType => {
        queryClient.invalidateQueries({
          queryKey: createBarberQueryKey([queryType]),
          type: 'active',
          refetchType: 'none',
        });
      });
    }, BACKGROUND_SYNC.intervals.HIGH);

    intervalsRef.current.highPriority = highPriorityInterval;

    // Set up medium priority sync
    const mediumPriorityInterval = setInterval(() => {
      BACKGROUND_SYNC.priorities.MEDIUM.forEach(queryType => {
        queryClient.invalidateQueries({
          queryKey: createBarberQueryKey([queryType]),
          type: 'active',
          refetchType: 'none',
        });
      });
    }, BACKGROUND_SYNC.intervals.MEDIUM);

    intervalsRef.current.mediumPriority = mediumPriorityInterval;

    // Set up low priority sync
    const lowPriorityInterval = setInterval(() => {
      BACKGROUND_SYNC.priorities.LOW.forEach(queryType => {
        queryClient.invalidateQueries({
          queryKey: createBarberQueryKey([queryType]),
          type: 'active',
          refetchType: 'none',
        });
      });
    }, BACKGROUND_SYNC.intervals.LOW);

    intervalsRef.current.lowPriority = lowPriorityInterval;

    // Cleanup function
    return () => {
      Object.values(intervalsRef.current).forEach(interval => {
        clearInterval(interval);
      });
      intervalsRef.current = {};
    };
  }, [user, queryClient]);

  // Manual sync function for immediate background sync
  const triggerManualSync = (priority: 'HIGH' | 'MEDIUM' | 'LOW' = 'HIGH') => {
    const queryTypes = BACKGROUND_SYNC.priorities[priority];
    
    queryTypes.forEach(queryType => {
      queryClient.invalidateQueries({
        queryKey: createBarberQueryKey([queryType]),
        type: 'active',
      });
      
      // Trigger background refetch
      queryClient.refetchQueries({
        queryKey: createBarberQueryKey([queryType]),
        type: 'active',
      });
    });
  };

  // Force sync all data (useful for when app comes back to foreground)
  const forceSync = () => {
    Object.values(BACKGROUND_SYNC.priorities).flat().forEach(queryType => {
      queryClient.invalidateQueries({
        queryKey: createBarberQueryKey([queryType]),
      });
      
      queryClient.refetchQueries({
        queryKey: createBarberQueryKey([queryType]),
        type: 'active',
      });
    });
  };

  return {
    triggerManualSync,
    forceSync,
    isEnabled: BACKGROUND_SYNC.appointmentSync.enabled && !!user,
  };
}

// Hook for handling app visibility changes to optimize background sync
export function useAppVisibilitySync() {
  const { forceSync } = useBackgroundSync();
  
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // App came back to foreground, sync all data
        forceSync();
      }
    };

    // Listen for visibility changes
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Also listen for focus events as a fallback
    window.addEventListener('focus', forceSync);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', forceSync);
    };
  }, [forceSync]);
}

// Hook for network-aware sync (pauses sync when offline)
export function useNetworkAwareSync() {
  const { triggerManualSync } = useBackgroundSync();
  
  useEffect(() => {
    const handleOnline = () => {
      // When back online, sync high priority data immediately
      triggerManualSync('HIGH');
    };

    const handleOffline = () => {
      // Could implement offline queue here if needed
      console.log('Background sync paused due to network unavailability');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [triggerManualSync]);
}