import { create } from "zustand";
import { devtools } from "zustand/middleware";

// Types
export interface BookingData {
  date: string;
  staffId: string;
  timeSlot: string;
}

export interface CustomerInfo {
  phone: string;
  notes: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserProfile {
  phone: string | null;
}

// Phone validation helpers - moved to store
export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

export const formatPhoneInput = (value: string): string => {
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
  
  const digits = cleaned.slice(0, 10);
  return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
};

interface BookingState {
  // UI State
  currentStep: number;
  isBooking: boolean;
  phoneError: string;
  
  // Data State
  bookingData: BookingData;
  customerInfo: CustomerInfo;
  userProfile: UserProfile;
  staffMembers: Staff[];
  
  // Loading States
  profileLoading: boolean;
  staffLoading: boolean;
  
  // Actions - UI
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  setIsBooking: (loading: boolean) => void;
  setPhoneError: (error: string) => void;
  
  // Actions - Data
  updateBookingData: (field: keyof BookingData, value: string) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setUserProfile: (profile: UserProfile) => void;
  setStaffMembers: (staff: Staff[]) => void;
  
  // Actions - API calls
  fetchUserProfile: () => Promise<void>;
  fetchStaffMembers: () => Promise<void>;
  submitBooking: () => Promise<boolean>;
  
  // Computed
  canProceed: () => boolean;
  getStaffName: (staffId: string) => string;
  
  // Reset
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  devtools(
    (set, get) => ({
      // Initial State
      currentStep: 1,
      isBooking: false,
      phoneError: "",
      
      bookingData: {
        date: "",
        staffId: "",
        timeSlot: "",
      },
      
      customerInfo: {
        phone: "",
        notes: "",
      },
      
      userProfile: { phone: null },
      staffMembers: [],
      
      profileLoading: false,
      staffLoading: false,

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

      // Data Actions
      updateBookingData: (field, value) => set((state) => ({
        bookingData: { ...state.bookingData, [field]: value }
      })),
      
      updateCustomerInfo: (info) => set((state) => ({
        customerInfo: { ...state.customerInfo, ...info }
      })),
      
      setUserProfile: (profile) => set({ userProfile: profile }),
      
      setStaffMembers: (staff) => set({ staffMembers: staff }),

      // API Actions
      fetchUserProfile: async () => {
        const state = get();
        if (state.profileLoading) return;
        
        set({ profileLoading: true });
        
        try {
          // First try to get from profile store cache
          try {
            const { useProfileStore } = await import('./profile-store');
            const profileStore = useProfileStore.getState();
            
            if (profileStore.profile && !profileStore.isDataStale()) {
              // Use cached profile data
              set({ 
                userProfile: { phone: profileStore.profile.phone },
                customerInfo: { 
                  ...state.customerInfo, 
                  phone: profileStore.profile.phone || "" 
                },
                profileLoading: false
              });
              return;
            }
          } catch {
            // Profile store not available, fallback to API
          }
          
          // Fallback to direct API call
          const response = await fetch("/api/profile");
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              const profile = result.data;
              set({ 
                userProfile: profile,
                customerInfo: { 
                  ...state.customerInfo, 
                  phone: profile.phone || "" 
                }
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        } finally {
          set({ profileLoading: false });
        }
      },

      fetchStaffMembers: async () => {
        const state = get();
        if (state.staffLoading || state.staffMembers.length > 0) return;
        
        set({ staffLoading: true });
        
        try {
          const response = await fetch("/api/staff");
          if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              set({ staffMembers: result.data });
            }
          }
        } catch (error) {
          console.error("Error fetching staff:", error);
        } finally {
          set({ staffLoading: false });
        }
      },

      submitBooking: async () => {
        const state = get();
        set({ isBooking: true });

        try {
          // Update profile if phone changed
          if (state.customerInfo.phone && state.customerInfo.phone !== state.userProfile.phone) {
            const profileResponse = await fetch("/api/profile", {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ phone: state.customerInfo.phone }),
            });

            if (!profileResponse.ok) {
              alert("Telefon numarası güncellenemedi.");
              return false;
            }
          }

          // Submit appointment
          const payload = {
            date: state.bookingData.date,
            staffId: state.bookingData.staffId,
            startTime: state.bookingData.timeSlot,
            ...(state.customerInfo.notes?.trim() && { 
              notes: state.customerInfo.notes.trim() 
            }),
          };

          const response = await fetch("/api/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({ currentStep: 5 });
            
            // Invalidate appointments cache when new appointment is created
            const { useAppointmentsStore } = await import('./appointments-store');
            useAppointmentsStore.getState().invalidateCache();
            
            return true;
          } else {
            if (result.details && Array.isArray(result.details)) {
              const errorDetails = result.details
                .map((detail: { field: string; message: string }) => 
                  `${detail.field}: ${detail.message}`)
                .join("\n");
              alert(`Validation errors:\n${errorDetails}`);
            } else {
              alert(result.error || "Randevu oluşturulurken bir hata oluştu.");
            }
            return false;
          }
        } catch (error) {
          console.error("Randevu oluşturulurken hata oluştu:", error);
          alert("Randevu oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.");
          return false;
        } finally {
          set({ isBooking: false });
        }
      },

      // Computed Functions
      canProceed: () => {
        const state = get();
        switch (state.currentStep) {
          case 1:
            return state.bookingData.date !== "";
          case 2:
            return state.bookingData.staffId !== "";
          case 3:
            return state.bookingData.timeSlot !== "";
          case 4:
            return (
              state.customerInfo.phone.trim() !== "" &&
              validatePhone(state.customerInfo.phone) &&
              !state.phoneError
            );
          default:
            return false;
        }
      },

      getStaffName: (staffId: string) => {
        const staff = get().staffMembers.find((s) => s.id === staffId);
        return staff ? `${staff.firstName} ${staff.lastName}` : "Seçilen Berber";
      },

      // Reset
      resetBooking: () => set({
        currentStep: 1,
        isBooking: false,
        phoneError: "",
        bookingData: {
          date: "",
          staffId: "",
          timeSlot: "",
        },
        customerInfo: {
          phone: get().userProfile.phone || "",
          notes: "",
        },
      }),
    }),
    {
      name: "booking-store",
    }
  )
);