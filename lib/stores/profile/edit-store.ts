import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { UserProfile } from "./data-store";
import { validatePhone, validateName, validateEmail } from "@/lib/utils/profile-validation";

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

interface ProfileEditState {
  // Edit State
  isEditing: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  editForm: ProfileFormData;
  
  // Validation State
  phoneError: string;
  firstNameError: string;
  lastNameError: string;
  emailError: string;
  
  // Actions
  setIsEditing: (editing: boolean) => void;
  setIsSaving: (saving: boolean) => void;
  setIsDeleting: (deleting: boolean) => void;
  updateEditForm: (field: keyof ProfileFormData, value: string) => void;
  resetEditForm: (profile?: UserProfile | null) => void;
  
  // Validation Actions
  validateField: (field: keyof ProfileFormData) => void;
  validateAllFields: () => boolean;
  clearValidationErrors: () => void;
  
  // Form Actions
  startEditing: (profile: UserProfile) => void;
  cancelEditing: () => void;
  saveProfile: () => Promise<boolean>;
  deleteProfile: () => Promise<boolean>;
  
  // Computed
  hasErrors: () => boolean;
  isFormValid: () => boolean;
  hasChanges: (profile: UserProfile | null) => boolean;
}

export const useProfileEditStore = create<ProfileEditState>()(
  devtools(
    (set, get) => ({
      // Initial State
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
      emailError: "",
      
      // Basic Actions
      setIsEditing: (editing) => set({ isEditing: editing }),
      
      setIsSaving: (saving) => set({ isSaving: saving }),
      
      setIsDeleting: (deleting) => set({ isDeleting: deleting }),
      
      updateEditForm: (field, value) => {
        set((state) => ({
          editForm: { ...state.editForm, [field]: value }
        }));
        
        // Clear error for this field when user starts typing
        const errorField = `${field}Error` as keyof ProfileEditState;
        if (get()[errorField]) {
          set({ [errorField]: "" });
        }
      },
      
      resetEditForm: (profile = null) => {
        set({
          editForm: {
            firstName: profile?.firstName || "",
            lastName: profile?.lastName || "",
            phone: profile?.phone || "",
            email: profile?.email || "",
          },
          phoneError: "",
          firstNameError: "",
          lastNameError: "",
          emailError: "",
        });
      },
      
      // Validation Actions
      validateField: (field) => {
        const { editForm } = get();
        const value = editForm[field];
        
        switch (field) {
          case "firstName":
            if (!validateName(value)) {
              set({ firstNameError: "Geçersiz ad. En az 2 karakter olmalı ve sadece harf içermeli." });
            } else {
              set({ firstNameError: "" });
            }
            break;
          case "lastName":
            if (!validateName(value)) {
              set({ lastNameError: "Geçersiz soyad. En az 2 karakter olmalı ve sadece harf içermeli." });
            } else {
              set({ lastNameError: "" });
            }
            break;
          case "phone":
            if (!validatePhone(value)) {
              set({ phoneError: "Geçersiz telefon numarası. 10 haneli olmalı." });
            } else {
              set({ phoneError: "" });
            }
            break;
          case "email":
            if (!validateEmail(value)) {
              set({ emailError: "Geçersiz e-posta adresi." });
            } else {
              set({ emailError: "" });
            }
            break;
        }
      },
      
      validateAllFields: () => {
        const fields: (keyof ProfileFormData)[] = ["firstName", "lastName", "phone", "email"];
        fields.forEach(field => get().validateField(field));
        return get().isFormValid();
      },
      
      clearValidationErrors: () => {
        set({
          phoneError: "",
          firstNameError: "",
          lastNameError: "",
          emailError: "",
        });
      },
      
      // Form Actions
      startEditing: (profile) => {
        get().resetEditForm(profile);
        set({ isEditing: true });
      },
      
      cancelEditing: () => {
        set({ 
          isEditing: false,
          phoneError: "",
          firstNameError: "",
          lastNameError: "",
          emailError: "",
        });
      },
      
      saveProfile: async () => {
        const { editForm, validateAllFields } = get();
        
        if (!validateAllFields()) {
          return false;
        }
        
        set({ isSaving: true });
        
        try {
          const response = await fetch("/api/profile", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editForm),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            set({ isEditing: false });
            return true;
          } else {
            throw new Error(result.message || "Failed to save profile");
          }
        } catch (error) {
          console.error("Failed to save profile:", error);
          return false;
        } finally {
          set({ isSaving: false });
        }
      },
      
      deleteProfile: async () => {
        set({ isDeleting: true });
        
        try {
          const response = await fetch("/api/profile", {
            method: "DELETE",
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            return true;
          } else {
            throw new Error(result.message || "Failed to delete profile");
          }
        } catch (error) {
          console.error("Failed to delete profile:", error);
          return false;
        } finally {
          set({ isDeleting: false });
        }
      },
      
      // Computed Functions
      hasErrors: () => {
        const { phoneError, firstNameError, lastNameError, emailError } = get();
        return !!(phoneError || firstNameError || lastNameError || emailError);
      },
      
      isFormValid: () => {
        const { editForm, hasErrors } = get();
        
        // Check if all required fields are filled
        const hasAllFields = editForm.firstName.trim() && 
                           editForm.lastName.trim() && 
                           editForm.phone.trim() && 
                           editForm.email.trim();
        
        return hasAllFields && !hasErrors();
      },
      
      hasChanges: (profile) => {
        if (!profile) return false;
        
        const { editForm } = get();
        return (
          editForm.firstName !== (profile.firstName || "") ||
          editForm.lastName !== (profile.lastName || "") ||
          editForm.phone !== (profile.phone || "") ||
          editForm.email !== profile.email
        );
      },
    }),
    {
      name: "profile-edit-store",
    }
  )
);