"use client";

import { useState, useEffect, useCallback } from 'react';
import { ProfileService } from '../services/profileService';
import { UserProfile, ProfileFormData } from '../types/profile.types';

interface UseProfileOptions {
  autoFetch?: boolean;
  cacheTimeout?: number; // in milliseconds
}

export function useProfile(options: UseProfileOptions = {}) {
  const { autoFetch = true, cacheTimeout = 10 * 60 * 1000 } = options;
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<number | null>(null);

  const isDataStale = useCallback(() => {
    if (!lastFetched) return true;
    return Date.now() - lastFetched > cacheTimeout;
  }, [lastFetched, cacheTimeout]);

  const fetchProfile = useCallback(async (force = false) => {
    if (!force && !isDataStale() && profile) {
      return profile;
    }

    if (loading) return profile;

    setLoading(true);
    setError(null);

    try {
      const profileData = await ProfileService.getProfile();
      setProfile(profileData);
      setLastFetched(Date.now());
      return profileData;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profil yüklenemedi';
      setError(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  }, [isDataStale, profile, loading]);

  const updateProfile = useCallback(async (data: Partial<ProfileFormData>) => {
    setLoading(true);
    setError(null);

    try {
      const updatedProfile = await ProfileService.updateProfile(data);
      setProfile(updatedProfile);
      setLastFetched(Date.now());
      return { success: true, data: updatedProfile };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Profil güncellenemedi';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProfile = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await ProfileService.deleteProfile();
      setProfile(null);
      setLastFetched(null);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hesap silinemedi';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshProfile = useCallback(async () => {
    return await fetchProfile(true);
  }, [fetchProfile]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const invalidateCache = useCallback(() => {
    setLastFetched(null);
  }, []);

  // Auto-fetch on mount
  useEffect(() => {
    if (autoFetch) {
      fetchProfile();
    }
  }, [autoFetch, fetchProfile]);

  // Computed values
  const displayName = profile ? ProfileService.getDisplayName(profile) : '';
  const userInitials = profile ? ProfileService.getUserInitials(profile) : '';
  const isComplete = profile ? ProfileService.isProfileComplete(profile) : false;
  const roleDisplayName = profile ? ProfileService.getRoleDisplayName(profile.role) : '';

  return {
    // Data
    profile,
    loading,
    error,
    
    // Actions
    fetchProfile,
    updateProfile,
    deleteProfile,
    refreshProfile,
    clearError,
    invalidateCache,
    
    // Computed
    displayName,
    userInitials,
    isComplete,
    roleDisplayName,
    isDataStale: isDataStale(),
  };
}