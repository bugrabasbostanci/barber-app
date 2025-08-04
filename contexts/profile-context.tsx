"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile as useProfileQuery, useUpdateProfile, useDeleteProfile } from '@/hooks/queries/useProfile';

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

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
  
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  const cleanPhone = phone.replace(/\s/g, "");
  
  if (!phoneRegex.test(cleanPhone)) {
    return 'Geçerli bir telefon numarası girin (örn: 0532 123 45 67)';
  }
  
  return '';
};

const validateName = (name: string, fieldName: string): string => {
  if (!name.trim()) {
    return `${fieldName} gereklidir`;
  }
  
  if (name.trim().length < 2) {
    return `${fieldName} en az 2 karakter olmalıdır`;
  }
  
  if (name.trim().length > 50) {
    return `${fieldName} 50 karakterden fazla olamaz`;
  }
  
  // Check for invalid characters
  const nameRegex = /^[a-zA-ZğĞıİöÖüÜşŞçÇ\s]+$/;
  if (!nameRegex.test(name.trim())) {
    return `${fieldName} sadece harf içerebilir`;
  }
  
  return '';
};

const formatPhoneInput = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, "");
  
  if (cleaned.startsWith("+90")) {
    const digits = cleaned.slice(3);
    if (digits.length <= 10) {
      return "+90 " + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
    }
    return "+90 " + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  if (cleaned.startsWith("0")) {
    const digits = cleaned.slice(1);
    if (digits.length <= 10) {
      return "0" + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
    }
    return "0" + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  return cleaned.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
};

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<ProfileState>(initialState);
  const { user } = useAuth();

  // React Query hooks for data fetching
  const { data: profileData, isLoading: queryLoading, error: queryError } = useProfileQuery();
  const updateMutation = useUpdateProfile();
  const deleteMutation = useDeleteProfile();

  // Sync React Query data with local state
  useEffect(() => {
    if (profileData) {
      setState(prev => ({
        ...prev,
        profile: profileData,
        hasInitialized: true,
        // Reset form with fresh data when not editing
        editForm: prev.isEditing ? prev.editForm : {
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          phone: profileData.phone || '',
          email: profileData.email,
        },
      }));
    }
  }, [profileData]);

  // Sync loading states
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: queryLoading,
      isSaving: updateMutation.isPending,
      isDeleting: deleteMutation.isPending,
      error: queryError?.message || updateMutation.error?.message || deleteMutation.error?.message || '',
      successMessage: updateMutation.isSuccess ? 'Profil başarıyla güncellendi!' : '',
    }));
  }, [queryLoading, updateMutation.isPending, updateMutation.isSuccess, updateMutation.error, deleteMutation.isPending, deleteMutation.error, queryError]);

  // Fetch profile - now powered by React Query
  const fetchProfile = useCallback(async (force: boolean = false) => {
    // React Query handles caching and fetching automatically
    // This function now mainly exists for API compatibility
    // Force refetch if needed
    if (force) {
      // React Query refetch will happen automatically due to invalidation
      return Promise.resolve();
    }
  }, []);

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

    try {
      const formData = {
        firstName: state.editForm.firstName.trim(),
        lastName: state.editForm.lastName.trim(),
        phone: state.editForm.phone.trim(),
        email: state.editForm.email, // Keep email as is
      };

      await updateMutation.mutateAsync(formData);
      
      // Update local state on success
      setState(prev => ({
        ...prev,
        isEditing: false,
        successMessage: 'Profil bilgileriniz başarıyla güncellendi',
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save profile:', error);
      return false;
    }
  }, [state.editForm, validateForm, updateMutation]);

  const deleteAccount = useCallback(async (): Promise<boolean> => {
    try {
      await deleteMutation.mutateAsync();
      setState(prev => ({
        ...prev,
        successMessage: 'Hesabınız başarıyla silindi',
      }));
      return true;
    } catch (error) {
      console.error('Failed to delete account:', error);
      return false;
    }
  }, [deleteMutation]);

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
    
    // Auto-format phone number
    if (field === 'phone') {
      processedValue = formatPhoneInput(value);
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
    if (state.profile?.firstName && state.profile?.lastName) {
      return `${state.profile.firstName} ${state.profile.lastName}`;
    }
    return state.profile?.email?.split('@')[0] || 'Kullanıcı';
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

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}