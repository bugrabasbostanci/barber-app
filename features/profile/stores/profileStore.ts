import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UserProfile, ProfileFormData } from '../types/profile.types';
import { ProfileService } from '../services/profileService';

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
          formattedValue = ProfileService.formatNameInput(value);
        } else if (field === 'phone') {
          formattedValue = ProfileService.formatPhoneInput(value);
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
          const profile = await ProfileService.getProfile();
          set({ 
            profile,
            lastFetched: Date.now(),
            error: null,
            editForm: {
              firstName: profile.firstName || "",
              lastName: profile.lastName || "",
              phone: profile.phone || "",
              email: profile.email || "",
            }
          });
          
          // Sync with auth store
          try {
            const { useAuthStore } = await import('../../auth/stores/authStore');
            const authStore = useAuthStore.getState();
            if (authStore.user) {
              authStore.setUser({
                ...authStore.user,
                firstName: profile.firstName || undefined,
                lastName: profile.lastName || undefined,
              });
            }
          } catch {
            console.log('Auth store sync not available');
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          set({ error: error instanceof Error ? error.message : "Bağlantı hatası oluştu" });
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
        const validation = ProfileService.validateProfileData(state.editForm);
        if (!validation.valid) {
          if (validation.errors.firstName) set({ firstNameError: validation.errors.firstName });
          if (validation.errors.lastName) set({ lastNameError: validation.errors.lastName });
          if (validation.errors.phone) set({ phoneError: validation.errors.phone });
          
          set({ isSaving: false });
          return false;
        }
        
        try {
          const updatedProfile = await ProfileService.updateProfile({
            firstName: state.editForm.firstName.trim() || undefined,
            lastName: state.editForm.lastName.trim() || undefined,
            phone: state.editForm.phone.trim() || undefined,
          });
          
          set({
            profile: updatedProfile,
            lastFetched: Date.now(),
            isEditing: false,
            successMessage: "Profil başarıyla güncellendi",
          });
          
          // Sync with auth store
          try {
            const { useAuthStore } = await import('../../auth/stores/authStore');
            const authStore = useAuthStore.getState();
            if (authStore.user) {
              authStore.setUser({
                ...authStore.user,
                firstName: updatedProfile.firstName || undefined,
                lastName: updatedProfile.lastName || undefined,
              });
            }
          } catch {
            console.log('Auth store sync not available');
          }
          
          // Invalidate appointments cache (profile might have changed phone)
          try {
            const { useAppointmentsStore } = await import('../../appointments/stores/appointmentsStore');
            useAppointmentsStore.getState().invalidateCache();
          } catch {
            console.log('Appointments store not available');
          }
          
          return true;
        } catch (error) {
          console.error("Error saving profile:", error);
          set({ errorMessage: error instanceof Error ? error.message : "Bağlantı hatası oluştu" });
          return false;
        } finally {
          set({ isSaving: false });
        }
      },
      
      deleteAccount: async () => {
        set({ isDeleting: true, errorMessage: "" });
        
        try {
          await ProfileService.deleteProfile();
          
          // Clear all stores on account deletion
          get().clearCache();
          
          try {
            const { useAuthStore } = await import('../../auth/stores/authStore');
            await useAuthStore.getState().signOut();
          } catch {
            console.log('Auth store not available');
          }
          
          return true;
        } catch (error) {
          console.error("Error deleting account:", error);
          set({ errorMessage: error instanceof Error ? error.message : "Bağlantı hatası oluştu" });
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
        return state.profile ? ProfileService.getDisplayName(state.profile) : "User";
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
        
        const validation = ProfileService.validateProfileData(state.editForm);
        return validation.valid;
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