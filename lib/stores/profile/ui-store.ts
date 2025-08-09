import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface ProfileUIState {
  // Message State
  successMessage: string;
  errorMessage: string;
  
  // Modal State  
  showDeleteConfirm: boolean;
  
  // Actions
  setSuccessMessage: (message: string) => void;
  setErrorMessage: (message: string) => void;
  clearMessages: () => void;
  setShowDeleteConfirm: (show: boolean) => void;
  
  // Helper Actions
  showSuccess: (message: string, duration?: number) => void;
  showError: (message: string, duration?: number) => void;
}

export const useProfileUIStore = create<ProfileUIState>()(
  devtools(
    (set, get) => ({
      // Initial State
      successMessage: "",
      errorMessage: "",
      showDeleteConfirm: false,
      
      // Basic Actions
      setSuccessMessage: (message) => set({ successMessage: message }),
      
      setErrorMessage: (message) => set({ errorMessage: message }),
      
      clearMessages: () => set({ 
        successMessage: "", 
        errorMessage: "" 
      }),
      
      setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
      
      // Helper Actions
      showSuccess: (message, duration = 3000) => {
        set({ successMessage: message, errorMessage: "" });
        
        if (duration > 0) {
          setTimeout(() => {
            const currentMessage = get().successMessage;
            if (currentMessage === message) {
              set({ successMessage: "" });
            }
          }, duration);
        }
      },
      
      showError: (message, duration = 5000) => {
        set({ errorMessage: message, successMessage: "" });
        
        if (duration > 0) {
          setTimeout(() => {
            const currentMessage = get().errorMessage;
            if (currentMessage === message) {
              set({ errorMessage: "" });
            }
          }, duration);
        }
      },
    }),
    {
      name: "profile-ui-store",
    }
  )
);