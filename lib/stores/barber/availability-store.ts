import { create } from "zustand";
import { devtools } from "zustand/middleware";

export interface AvailabilitySlot {
  id?: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  isAvailable: boolean;
  reason?: string; // For blocked slots
}

export interface WeeklySchedule {
  monday: { isOpen: boolean; startTime: string; endTime: string };
  tuesday: { isOpen: boolean; startTime: string; endTime: string };
  wednesday: { isOpen: boolean; startTime: string; endTime: string };
  thursday: { isOpen: boolean; startTime: string; endTime: string };
  friday: { isOpen: boolean; startTime: string; endTime: string };
  saturday: { isOpen: boolean; startTime: string; endTime: string };
  sunday: { isOpen: boolean; startTime: string; endTime: string };
}

interface AvailabilityState {
  // Core State
  weeklySchedule: WeeklySchedule;
  customSlots: AvailabilitySlot[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Cache settings
  cacheValidDuration: number;
  
  // Actions
  setWeeklySchedule: (schedule: WeeklySchedule) => void;
  updateDaySchedule: (day: keyof WeeklySchedule, schedule: { isOpen: boolean; startTime: string; endTime: string }) => void;
  addCustomSlot: (slot: AvailabilitySlot) => void;
  removeCustomSlot: (id: string) => void;
  updateCustomSlot: (id: string, updates: Partial<AvailabilitySlot>) => void;
  fetchAvailability: (forceRefresh?: boolean) => Promise<void>;
  saveAvailability: () => Promise<boolean>;
  
  // Computed Functions
  isAvailableAtTime: (date: string, time: string) => boolean;
  getAvailableSlots: (date: string) => { startTime: string; endTime: string }[];
  isDataStale: () => boolean;
  
  // Cache Management
  invalidateCache: () => void;
  clearCache: () => void;
}

export const useBarberAvailabilityStore = create<AvailabilityState>()(
  devtools(
    (set, get) => ({
      // Initial State
      weeklySchedule: {
        monday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        tuesday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        wednesday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        thursday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        friday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        saturday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
        sunday: { isOpen: false, startTime: "09:30", endTime: "21:30" },
      },
      customSlots: [],
      loading: false,
      error: null,
      lastFetched: null,
      
      cacheValidDuration: 5 * 60 * 1000, // 5 minutes
      
      // Actions
      setWeeklySchedule: (schedule) => set({ 
        weeklySchedule: schedule,
        lastFetched: Date.now()
      }),
      
      updateDaySchedule: (day, schedule) => set((state) => ({
        weeklySchedule: {
          ...state.weeklySchedule,
          [day]: schedule,
        },
      })),
      
      addCustomSlot: (slot) => set((state) => ({
        customSlots: [...state.customSlots, { ...slot, id: slot.id || crypto.randomUUID() }],
      })),
      
      removeCustomSlot: (id) => set((state) => ({
        customSlots: state.customSlots.filter(slot => slot.id !== id),
      })),
      
      updateCustomSlot: (id, updates) => set((state) => ({
        customSlots: state.customSlots.map(slot =>
          slot.id === id ? { ...slot, ...updates } : slot
        ),
      })),
      
      // Fetch Availability
      fetchAvailability: async (forceRefresh = false) => {
        const { lastFetched, isDataStale } = get();
        
        if (!forceRefresh && lastFetched && !isDataStale()) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/barber/availability");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            set({
              weeklySchedule: result.data.weeklySchedule,
              customSlots: result.data.customSlots || [],
              lastFetched: Date.now(),
              error: null,
            });
          } else {
            throw new Error(result.message || "Failed to fetch availability");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({ error: errorMessage });
          console.error("Failed to fetch availability:", error);
        } finally {
          set({ loading: false });
        }
      },
      
      // Save Availability
      saveAvailability: async () => {
        const { weeklySchedule, customSlots } = get();
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/barber/availability", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              weeklySchedule,
              customSlots,
            }),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            set({ lastFetched: Date.now() });
            return true;
          } else {
            throw new Error(result.message || "Failed to save availability");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to save availability";
          set({ error: errorMessage });
          console.error("Failed to save availability:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      
      // Computed Functions
      isAvailableAtTime: (date, time) => {
        const { weeklySchedule, customSlots } = get();
        const dayOfWeek = new Date(date).getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek] as keyof WeeklySchedule;
        
        // Check weekly schedule
        const daySchedule = weeklySchedule[dayName];
        if (!daySchedule.isOpen) {
          return false;
        }
        
        if (time < daySchedule.startTime || time > daySchedule.endTime) {
          return false;
        }
        
        // Check custom slots (blocked times)
        const blockedSlot = customSlots.find(slot => 
          slot.date === date && 
          !slot.isAvailable && 
          time >= slot.startTime && 
          time <= slot.endTime
        );
        
        return !blockedSlot;
      },
      
      getAvailableSlots: (date) => {
        const { weeklySchedule } = get();
        const dayOfWeek = new Date(date).getDay();
        const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayName = dayNames[dayOfWeek] as keyof WeeklySchedule;
        
        const daySchedule = weeklySchedule[dayName];
        if (!daySchedule.isOpen) {
          return [];
        }
        
        // Generate 45-minute slots
        const slots = [];
        const startTime = daySchedule.startTime;
        const endTime = daySchedule.endTime;
        
        let currentTime = startTime;
        while (currentTime < endTime) {
          if (get().isAvailableAtTime(date, currentTime)) {
            // Calculate end time (45 minutes later)
            const [hours, minutes] = currentTime.split(':').map(Number);
            const totalMinutes = hours * 60 + minutes + 45;
            const newHours = Math.floor(totalMinutes / 60);
            const newMinutes = totalMinutes % 60;
            const slotEndTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
            
            slots.push({
              startTime: currentTime,
              endTime: slotEndTime,
            });
          }
          
          // Move to next 45-minute slot
          const [hours, minutes] = currentTime.split(':').map(Number);
          const totalMinutes = hours * 60 + minutes + 45;
          const newHours = Math.floor(totalMinutes / 60);
          const newMinutes = totalMinutes % 60;
          currentTime = `${newHours.toString().padStart(2, '0')}:${newMinutes.toString().padStart(2, '0')}`;
        }
        
        return slots;
      },
      
      isDataStale: () => {
        const { lastFetched, cacheValidDuration } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > cacheValidDuration;
      },
      
      // Cache Management
      invalidateCache: () => set({ lastFetched: null }),
      
      clearCache: () => set({
        weeklySchedule: {
          monday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          tuesday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          wednesday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          thursday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          friday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          saturday: { isOpen: true, startTime: "09:30", endTime: "21:30" },
          sunday: { isOpen: false, startTime: "09:30", endTime: "21:30" },
        },
        customSlots: [],
        lastFetched: null,
        error: null,
      }),
    }),
    {
      name: "barber-availability-store",
    }
  )
);