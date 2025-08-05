"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { UserProfile, ProfileFormData } from '../types/profile.types';
import { ProfileService } from '../services/profileService';

interface ProfileState {
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string;
  successMessage: string;
  
  // Form state
  isEditing: boolean;
  editForm: ProfileFormData;
  
  // Validation errors
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  
  // Flags
  hasInitialized: boolean;
  lastFetch: number | null;
}

interface ProfileContextType {
  // State
  profile: UserProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string;
  successMessage: string;
  isEditing: boolean;
  editForm: ProfileFormData;
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  hasInitialized: boolean;
  
  // Actions
  fetchProfile: (force?: boolean) => Promise<void>;
  saveProfile: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  setIsEditing: (editing: boolean) => void;
  updateEditForm: (field: keyof ProfileFormData, value: string) => void;
  resetEditForm: () => void;
  clearMessages: () => void;
  
  // Utilities
  getUserDisplayName: () => string;
  isFormValid: () => boolean;
  hasFormChanges: () => boolean;
  validateForm: () => boolean;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

const initialState: ProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  isDeleting: false,
  error: '',
  successMessage: '',
  isEditing: false,
  editForm: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
  },
  phoneError: '',
  firstNameError: '',
  lastNameError: '',
  hasInitialized: false,
  lastFetch: null,
};

// Validation helpers
const validatePhone = (phone: string): string => {
  if (!phone.trim()) return '';
  
  if (!ProfileService.validatePhone(phone)) {
    return 'Geçerli bir telefon numarası girin (örn: 0532 123 45 67)';
  }
  
  return '';
};

