import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  // Additional profile fields that might come from API
  updatedAt?: string;
  lastLogin?: string;
  totalAppointments?: number;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// Validation helpers
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validateName = (name: string): boolean => {
  const trimmedName = name.trim();
  const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]{2,50}$/;
  return trimmedName.length >= 2 && nameRegex.test(trimmedName);
};

export const formatNameInput = (value: string): string => {
  return value.replace(/[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g, '').slice(0, 50);
};

export const formatPhoneInput = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, '');
  
  if (cleaned.startsWith('+90')) {
    const digits = cleaned.slice(3);
    if (digits.length <= 10) {
      return '+90 ' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    return '+90 ' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
  }
  
  if (cleaned.startsWith('0')) {
    const digits = cleaned.slice(1);
    if (digits.length <= 10) {
      return '0' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    return '0' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
  }
  
  const digits = cleaned.slice(0, 10);
  return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
};

interface ProfileState {
  // Data State
  profile: UserProfile | null;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Edit State
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  editForm: ProfileFormData;
  
  // Validation State
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  
  // Success/Error Messages
  successMessage: string;
  errorMessage: string;
  
  // Cache settings
  cacheValidDuration: number; // 10 minutes for profile data
  
  // Actions - Data
  setProfile: (profile: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Actions - Edit
  setIsEditing: (editing: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsDeleting: (deleting: boolean) => void;
  updateEditForm: (field: keyof ProfileFormData, value: string) => void;
  resetEditForm: () => void;
  
  // Actions - Validation
  setPhoneError: (error: string) => void;
  setFirstNameError: (error: string) => void;
  setLastNameError: (error: string) => void;
  clearValidationErrors: () => void;
  
  // Actions - Messages
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
  clearMessages: () => void;
  
  // API Actions
  fetchProfile: (forceRefresh?: boolean) => Promise<void>;
  saveProfile: () => Promise<boolean>;
  deleteAccount: () => Promise<boolean>;
  refreshProfile: () => Promise<void>;
  
  // Computed
  getUserDisplayName: () => string;
  isDataStale: () => boolean;
  isFormValid: () => boolean;
  hasFormChanges: () => boolean;
  
  // Cache Management
  invalidateCache: () => void;
  clearCache: () => void;
}

export const useProfileStore = create<ProfileState>()(
  devtools(
    (set, get) => ({
      // Initial State
      profile: null,
      loading: false,
      error: null,
      lastFetched: null,
      
      isEditing: false,
      isSaving: false,
      isDeleting: false,
      editForm: {
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
      },
      
      phoneError: "",
      firstNameError: "",
      lastNameError: "",
      
      successMessage: "",
      errorMessage: "",
      
      cacheValidDuration: 10 * 60 * 1000, // 10 minutes
      
      // Basic Actions
      setProfile: (profile) => set({ 
        profile, 
        lastFetched: profile ? Date.now() : null,
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Edit Actions
      setIsEditing: (editing) => {
        const state = get();
        if (editing && state.profile) {
          // Initialize edit form with current profile data
          set({
            isEditing: true,
            editForm: {
              firstName: state.profile.firstName || "",
              lastName: state.profile.lastName || "",
              phone: state.profile.phone || "",
              email: state.profile.email || "",
            },
            successMessage: "",
            errorMessage: "",
          });
          get().clearValidationErrors();
        } else {
          set({ isEditing: editing });
        }
      },
      
      setIsSaving: (saving) => set({ isSaving: saving }),
      
      setIsDeleting: (deleting) => set({ isDeleting: deleting }),
      
      updateEditForm: (field, value) => {
        const state = get();
        
        // Format input based on field type
        let formattedValue = value;
        if (field === 'firstName' || field === 'lastName') {
          formattedValue = formatNameInput(value);
        } else if (field === 'phone') {
          formattedValue = formatPhoneInput(value);
        }
        
        set({
          editForm: { ...state.editForm, [field]: formattedValue }
        });
        
        // Clear validation errors when user types
        if (field === 'firstName' && state.firstNameError) {
          set({ firstNameError: "" });
        }
        if (field === 'lastName' && state.lastNameError) {
          set({ lastNameError: "" });
        }
        if (field === 'phone' && state.phoneError) {
          set({ phoneError: "" });
        }
      },
      
      resetEditForm: () => {
        const state = get();
        if (state.profile) {
          set({
            editForm: {
              firstName: state.profile.firstName || "",
              lastName: state.profile.lastName || "",
              phone: state.profile.phone || "",
              email: state.profile.email || "",
            }
          });
        }
        get().clearValidationErrors();
        get().clearMessages();
      },
      
      // Validation Actions
      setPhoneError: (error) => set({ phoneError: error }),
      setFirstNameError: (error) => set({ firstNameError: error }),
      setLastNameError: (error) => set({ lastNameError: error }),
      
      clearValidationErrors: () => set({
        phoneError: "",
        firstNameError: "",
        lastNameError: "",
      }),
      
      // Message Actions
      setSuccessMessage: (message) => set({ successMessage: message }),
      setErrorMessage: (message) => set({ errorMessage: message }),
      
      clearMessages: () => set({
        successMessage: "",
        errorMessage: "",
      }),
      
      // API Actions
      fetchProfile: async (forceRefresh = false) => {
        const state = get();
        
        // Check if we need to fetch (cache is stale or force refresh)
        if (!forceRefresh && !state.isDataStale() && state.profile) {
          return; // Use cached data
        }
        
        // Prevent duplicate fetches
        if (state.loading) return;
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/profile");
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              set({ 
                profile: result.data,
                lastFetched: Date.now(),
                error: null,
                editForm: {
                  firstName: result.data.firstName || "",
                  lastName: result.data.lastName || "",
                  phone: result.data.phone || "",
                  email: result.data.email || "",
                }
              });
              
              // Sync with auth store
              try {
                const { useAuthStore } = await import('./auth-store');
                const authStore = useAuthStore.getState();
                if (authStore.user) {
                  authStore.setUser({
                    ...authStore.user,
                    firstName: result.data.firstName,
                    lastName: result.data.lastName,
                  });
                }
              } catch {
                console.log('Auth store sync not available');
              }
            } else {
              set({ error: "Profile data format hatası" });
            }
          } else {
            set({ error: "Profil bilgileri yüklenemedi" });
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          set({ error: "Bağlantı hatası oluştu" });
        } finally {
          set({ loading: false });
        }
      },
      
      saveProfile: async () => {
        const state = get();
        
        set({ isSaving: true });
        get().clearMessages();
        get().clearValidationErrors();
        
        // Validate form
        let hasErrors = false;
        
        if (state.editForm.firstName.trim() && !validateName(state.editForm.firstName)) {
          set({ firstNameError: "Ad en az 2 karakter olmalı ve sadece harf içermeli" });
          hasErrors = true;
        }
        
        if (state.editForm.lastName.trim() && !validateName(state.editForm.lastName)) {
          set({ lastNameError: "Soyad en az 2 karakter olmalı ve sadece harf içermeli" });
          hasErrors = true;
        }
        
        if (state.editForm.phone.trim() && !validatePhone(state.editForm.phone)) {
          set({ phoneError: "Geçerli bir telefon numarası giriniz" });
          hasErrors = true;
        }
        
        if (hasErrors) {
          set({ isSaving: false });
          return false;
        }
        
        try {
          const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firstName: state.editForm.firstName.trim() || null,
              lastName: state.editForm.lastName.trim() || null,
              phone: state.editForm.phone.trim() || null,
            }),
          });
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              set({
                profile: result.data,
                lastFetched: Date.now(),
                isEditing: false,
                successMessage: "Profil başarıyla güncellendi",
              });
              
              // Sync with auth store
              try {
                const { useAuthStore } = await import('./auth-store');
                const authStore = useAuthStore.getState();
                if (authStore.user) {
                  authStore.setUser({
                    ...authStore.user,
                    firstName: result.data.firstName,
                    lastName: result.data.lastName,
                  });
                }
              } catch {
                console.log('Auth store sync not available');
              }
              
              // Invalidate appointments cache (profile might have changed phone)
              try {
                const { useAppointmentsStore } = await import('./appointments-store');
                useAppointmentsStore.getState().invalidateCache();
              } catch {
                console.log('Appointments store not available');
              }
              
              return true;
            } else {
              set({ errorMessage: result.error || "Profil güncellenemedi" });
              return false;
            }
          } else {
            set({ errorMessage: "Profil güncellenirken hata oluştu" });
            return false;
          }
        } catch (error) {
          console.error("Error saving profile:", error);
          set({ errorMessage: "Bağlantı hatası oluştu" });
          return false;
        } finally {
          set({ isSaving: false });
        }
      },
      
      deleteAccount: async () => {
        set({ isDeleting: true, errorMessage: "" });
        
        try {
          const response = await fetch("/api/profile", {
            method: "DELETE",
          });
          
          if (response.ok) {
            // Clear all stores on account deletion
            get().clearCache();
            
            try {
              const { useAuthStore } = await import('./auth-store');
              await useAuthStore.getState().signOut();
            } catch {
              console.log('Auth store not available');
            }
            
            return true;
          } else {
            const result = await response.json();
            set({ errorMessage: result.error || "Hesap silinemedi" });
            return false;
          }
        } catch (error) {
          console.error("Error deleting account:", error);
          set({ errorMessage: "Bağlantı hatası oluştu" });
          return false;
        } finally {
          set({ isDeleting: false });
        }
      },
      
      refreshProfile: async () => {
        await get().fetchProfile(true);
      },
      
      // Computed Functions
      getUserDisplayName: () => {
        const state = get();
        if (state.profile?.firstName && state.profile?.lastName) {
          return `${state.profile.firstName} ${state.profile.lastName}`;
        }
        return state.profile?.email?.split("@")[0] || "User";
      },
      
      isDataStale: () => {
        const state = get();
        if (!state.lastFetched) return true;
        return Date.now() - state.lastFetched > state.cacheValidDuration;
      },
      
      isFormValid: () => {
        const state = get();
        // Check for validation errors
        if (state.phoneError || state.firstNameError || state.lastNameError) {
          return false;
        }
        
        // Check if required fields have valid values
        if (state.editForm.firstName.trim() && !validateName(state.editForm.firstName)) {
          return false;
        }
        if (state.editForm.lastName.trim() && !validateName(state.editForm.lastName)) {
          return false;
        }
        if (state.editForm.phone.trim() && !validatePhone(state.editForm.phone)) {
          return false;
        }
        
        return true;
      },
      
      hasFormChanges: () => {
        const state = get();
        if (!state.profile) return false;
        
        return (
          (state.profile.firstName || "") !== state.editForm.firstName ||
          (state.profile.lastName || "") !== state.editForm.lastName ||
          (state.profile.phone || "") !== state.editForm.phone
        );
      },
      
      // Cache Management
      invalidateCache: () => set({ lastFetched: null }),
      
      clearCache: () => set({
        profile: null,
        lastFetched: null,
        error: null,
        isEditing: false,
        isSaving: false,
        isDeleting: false,
        editForm: {
          firstName: "",
          lastName: "",
          phone: "",
          email: "",
        },
        phoneError: "",
        firstNameError: "",
        lastNameError: "",
        successMessage: "",
        errorMessage: "",
      }),
    }),
    {
      name: "profile-store",
    }
  )
);