import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { Staff } from "./types";

interface BookingStaffState {
  // Data State
  staffMembers: Staff[];
  
  // Loading States
  staffLoading: boolean;
  
  // Actions - Data
  setStaffMembers: (staff: Staff[]) => void;
  
  // Actions - API calls
  fetchStaffMembers: () => Promise<void>;
  
  // Computed
  getStaffName: (staffId: string) => string;
  
  // Reset
  resetStaff: () => void;
}

export const useBookingStaffStore = create<BookingStaffState>()(
  devtools(
    (set, get) => ({
      // Initial State
      staffMembers: [],
      staffLoading: false,

      // Actions
      setStaffMembers: (staff) => set({ staffMembers: staff }),

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

      // Computed
      getStaffName: (staffId: string) => {
        const staff = get().staffMembers.find((s) => s.id === staffId);
        return staff ? `${staff.firstName} ${staff.lastName}` : "Seçilen Berber";
      },

      // Reset
      resetStaff: () => set({
        staffMembers: [],
        staffLoading: false,
      }),
    }),
    {
      name: "booking-staff-store",
    }
  )
);