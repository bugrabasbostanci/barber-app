"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';

// Types for barber settings
export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: 'BARBER' | 'EMPLOYEE' | 'ADMIN';
  phone?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BarberProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  phone?: string;
  businessSettings?: {
    shopName?: string;
    shopAddress?: string;
    workingHours?: {
      start: string;
      end: string;
    };
    appointmentDuration?: number;
    bookingWindowDays?: number;
    cancellationHours?: number;
  };
}

export interface UpdateProfileData {
  firstName?: string;
  lastName?: string;
  phone?: string;
}

export interface UpdateBusinessSettingsData {
  shopName?: string;
  shopAddress?: string;
  workingHours?: {
    start: string;
    end: string;
  };
  appointmentDuration?: number;
  bookingWindowDays?: number;
  cancellationHours?: number;
}

// Query keys for settings
export const settingsKeys = {
  all: ['barber', 'settings'] as const,
  profile: () => [...settingsKeys.all, 'profile'] as const,
  staff: () => [...settingsKeys.all, 'staff'] as const,
  businessSettings: () => [...settingsKeys.all, 'business'] as const,
  preferences: () => [...settingsKeys.all, 'preferences'] as const,
};

// Settings API functions
const settingsApi = {
  getProfile: async (): Promise<BarberProfile> => {
    const response = await fetch('/api/profile');
    if (!response.ok) {
      throw new Error('Failed to fetch profile');
    }
    
    const result = await response.json();
    return result.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<BarberProfile> => {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }
    
    const result = await response.json();
    return result.data;
  },

  getStaffMembers: async (): Promise<StaffMember[]> => {
    const response = await fetch('/api/staff');
    if (!response.ok) {
      throw new Error('Failed to fetch staff members');
    }
    
    const result = await response.json();
    return result.data;
  },

  updateBusinessSettings: async (data: UpdateBusinessSettingsData): Promise<BarberProfile> => {
    const response = await fetch('/api/business-settings', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update business settings');
    }
    
    const result = await response.json();
    return result.data;
  },

  changePassword: async (data: { currentPassword: string; newPassword: string }): Promise<void> => {
    const response = await fetch('/api/auth/update-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }
  },
};

// Get barber profile
export function useBarberProfile() {
  const { user } = useAuth();

  return useQuery({
    queryKey: settingsKeys.profile(),
    queryFn: settingsApi.getProfile,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get staff members
export function useStaffMembers() {
  const { user } = useAuth();

  return useQuery({
    queryKey: settingsKeys.staff(),
    queryFn: settingsApi.getStaffMembers,
    enabled: !!user,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Update profile mutation
export function useUpdateBarberProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateProfile,
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.profile() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<BarberProfile>(
        settingsKeys.profile()
      );

      // Optimistically update to the new value
      queryClient.setQueryData<BarberProfile>(
        settingsKeys.profile(),
        (old) => old ? { ...old, ...newProfile } : old
      );

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        settingsKeys.profile(),
        context?.previousProfile
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

// Update business settings mutation
export function useUpdateBusinessSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: settingsApi.updateBusinessSettings,
    onMutate: async (newSettings) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: settingsKeys.profile() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<BarberProfile>(
        settingsKeys.profile()
      );

      // Optimistically update the business settings
      queryClient.setQueryData<BarberProfile>(
        settingsKeys.profile(),
        (old) => old ? { 
          ...old, 
          businessSettings: { 
            ...old.businessSettings, 
            ...newSettings 
          } 
        } : old
      );

      return { previousProfile };
    },
    onError: (err, newSettings, context) => {
      // Rollback on error
      queryClient.setQueryData(
        settingsKeys.profile(),
        context?.previousProfile
      );
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: settingsKeys.profile() });
    },
  });
}

// Change password mutation
export function useChangePassword() {
  return useMutation({
    mutationFn: settingsApi.changePassword,
    // No optimistic updates for password changes
    // Success/error handling should be done in the component
  });
}

// Custom hook for settings utilities
export function useBarberSettingsUtils() {
  const { data: profile } = useBarberProfile();
  const { data: staffMembers = [] } = useStaffMembers();

  return useMemo(() => {
    const getActiveStaffMembers = (): StaffMember[] => {
      return staffMembers.filter(member => member.isActive);
    };

    const getInactiveStaffMembers = (): StaffMember[] => {
      return staffMembers.filter(member => !member.isActive);
    };

    const getStaffMembersByRole = (role: StaffMember['role']): StaffMember[] => {
      return staffMembers.filter(member => member.role === role && member.isActive);
    };

    const getFullName = (staff?: StaffMember | Pick<StaffMember, 'firstName' | 'lastName'>): string => {
      if (!staff) return '';
      return `${staff.firstName} ${staff.lastName}`.trim();
    };

    const getBarberFullName = (): string => {
      if (!profile) return '';
      return `${profile.firstName} ${profile.lastName}`.trim();
    };

    const getWorkingHours = () => {
      const defaultHours = { start: '09:30', end: '21:30' };
      return profile?.businessSettings?.workingHours || defaultHours;
    };

    const getAppointmentDuration = (): number => {
      return profile?.businessSettings?.appointmentDuration || 45; // Default 45 minutes
    };

    const getBookingWindowDays = (): number => {
      return profile?.businessSettings?.bookingWindowDays || 7; // Default 7 days
    };

    const getCancellationHours = (): number => {
      return profile?.businessSettings?.cancellationHours || 2; // Default 2 hours
    };

    const getShopInfo = () => {
      return {
        name: profile?.businessSettings?.shopName || 'Berber Salonu',
        address: profile?.businessSettings?.shopAddress || '',
      };
    };

    // Validation helpers
    const isProfileComplete = (): boolean => {
      if (!profile) return false;
      
      const requiredFields = [
        profile.firstName,
        profile.lastName,
        profile.email,
      ];
      
      return requiredFields.every(field => field && field.trim() !== '');
    };

    const isBusinessSettingsComplete = (): boolean => {
      if (!profile?.businessSettings) return false;
      
      const settings = profile.businessSettings;
      return !!(
        settings.shopName &&
        settings.shopAddress &&
        settings.workingHours?.start &&
        settings.workingHours?.end
      );
    };

    // Statistics
    const getSettingsStats = () => {
      const totalStaff = staffMembers.length;
      const activeStaff = getActiveStaffMembers().length;
      const barbers = getStaffMembersByRole('BARBER').length;
      const employees = getStaffMembersByRole('EMPLOYEE').length;

      return {
        totalStaff,
        activeStaff,
        inactiveStaff: totalStaff - activeStaff,
        barbers,
        employees,
        profileComplete: isProfileComplete(),
        businessSettingsComplete: isBusinessSettingsComplete(),
      };
    };

    return {
      profile,
      staffMembers,
      getActiveStaffMembers,
      getInactiveStaffMembers,
      getStaffMembersByRole,
      getFullName,
      getBarberFullName,
      getWorkingHours,
      getAppointmentDuration,
      getBookingWindowDays,
      getCancellationHours,
      getShopInfo,
      isProfileComplete,
      isBusinessSettingsComplete,
      getSettingsStats,
    };
  }, [profile, staffMembers]);
}