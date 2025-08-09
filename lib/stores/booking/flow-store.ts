import { create } from "zustand";
import { devtools } from "zustand/middleware";

interface BookingFlowState {
  // UI State
  currentStep: number;
  isBooking: boolean;
  phoneError: string;
  
  // Actions - UI
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsBooking: (loading: boolean) => void;
  setPhoneError: (error: string) => void;
  
  // Computed
  canProceed: () => boolean;
  
  // Reset
  resetFlow: () => void;
}

export const useBookingFlowStore = create<BookingFlowState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isBooking: false,
      phoneError: "",

      // UI Actions
      setCurrentStep: (step) => set({ currentStep: step }),
      
      nextStep: () => set((state) => ({ 
        currentStep: Math.min(state.currentStep + 1, 4) 
      })),
      
      prevStep: () => set((state) => ({ 
        currentStep: Math.max(state.currentStep - 1, 1) 
      })),
      
      setIsBooking: (loading) => set({ isBooking: loading }),
      
      setPhoneError: (error) => set({ phoneError: error }),

      // Computed Functions
      canProceed: () => {
        const state = get();
        
        // For synchronous validation, we'll need to access the stores directly
        // This is a simplified version - in practice validation is handled by combined hook
        switch (state.currentStep) {
          case 1:
            // Date validation - will be handled by parent component
            return true;
          case 2:
            // Staff validation - will be handled by parent component  
            return true;
          case 3:
            // Time slot validation - will be handled by parent component
            return true;
          case 4:
            // Phone validation - can be done here since phoneError is in this store
            return !state.phoneError;
          default:
            return false;
        }
      },

      // Reset
      resetFlow: () => set({
        currentStep: 1,
        isBooking: false,
        phoneError: "",
      }),
    }),
    {
      name: "booking-flow-store",
    }
  )
);