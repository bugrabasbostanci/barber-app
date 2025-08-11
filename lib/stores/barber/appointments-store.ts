import { create } from "zustand";
import { devtools } from "zustand/middleware";
// import { localDateTimeToUTC, dateToLocalString } from "@/lib/utils";

export interface BarberAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  notes?: string;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
  };
  createdAt: string;
}

export interface DashboardFilters {
  dateRange: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };
  status: "ALL" | "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  view: "calendar" | "list" | "timeline";
}

interface AppointmentsState {
  // Core State
  appointments: BarberAppointment[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Filters
  filters: DashboardFilters;
  selectedDate: string; // YYYY-MM-DD
  
  // Cache settings
  cacheValidDuration: number;
  
  // Actions
  setAppointments: (appointments: BarberAppointment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  fetchAppointments: (forceRefresh?: boolean) => Promise<void>;
  
  // CRUD Operations
  createAppointment: (appointmentData: Partial<BarberAppointment>) => Promise<boolean>;
  updateAppointment: (id: string, updates: Partial<BarberAppointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  
  // Filter Actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (from: string, to: string) => void;
  setStatusFilter: (status: DashboardFilters["status"]) => void;
  setSelectedDate: (date: string) => void;
  resetFilters: () => void;
  
  // Computed Functions
  getFilteredAppointments: () => BarberAppointment[];
  getTodayAppointments: () => BarberAppointment[];
  getUpcomingAppointments: () => BarberAppointment[];
  getAppointmentsByDate: (date: string) => BarberAppointment[];
  isDataStale: () => boolean;
  
  // Statistics
  getAppointmentStats: () => {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
  };
  
  // Cache Management
  invalidateCache: () => void;
  clearCache: () => void;
}

const today = new Date().toISOString().split('T')[0];
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);

export const useBarberAppointmentsStore = create<AppointmentsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      appointments: [],
      loading: false,
      error: null,
      lastFetched: null,
      
      filters: {
        dateRange: {
          from: today,
          to: nextWeek.toISOString().split('T')[0],
        },
        status: "ALL",
        view: "calendar",
      },
      selectedDate: today,
      
      cacheValidDuration: 2 * 60 * 1000, // 2 minutes
      
      // Basic Actions
      setAppointments: (appointments) => set({ 
        appointments, 
        lastFetched: Date.now(),
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Fetch Appointments
      fetchAppointments: async (forceRefresh = false) => {
        const { lastFetched, isDataStale } = get();
        
        if (!forceRefresh && lastFetched && !isDataStale()) {
          return;
        }
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/barber/appointments");
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            get().setAppointments(result.data);
          } else {
            throw new Error(result.message || "Failed to fetch appointments");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
          set({ error: errorMessage });
          console.error("Failed to fetch appointments:", error);
        } finally {
          set({ loading: false });
        }
      },
      
      // Create Appointment
      createAppointment: async (appointmentData) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/barber/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            await get().fetchAppointments(true);
            return true;
          } else {
            throw new Error(result.message || "Failed to create appointment");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to create appointment";
          set({ error: errorMessage });
          console.error("Failed to create appointment:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      
      // Update Appointment
      updateAppointment: async (id, updates) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`/api/barber/appointments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            await get().fetchAppointments(true);
            return true;
          } else {
            throw new Error(result.message || "Failed to update appointment");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to update appointment";
          set({ error: errorMessage });
          console.error("Failed to update appointment:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      
      // Delete Appointment
      deleteAppointment: async (id) => {
        set({ loading: true, error: null });
        
        try {
          const response = await fetch(`/api/barber/appointments/${id}`, {
            method: "DELETE",
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            await get().fetchAppointments(true);
            return true;
          } else {
            throw new Error(result.message || "Failed to delete appointment");
          }
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "Failed to delete appointment";
          set({ error: errorMessage });
          console.error("Failed to delete appointment:", error);
          return false;
        } finally {
          set({ loading: false });
        }
      },
      
      // Filter Actions
      setFilters: (filters) => set((state) => ({
        filters: { ...state.filters, ...filters }
      })),
      
      setDateRange: (from, to) => set((state) => ({
        filters: { ...state.filters, dateRange: { from, to } }
      })),
      
      setStatusFilter: (status) => set((state) => ({
        filters: { ...state.filters, status }
      })),
      
      setSelectedDate: (date) => set({ selectedDate: date }),
      
      resetFilters: () => set({
        filters: {
          dateRange: {
            from: today,
            to: nextWeek.toISOString().split('T')[0],
          },
          status: "ALL",
          view: "calendar",
        },
        selectedDate: today,
      }),
      
      // Computed Functions
      getFilteredAppointments: () => {
        const { appointments, filters } = get();
        
        return appointments.filter((appointment) => {
          // Date range filter
          if (filters.dateRange.from && appointment.date < filters.dateRange.from) {
            return false;
          }
          if (filters.dateRange.to && appointment.date > filters.dateRange.to) {
            return false;
          }
          
          // Status filter
          if (filters.status !== "ALL" && appointment.status !== filters.status) {
            return false;
          }
          
          return true;
        });
      },
      
      getTodayAppointments: () => {
        const { appointments } = get();
        return appointments.filter((appointment) => appointment.date === today);
      },
      
      getUpcomingAppointments: () => {
        const { appointments } = get();
        const now = new Date().toISOString().split('T')[0];
        return appointments.filter((appointment) => 
          appointment.date >= now && 
          (appointment.status === "SCHEDULED" || appointment.status === "CONFIRMED")
        );
      },
      
      getAppointmentsByDate: (date) => {
        const { appointments } = get();
        return appointments.filter((appointment) => appointment.date === date);
      },
      
      isDataStale: () => {
        const { lastFetched, cacheValidDuration } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > cacheValidDuration;
      },
      
      // Statistics
      getAppointmentStats: () => {
        const { appointments } = get();
        
        return {
          total: appointments.length,
          completed: appointments.filter(apt => apt.status === "COMPLETED").length,
          cancelled: appointments.filter(apt => apt.status === "CANCELLED").length,
          noShow: appointments.filter(apt => apt.status === "NO_SHOW").length,
        };
      },
      
      // Cache Management
      invalidateCache: () => set({ lastFetched: null }),
      
      clearCache: () => set({
        appointments: [],
        lastFetched: null,
        error: null,
      }),
    }),
    {
      name: "barber-appointments-store",
    }
  )
);