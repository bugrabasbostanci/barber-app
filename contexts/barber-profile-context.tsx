"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile as useProfileQuery, useUpdateProfile } from '@/hooks/queries/useProfile';

// Barber-specific profile types
export interface BarberProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  // Barber-specific fields
  businessName: string | null;
  businessAddress: string | null;
  businessPhone: string | null;
  workingHours: {
    start: string;
    end: string;
  } | null;
  specialties: string[] | null;
  isAvailable: boolean;
}

export interface BarberProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  businessName: string;
  businessAddress: string;
  businessPhone: string;
  workingHoursStart: string;
  workingHoursEnd: string;
  specialties: string;
}

interface BarberProfileState {
  profile: BarberProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  successMessage: string;
  
  // Form state
  isEditing: boolean;
  editForm: BarberProfileFormData;
  
  // Validation errors
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  businessNameError: string;
  businessPhoneError: string;
  
  // Flags
  hasInitialized: boolean;
  lastFetch: number | null;
}

interface BarberProfileContextType {
  // State
  profile: BarberProfile | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string;
  successMessage: string;
  isEditing: boolean;
  editForm: BarberProfileFormData;
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  businessNameError: string;
  businessPhoneError: string;
  hasInitialized: boolean;
  
  // Actions
  fetchProfile: (force?: boolean) => Promise<void>;
  saveProfile: () => Promise<boolean>;
  setIsEditing: (editing: boolean) => void;
  updateEditForm: (field: keyof BarberProfileFormData, value: string) => void;
  resetEditForm: () => void;
  clearMessages: () => void;
  toggleAvailability: () => Promise<boolean>;
  
  // Utilities
  getBarberDisplayName: () => string;
  getBusinessDisplayName: () => string;
  isFormValid: () => boolean;
  hasFormChanges: () => boolean;
  validateForm: () => boolean;
}

const BarberProfileContext = createContext<BarberProfileContextType | undefined>(undefined);


const initialState: BarberProfileState = {
  profile: null,
  isLoading: false,
  isSaving: false,
  error: '',
  successMessage: '',
  isEditing: false,
  editForm: {
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    businessName: '',
    businessAddress: '',
    businessPhone: '',
    workingHoursStart: '09:30',
    workingHoursEnd: '21:30',
    specialties: '',
  },
  phoneError: '',
  firstNameError: '',
  lastNameError: '',
  businessNameError: '',
  businessPhoneError: '',
  hasInitialized: false,
  lastFetch: null,
};

// Validation helpers (reused from profile-context)
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

