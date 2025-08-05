"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/features/auth';
import { UserProfile, ProfileFormData } from '../types/profile.types';
import { ProfileService } from '../services/profileService';

// Query keys
export const profileKeys = {
  all: ['profile'] as const,
  userProfile: (userId?: string) => [...profileKeys.all, userId] as const,
};

// Get user profile query
export function useProfileQuery() {
  const { user } = useAuth();

  return useQuery({
    queryKey: profileKeys.userProfile(user?.id),
    queryFn: ProfileService.getProfile,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 10 * 60 * 1000, // 10 minutes - profile data changes less frequently
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Update profile mutation  
export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: (data: Partial<ProfileFormData>) => ProfileService.updateProfile(data),
    onMutate: async (newProfile) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: profileKeys.userProfile(user?.id) });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(
        profileKeys.userProfile(user?.id)
      );

      // Optimistically update to the new value
      queryClient.setQueryData<UserProfile>(
        profileKeys.userProfile(user?.id),
        (old) => old ? { ...old, ...newProfile } : old
      );

      // Return a context object with the snapshotted value
      return { previousProfile };
    },
    onError: (err, newProfile, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      queryClient.setQueryData(
        profileKeys.userProfile(user?.id),
        context?.previousProfile
      );
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: profileKeys.userProfile(user?.id) });
    },
  });
}

// Delete profile mutation
export function useDeleteProfile() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: ProfileService.deleteProfile,
    onSuccess: () => {
      // Clear all profile data on successful deletion
      queryClient.removeQueries({ queryKey: profileKeys.all });
      // You might also want to sign out the user here
    },
  });
}