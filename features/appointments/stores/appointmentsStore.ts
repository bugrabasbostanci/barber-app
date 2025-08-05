import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { Appointment } from '../types/appointment.types';
import {
  localDateTimeToUTC,
  canCancelAppointment as canCancel,
} from "@/lib/date-time";

interface AppointmentsState {
  // Data State
  appointments: Appointment[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
  
  // Modal State
  showCancelModal: boolean;
  appointmentToCancel: Appointment | null;
  cancellingId: string | null;
  
  // Cache settings
  cacheValidDuration: number; // 5 minutes
  
  // Actions
  setAppointments: (appointments: Appointment[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  
  // Modal Actions
  openCancelModal: (appointment: Appointment) => void;
  closeCancelModal: () => void;
  setShowCancelModal: (show: boolean) => void;
  setCancellingId: (id: string | null) => void;
  
  // API Actions
  fetchAppointments: (forceRefresh?: boolean) => Promise<void>;
  cancelAppointment: (appointmentId: string) => Promise<boolean>;
  refreshAppointments: () => Promise<void>;
  
  // Computed
  upcomingAppointments: () => Appointment[];
  pastAppointments: () => Appointment[];
  canCancelAppointment: (appointment: Appointment) => boolean;
  isDataStale: () => boolean;
  
  // Cache Management
  invalidateCache: () => void;
  clearCache: () => void;
}

export const useAppointmentsStore = create<AppointmentsState>()(
  devtools(
    (set, get) => ({
      // Initial State
      appointments: [],
      loading: false,
      error: null,
      lastFetched: null,
      
      showCancelModal: false,
      appointmentToCancel: null,
      cancellingId: null,
      
      cacheValidDuration: 5 * 60 * 1000, // 5 minutes
      
      // Basic Actions
      setAppointments: (appointments) => set({ 
        appointments, 
        lastFetched: Date.now(),
        error: null 
      }),
      
      setLoading: (loading) => set({ loading }),
      
      setError: (error) => set({ error }),
      
      // Modal Actions
      openCancelModal: (appointment) => set({
        appointmentToCancel: appointment,
        showCancelModal: true,
      }),
      
      closeCancelModal: () => set({
        showCancelModal: false,
        appointmentToCancel: null,
      }),
      
      setShowCancelModal: (show) => {
        if (!show) {
          set({
            showCancelModal: false,
            appointmentToCancel: null,
          });
        } else {
          set({ showCancelModal: true });
        }
      },
      
      setCancellingId: (id) => set({ cancellingId: id }),
      
      // API Actions
      fetchAppointments: async (forceRefresh = false) => {
        const state = get();
        
        // Check if we need to fetch (cache is stale or force refresh)
        if (!forceRefresh && !state.isDataStale() && state.appointments.length > 0) {
          return; // Use cached data
        }
        
        // Prevent duplicate fetches
        if (state.loading) return;
        
        set({ loading: true, error: null });
        
        try {
          const response = await fetch("/api/my-appointments");
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              set({ 
                appointments: result.data,
                lastFetched: Date.now(),
                error: null 
              });
            } else {
              set({ 
                error: "Randevu verileri alınamadı",
                appointments: [] 
              });
            }
          } else {
            set({ 
              error: "Randevular yüklenirken bir hata oluştu",
              appointments: [] 
            });
          }
        } catch (error) {
          console.error("Error fetching appointments:", error);
          set({ 
            error: "Bağlantı hatası oluştu",
            appointments: [] 
          });
        } finally {
          set({ loading: false });
        }
      },
      
      cancelAppointment: async (appointmentId: string) => {
        const state = get();
        
        try {
          set({ cancellingId: appointmentId, error: null });
          
          const response = await fetch(`/api/appointments/${appointmentId}/cancel`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
          });
          
          const result = await response.json();
          
          if (response.ok && result.success) {
            // Update appointment status in cache
            set({
              appointments: state.appointments.map((apt) =>
                apt.id === appointmentId
                  ? { ...apt, status: "cancelled" as const }
                  : apt
              ),
              showCancelModal: false,
              appointmentToCancel: null,
            });
            return true;
          } else {
            set({ error: result.error || "Randevu iptal edilemedi" });
            return false;
          }
        } catch (error) {
          console.error("Error cancelling appointment:", error);
          set({ error: "Randevu iptal edilirken bir hata oluştu" });
          return false;
        } finally {
          set({ cancellingId: null });
        }
      },
      
      refreshAppointments: async () => {
        await get().fetchAppointments(true);
      },
      
      // Computed Functions
      upcomingAppointments: () => {
        const state = get();
        return state.appointments.filter((apt) => {
          const aptDate = localDateTimeToUTC(apt.date, apt.startTime);
          const now = new Date();
          return aptDate > now && ["SCHEDULED", "CONFIRMED"].includes(apt.status);
        });
      },
      
      pastAppointments: () => {
        const state = get();
        return state.appointments.filter((apt) => {
          const aptDate = localDateTimeToUTC(apt.date, apt.startTime);
          const now = new Date();
          return (
            aptDate <= now ||
            ["COMPLETED", "CANCELLED", "NO_SHOW"].includes(apt.status)
          );
        });
      },
      
      canCancelAppointment: (appointment: Appointment) => {
        return (
          canCancel(appointment.date, appointment.startTime, 2) &&
          ["SCHEDULED", "CONFIRMED"].includes(appointment.status)
        );
      },
      
      isDataStale: () => {
        const state = get();
        if (!state.lastFetched) return true;
        return Date.now() - state.lastFetched > state.cacheValidDuration;
      },
      
      // Cache Management
      invalidateCache: () => set({ lastFetched: null }),
      
      clearCache: () => set({
        appointments: [],
        lastFetched: null,
        error: null,
        showCancelModal: false,
        appointmentToCancel: null,
        cancellingId: null,
      }),
    }),
    {
      name: "appointments-store",
    }
  )
);