const validateName = (name: string, fieldName: string): string => {
  if (!name.trim()) {
    return `${fieldName} gereklidir`;
  }
  
  if (!ProfileService.validateName(name)) {
    return `${fieldName} en az 2 karakter olmalı ve sadece harf içermeli`;
  }
  
  return '';
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>(initialState);
  const { user } = useAuth();

  // Auto-fetch on mount
  useEffect(() => {
    if (user && !state.hasInitialized) {
      fetchProfile();
    }
  }, [user]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchProfile = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    
    // Skip if recently fetched and not forced
    if (!force && state.lastFetch && (now - state.lastFetch) < CACHE_DURATION) {
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: '' }));

    try {
      const profileData = await ProfileService.getProfile();
      setState(prev => ({
        ...prev,
        profile: profileData,
        hasInitialized: true,
        lastFetch: now,
        isLoading: false,
        error: '',
        // Reset form with fresh data when not editing
        editForm: prev.isEditing ? prev.editForm : {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          email: profileData.email,
        },
      }));
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profil yüklenemedi',
        isLoading: false,
        hasInitialized: true,
      }));
    }
  }, [state.lastFetch, state.isEditing]);

  const validateForm = useCallback((): boolean => {
    const phoneErr = validatePhone(state.editForm.phone);
    const firstNameErr = validateName(state.editForm.firstName, 'Ad');
    const lastNameErr = validateName(state.editForm.lastName, 'Soyad');

    setState(prev => ({
      ...prev,
      phoneError: phoneErr,
      firstNameError: firstNameErr,
      lastNameError: lastNameErr,
    }));

    return !phoneErr && !firstNameErr && !lastNameErr;
  }, [state.editForm]);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!validateForm()) {
      return false;
    }

    setState(prev => ({ ...prev, isSaving: true, error: '', successMessage: '' }));

    try {
      const formData = {
        firstName: state.editForm.firstName.trim(),
        lastName: state.editForm.lastName.trim(),
        phone: state.editForm.phone.trim(),
        email: state.editForm.email, // Keep email as is
      };

      const updatedProfile = await ProfileService.updateProfile(formData);
      
      // Update local state on success
      setState(prev => ({
        ...prev,
        profile: updatedProfile,
        isEditing: false,
        isSaving: false,
        successMessage: 'Profil bilgileriniz başarıyla güncellendi',
        lastFetch: Date.now(),
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Profil güncellenemedi',
        isSaving: false,
      }));
      return false;
    }
  }, [state.editForm, validateForm]);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    setState(prev => ({ ...prev, isDeleting: true, error: '' }));

    try {
      await ProfileService.deleteProfile();
      setState(prev => ({
        ...prev,
        isDeleting: false,
        successMessage: 'Hesabınız başarıyla silindi',
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Hesap silinemedi',
        isDeleting: false,
      }));
      return false;
    }
  }, []);

  const setIsEditing = useCallback((editing: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isEditing: editing,
      // Clear validation errors when entering edit mode
      phoneError: '',
      firstNameError: '',
      lastNameError: '',
    }));
  }, []);

  const updateEditForm = useCallback((field: keyof ProfileFormData, value: string) => {
    let processedValue = value;
    
    // Auto-format based on field type
    if (field === 'firstName' || field === 'lastName') {
      processedValue = ProfileService.formatNameInput(value);
    } else if (field === 'phone') {
      processedValue = ProfileService.formatPhoneInput(value);
    }

    setState(prev => ({
      ...prev,
      editForm: {
        ...prev.editForm,
        [field]: processedValue,
      },
    }));

    // Real-time validation
    if (field === 'phone') {
      const phoneErr = validatePhone(processedValue);
      setState(prev => ({ ...prev, phoneError: phoneErr }));
    } else if (field === 'firstName') {
      const firstNameErr = validateName(processedValue, 'Ad');
      setState(prev => ({ ...prev, firstNameError: firstNameErr }));
    } else if (field === 'lastName') {
      const lastNameErr = validateName(processedValue, 'Soyad');
      setState(prev => ({ ...prev, lastNameError: lastNameErr }));
    }
  }, []);

  const resetEditForm = useCallback(() => {
    if (state.profile) {
      setState(prev => ({
        ...prev,
        editForm: {
          firstName: state.profile?.firstName || '',
          lastName: state.profile?.lastName || '',
          phone: state.profile?.phone || '',
          email: state.profile?.email || '',
        },
        phoneError: '',
        firstNameError: '',
        lastNameError: '',
      }));
    }
  }, [state.profile]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: '', successMessage: '' }));
  }, []);

  // Utilities
  const getUserDisplayName = useCallback((): string => {
    return state.profile ? ProfileService.getDisplayName(state.profile) : 'Kullanıcı';
  }, [state.profile]);

  const isFormValid = useCallback((): boolean => {
    return !state.phoneError && 
           !state.firstNameError && 
           !state.lastNameError &&
           state.editForm.firstName.trim() !== '' &&
           state.editForm.lastName.trim() !== '';
  }, [state.phoneError, state.firstNameError, state.lastNameError, state.editForm]);

  const hasFormChanges = useCallback((): boolean => {
    if (!state.profile) return false;
    
    return state.editForm.firstName !== (state.profile.firstName || '') ||
           state.editForm.lastName !== (state.profile.lastName || '') ||
           state.editForm.phone !== (state.profile.phone || '');
  }, [state.profile, state.editForm]);

  const contextValue: ProfileContextType = {
    profile: state.profile,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    isDeleting: state.isDeleting,
    error: state.error,
    successMessage: state.successMessage,
    isEditing: state.isEditing,
    editForm: state.editForm,
    phoneError: state.phoneError,
    firstNameError: state.firstNameError,
    lastNameError: state.lastNameError,
    hasInitialized: state.hasInitialized,
    fetchProfile,
    saveProfile,
    deleteAccount,
    setIsEditing,
    updateEditForm,
    resetEditForm,
    clearMessages,
    getUserDisplayName,
    isFormValid,
    hasFormChanges,
    validateForm,
  };

  return (
    <ProfileContext.Provider value={contextValue}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfileContext() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }
  return context;
}