const validateBusinessName = (name: string): string => {
  if (!name.trim()) {
    return 'İşletme adı gereklidir';
  }
  
  if (name.trim().length < 2) {
    return 'İşletme adı en az 2 karakter olmalıdır';
  }
  
  if (name.trim().length > 100) {
    return 'İşletme adı 100 karakterden fazla olamaz';
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

export function BarberProfileProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BarberProfileState>(initialState);
  const { isBarber } = useAuth();

  // React Query hooks for data fetching
  const { data: profileData, isLoading: queryLoading, error: queryError } = useProfileQuery();
  const updateMutation = useUpdateProfile();

  // Only provide barber context if user is actually a barber
  const shouldProvideContext = isBarber();

  // Sync React Query data with local state
  useEffect(() => {
    if (profileData && shouldProvideContext) {
      // Transform regular profile to barber profile
      const profileAny = profileData as any;
      const barberProfile: BarberProfile = {
        ...profileData,
        businessName: profileAny.businessName || null,
        businessAddress: profileAny.businessAddress || null,
        businessPhone: profileAny.businessPhone || null,
        workingHours: profileAny.workingHours || { start: '09:30', end: '21:30' },
        specialties: profileAny.specialties || [],
        isAvailable: profileAny.isAvailable ?? true,
      };
      setState(prev => ({
        ...prev,
        profile: barberProfile,
        hasInitialized: true,
        // Reset form with fresh data when not editing
        editForm: prev.isEditing ? prev.editForm : {
          firstName: barberProfile?.firstName || '',
          lastName: barberProfile?.lastName || '',
          phone: barberProfile?.phone || '',
          email: barberProfile?.email || '',
          businessName: barberProfile?.businessName || '',
          businessAddress: barberProfile?.businessAddress || '',
          businessPhone: barberProfile?.businessPhone || '',
          workingHoursStart: barberProfile?.workingHours?.start || '09:30',
          workingHoursEnd: barberProfile?.workingHours?.end || '21:30',
          specialties: barberProfile?.specialties?.join(', ') || '',
        },
      }));
    }
  }, [profileData, shouldProvideContext]);

  // Sync loading states
  useEffect(() => {
    setState(prev => ({
      ...prev,
      isLoading: queryLoading,
      isSaving: updateMutation.isPending,
      error: queryError?.message || updateMutation.error?.message || '',
      successMessage: updateMutation.isSuccess ? 'Berber profili başarıyla güncellendi!' : '',
    }));
  }, [queryLoading, updateMutation.isPending, updateMutation.isSuccess, updateMutation.error, queryError]);

  const fetchProfile = useCallback(async () => {
    if (!shouldProvideContext) return;
    // React Query handles caching and fetching automatically
  }, [shouldProvideContext]);

  const validateForm = useCallback((): boolean => {
    const phoneErr = validatePhone(state.editForm.phone);
    const firstNameErr = validateName(state.editForm.firstName, 'Ad');
    const lastNameErr = validateName(state.editForm.lastName, 'Soyad');
    const businessNameErr = validateBusinessName(state.editForm.businessName);
    const businessPhoneErr = validatePhone(state.editForm.businessPhone);

    setState(prev => ({
      ...prev,
      phoneError: phoneErr,
      firstNameError: firstNameErr,
      lastNameError: lastNameErr,
      businessNameError: businessNameErr,
      businessPhoneError: businessPhoneErr,
    }));

    return !phoneErr && !firstNameErr && !lastNameErr && !businessNameErr && !businessPhoneErr;
  }, [state.editForm]);

  const saveProfile = useCallback(async (): Promise<boolean> => {
    if (!shouldProvideContext) return false;
    
    const isValid = validateForm();
    if (!isValid) {
      return false;
    }

    try {
      const formData = {
        firstName: state.editForm.firstName.trim(),
        lastName: state.editForm.lastName.trim(),
        phone: state.editForm.phone.trim(),
        email: state.editForm.email,
        businessName: state.editForm.businessName.trim(),
        businessAddress: state.editForm.businessAddress.trim(),
        businessPhone: state.editForm.businessPhone.trim(),
        workingHours: {
          start: state.editForm.workingHoursStart,
          end: state.editForm.workingHoursEnd,
        },
        specialties: state.editForm.specialties.split(',').map(s => s.trim()).filter(Boolean),
      };

      await updateMutation.mutateAsync(formData);
      
      setState(prev => ({
        ...prev,
        isEditing: false,
        successMessage: 'Berber profili başarıyla güncellendi',
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to save barber profile:', error);
      return false;
    }
  }, [state.editForm, validateForm, updateMutation, shouldProvideContext]);

  const toggleAvailability = useCallback(async (): Promise<boolean> => {
    if (!shouldProvideContext || !state.profile) return false;

    try {
      const updatedData = {
        firstName: state.profile.firstName || '',
        lastName: state.profile.lastName || '',
        phone: state.profile.phone || '',
        email: state.profile.email,
        isAvailable: !state.profile.isAvailable,
      };

      await updateMutation.mutateAsync(updatedData);
      
      setState(prev => ({
        ...prev,
        successMessage: state.profile?.isAvailable ? 'Berber pasif duruma geçirildi' : 'Berber aktif duruma geçirildi',
      }));
      
      return true;
    } catch (error) {
      console.error('Failed to toggle availability:', error);
      return false;
    }
  }, [state.profile, updateMutation, shouldProvideContext]);

  const setIsEditing = useCallback((editing: boolean) => {
    setState(prev => ({ 
      ...prev, 
      isEditing: editing,
      // Clear validation errors when entering edit mode
      phoneError: '',
      firstNameError: '',
      lastNameError: '',
      businessNameError: '',
      businessPhoneError: '',
    }));
  }, []);

  const updateEditForm = useCallback((field: keyof BarberProfileFormData, value: string) => {
    let processedValue = value;
    
    // Auto-format phone numbers
    if (field === 'phone' || field === 'businessPhone') {
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
    } else if (field === 'businessPhone') {
      const businessPhoneErr = validatePhone(processedValue);
      setState(prev => ({ ...prev, businessPhoneError: businessPhoneErr }));
    } else if (field === 'firstName') {
      const firstNameErr = validateName(processedValue, 'Ad');
      setState(prev => ({ ...prev, firstNameError: firstNameErr }));
    } else if (field === 'lastName') {
      const lastNameErr = validateName(processedValue, 'Soyad');
      setState(prev => ({ ...prev, lastNameError: lastNameErr }));
    } else if (field === 'businessName') {
      const businessNameErr = validateBusinessName(processedValue);
      setState(prev => ({ ...prev, businessNameError: businessNameErr }));
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
          businessName: state.profile?.businessName || '',
          businessAddress: state.profile?.businessAddress || '',
          businessPhone: state.profile?.businessPhone || '',
          workingHoursStart: state.profile?.workingHours?.start || '09:30',
          workingHoursEnd: state.profile?.workingHours?.end || '21:30',
          specialties: state.profile?.specialties?.join(', ') || '',
        },
        phoneError: '',
        firstNameError: '',
        lastNameError: '',
        businessNameError: '',
        businessPhoneError: '',
      }));
    }
  }, [state.profile]);

  const clearMessages = useCallback(() => {
    setState(prev => ({ ...prev, error: '', successMessage: '' }));
  }, []);

  // Utilities
  const getBarberDisplayName = useCallback((): string => {
    if (state.profile?.firstName && state.profile?.lastName) {
      return `${state.profile.firstName} ${state.profile.lastName}`;
    }
    return state.profile?.email?.split('@')[0] || 'Berber';
  }, [state.profile]);

  const getBusinessDisplayName = useCallback((): string => {
    return state.profile?.businessName || 'Berber Salonu';
  }, [state.profile]);

  const isFormValid = useCallback((): boolean => {
    return !state.phoneError && 
           !state.firstNameError && 
           !state.lastNameError &&
           !state.businessNameError &&
           !state.businessPhoneError &&
           state.editForm.firstName.trim() !== '' &&
           state.editForm.lastName.trim() !== '' &&
           state.editForm.businessName.trim() !== '';
  }, [state.phoneError, state.firstNameError, state.lastNameError, state.businessNameError, state.businessPhoneError, state.editForm]);

  const hasFormChanges = useCallback((): boolean => {
    if (!state.profile) return false;
    
    return state.editForm.firstName !== (state.profile.firstName || '') ||
           state.editForm.lastName !== (state.profile.lastName || '') ||
           state.editForm.phone !== (state.profile.phone || '') ||
           state.editForm.businessName !== (state.profile.businessName || '') ||
           state.editForm.businessAddress !== (state.profile.businessAddress || '') ||
           state.editForm.businessPhone !== (state.profile.businessPhone || '') ||
           state.editForm.workingHoursStart !== (state.profile.workingHours?.start || '09:30') ||
           state.editForm.workingHoursEnd !== (state.profile.workingHours?.end || '21:30') ||
           state.editForm.specialties !== (state.profile.specialties?.join(', ') || '');
  }, [state.profile, state.editForm]);

  const contextValue: BarberProfileContextType = {
    profile: state.profile,
    isLoading: state.isLoading,
    isSaving: state.isSaving,
    error: state.error,
    successMessage: state.successMessage,
    isEditing: state.isEditing,
    editForm: state.editForm,
    phoneError: state.phoneError,
    firstNameError: state.firstNameError,
    lastNameError: state.lastNameError,
    businessNameError: state.businessNameError,
    businessPhoneError: state.businessPhoneError,
    hasInitialized: state.hasInitialized,
    fetchProfile,
    saveProfile,
    setIsEditing,
    updateEditForm,
    resetEditForm,
    clearMessages,
    toggleAvailability,
    getBarberDisplayName,
    getBusinessDisplayName,
    isFormValid,
    hasFormChanges,
    validateForm,
  };

  // Only provide context if user is a barber
  if (!shouldProvideContext) {
    return <>{children}</>;
  }

  return (
    <BarberProfileContext.Provider value={contextValue}>
      {children}
    </BarberProfileContext.Provider>
  );
}

export function useBarberProfile() {
  const context = useContext(BarberProfileContext);
  if (context === undefined) {
    throw new Error('useBarberProfile must be used within a BarberProfileProvider');
  }
  return context;
}