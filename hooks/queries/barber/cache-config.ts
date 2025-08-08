"use client";

// Cache configuration for barber-specific React Query hooks
// This file defines consistent caching strategies across all barber hooks

export const CACHE_TIMES = {
  // Real-time data that changes frequently
  REAL_TIME: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  },
  
  // Data that changes moderately
  MODERATE: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchInterval: false, // No auto refetch
  },
  
  // Settings and configuration data that changes less frequently
  SETTINGS: {
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
    refetchInterval: false,
  },
  
  // Static data that rarely changes
  STATIC: {
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    refetchInterval: false,
  },
} as const;

// Query key factory for consistent key generation
export const createBarberQueryKey = (base: string[], ...segments: (string | number | object)[]) => {
  return ['barber', base, ...segments].flat();
};

// Cache invalidation patterns for related data
export const INVALIDATION_PATTERNS = {
  // When appointments change, invalidate related statistics
  onAppointmentChange: [
    ['barber', 'statistics'],
    ['barber', 'appointments'],
  ],
  
  // When availability changes, invalidate appointment queries
  onAvailabilityChange: [
    ['barber', 'availability'],
    ['barber', 'appointments'], // Because availability affects bookable slots
  ],
  
  // When settings change, invalidate all related queries
  onSettingsChange: [
    ['barber', 'settings'],
    ['barber', 'appointments'], // Business hours affect appointments
    ['barber', 'availability'], // Working hours affect availability
  ],
  
  // When user profile changes
  onProfileChange: [
    ['profile'],
    ['barber', 'settings'],
  ],
} as const;

// Optimistic update configurations
export const OPTIMISTIC_CONFIG = {
  appointments: {
    // Optimistically add new appointments
    enableOptimisticCreation: true,
    // Optimistically update appointment status
    enableOptimisticUpdates: true,
    // Rollback timeout in case of network issues
    rollbackTimeout: 10000, // 10 seconds
  },
  
  availability: {
    // Optimistically add/remove time blocks
    enableOptimisticCreation: true,
    enableOptimisticDeletion: true,
    rollbackTimeout: 5000, // 5 seconds
  },
  
  settings: {
    // Optimistically update profile and business settings
    enableOptimisticUpdates: true,
    rollbackTimeout: 8000, // 8 seconds
  },
} as const;

// Query retry configuration
export const RETRY_CONFIG = {
  // Default retry configuration
  default: {
    retry: 3,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  
  // For critical operations (appointments, payments)
  critical: {
    retry: 5,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
  },
  
  // For non-critical operations (statistics, settings)
  nonCritical: {
    retry: 2,
    retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 10000),
  },
} as const;

// Background sync configuration for appointment updates
export const BACKGROUND_SYNC = {
  // Sync priorities
  priorities: {
    HIGH: ['appointments'], // Critical for real-time appointment management
    MEDIUM: ['availability', 'settings'], // Important but less time-sensitive
    LOW: ['statistics', 'profile'], // Nice to have, can be stale
  },
  
  // Sync intervals when app is in background
  intervals: {
    HIGH: 30 * 1000, // 30 seconds - for appointment updates
    MEDIUM: 2 * 60 * 1000, // 2 minutes
    LOW: 5 * 60 * 1000, // 5 minutes
  },
  
  // Background sync for appointment updates
  appointmentSync: {
    enabled: true,
    interval: 30 * 1000, // Sync every 30 seconds
    maxRetries: 3,
    retryDelay: 5000, // 5 seconds between retries
  },
} as const;

// Helper function to get cache config by data type
export const getCacheConfig = (type: 'appointments' | 'availability' | 'settings' | 'statistics') => {
  switch (type) {
    case 'appointments':
      return CACHE_TIMES.REAL_TIME; // 2-minute cache for real-time appointment data
    case 'availability':
      return CACHE_TIMES.SETTINGS; // 10-minute cache for availability settings
    case 'settings':
      return CACHE_TIMES.SETTINGS; // 10-minute cache for settings
    case 'statistics':
      return CACHE_TIMES.REAL_TIME; // Statistics need to be fresh for business insights
    default:
      return CACHE_TIMES.MODERATE;
  }
};

// Helper function to get retry config by operation type
export const getRetryConfig = (type: 'critical' | 'nonCritical' | 'default' = 'default') => {
  return RETRY_CONFIG[type] || RETRY_CONFIG.default;
};