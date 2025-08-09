import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { BookingData, CustomerInfo, UserProfile } from "./types";

interface BookingDataState {
  // Data State
  bookingData: BookingData;
  customerInfo: CustomerInfo;
  userProfile: UserProfile;
  
  // Loading States
  profileLoading: boolean;
  
  // Actions - Data
  updateBookingData: (field: keyof BookingData, value: string) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setUserProfile: (profile: UserProfile) => void;
  
  // Actions - API calls
  fetchUserProfile: () => Promise<void>;
  submitBooking: () => Promise<boolean>;
  
  // Reset
  resetBookingData: () => void;
}

export const useBookingDataStore = create<BookingDataState>()(
  devtools(
    (set, get) => ({
      // Initial State
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
      profileLoading: false,

      // Data Actions
      updateBookingData: (field, value) => set((state) => ({
        bookingData: { ...state.bookingData, [field]: value }
      })),
      
      updateCustomerInfo: (info) => set((state) => ({
        customerInfo: { ...state.customerInfo, ...info }
      })),
      
      setUserProfile: (profile) => set({ userProfile: profile }),

      // API Actions
      fetchUserProfile: async () => {
        const state = get();
        if (state.profileLoading) return;
        
        set({ profileLoading: true });
        
        try {
          // First try to get from profile store cache
          try {
            const { useProfileDataStore } = await import('../profile');
            const profileStore = useProfileDataStore.getState();
            
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

      submitBooking: async () => {
        const state = get();
        
        // Get flow store for isBooking state
        const { useBookingFlowStore } = await import('./flow-store');
        const flowStore = useBookingFlowStore.getState();
        
        flowStore.setIsBooking(true);

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
            // Invalidate appointments cache when new appointment is created
            try {
              const { useAppointmentsStore } = await import('../appointments-store');
              useAppointmentsStore.getState().invalidateCache();
            } catch {
              // Appointments store might not be available
            }
            
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
          flowStore.setIsBooking(false);
        }
      },

      // Reset
      resetBookingData: () => set((state) => ({
        bookingData: {
          date: "",
          staffId: "",
          timeSlot: "",
        },
        customerInfo: {
          phone: state.userProfile.phone || "",
          notes: "",
        },
      })),
    }),
    {
      name: "booking-data-store",
    }
  )
);