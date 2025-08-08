import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { localDateTimeToUTC, dateToLocalString } from "@/lib/date-time";

// Types for barber appointments
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

// Types for availability settings
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

// Dashboard filters
export interface DashboardFilters {
  dateRange: {
    from: string; // YYYY-MM-DD
    to: string; // YYYY-MM-DD
  };
  status: "ALL" | "SCHEDULED" | "CONFIRMED" | "COMPLETED" | "CANCELLED" | "NO_SHOW";
  view: "calendar" | "list" | "timeline";
}

// Appointment editing state
export interface AppointmentEdit {
  id: string;
  originalData: BarberAppointment;
  editData: Partial<BarberAppointment>;
  isEditing: boolean;
  isSaving: boolean;
}

interface BarberState {
  // Appointments State
  appointments: BarberAppointment[];
  appointmentsLoading: boolean;
  appointmentsError: string | null;
  appointmentsLastFetched: number | null;

  // Appointment Editing State
  editingAppointments: Map<string, AppointmentEdit>;
  bulkEditMode: boolean;
  selectedAppointments: Set<string>;

  // Availability Settings State
  weeklySchedule: WeeklySchedule;
  customSlots: AvailabilitySlot[];
  availabilityLoading: boolean;
  availabilityError: string | null;
  availabilityLastFetched: number | null;

  // Dashboard State
  filters: DashboardFilters;
  viewMode: "calendar" | "list" | "timeline";
  selectedDate: string; // YYYY-MM-DD
  
  // UI State
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  showBulkActions: boolean;

  // Cache settings
  cacheValidDuration: number; // 2 minutes for real-time data

  // Appointment Actions
  setAppointments: (appointments: BarberAppointment[]) => void;
  setAppointmentsLoading: (loading: boolean) => void;
  setAppointmentsError: (error: string | null) => void;
  fetchAppointments: (forceRefresh?: boolean) => Promise<void>;
  
  // Appointment CRUD with optimistic updates
  createAppointment: (appointmentData: Partial<BarberAppointment>) => Promise<boolean>;
  updateAppointment: (id: string, updates: Partial<BarberAppointment>) => Promise<boolean>;
  deleteAppointment: (id: string) => Promise<boolean>;
  bulkUpdateAppointments: (ids: string[], updates: Partial<BarberAppointment>) => Promise<boolean>;

  // Appointment Editing State Management
  startEditingAppointment: (appointment: BarberAppointment) => void;
  updateEditingAppointment: (id: string, updates: Partial<BarberAppointment>) => void;
  saveAppointmentEdit: (id: string) => Promise<boolean>;
  cancelAppointmentEdit: (id: string) => void;
  clearAllEdits: () => void;

  // Bulk Selection
  toggleBulkEdit: () => void;
  selectAppointment: (id: string) => void;
  deselectAppointment: (id: string) => void;
  selectAllAppointments: () => void;
  clearSelection: () => void;

  // Availability Actions
  setWeeklySchedule: (schedule: WeeklySchedule) => void;
  updateDaySchedule: (day: keyof WeeklySchedule, schedule: { isOpen: boolean; startTime: string; endTime: string }) => void;
  addCustomSlot: (slot: AvailabilitySlot) => void;
  removeCustomSlot: (id: string) => void;
  updateCustomSlot: (id: string, updates: Partial<AvailabilitySlot>) => void;
  fetchAvailability: (forceRefresh?: boolean) => Promise<void>;
  saveAvailability: () => Promise<boolean>;

  // Dashboard Filter Actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  setDateRange: (from: string, to: string) => void;
  setStatusFilter: (status: DashboardFilters["status"]) => void;
  setViewMode: (mode: "calendar" | "list" | "timeline") => void;
  setSelectedDate: (date: string) => void;
  resetFilters: () => void;

  // UI Actions
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowBulkActions: (show: boolean) => void;

  // Computed Functions
  getFilteredAppointments: () => BarberAppointment[];
  getTodayAppointments: () => BarberAppointment[];
  getUpcomingAppointments: () => BarberAppointment[];
  getAppointmentsByDate: (date: string) => BarberAppointment[];
  isAppointmentsDataStale: () => boolean;
  isAvailabilityDataStale: () => boolean;

  // Statistics
  getAppointmentStats: () => {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    revenue: number;
  };

  // Enhanced rollback mechanisms
  rollbackAppointmentChanges: (originalAppointments: BarberAppointment[]) => void;
  rollbackAvailabilityChanges: (originalWeeklySchedule: WeeklySchedule, originalCustomSlots: AvailabilitySlot[]) => void;
  
  // Optimistic update helpers
  createOptimisticAppointment: (appointmentData: Partial<BarberAppointment>) => string;
  removeOptimisticAppointment: (tempId: string) => void;
  updateOptimisticAppointment: (tempId: string, realAppointment: BarberAppointment) => void;

  // Cache Management
  invalidateAppointmentsCache: () => void;
  invalidateAvailabilityCache: () => void;
  clearAllCache: () => void;
}

export const useBarberStore = create<BarberState>()(
  devtools(
    (set, get) => ({
      // Initial State
      appointments: [],
      appointmentsLoading: false,
      appointmentsError: null,
      appointmentsLastFetched: null,

      editingAppointments: new Map(),
      bulkEditMode: false,
      selectedAppointments: new Set(),

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
      availabilityLoading: false,
      availabilityError: null,
      availabilityLastFetched: null,

      filters: {
        dateRange: {
          from: dateToLocalString(new Date()),
          to: dateToLocalString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), // 7 days ahead
        },
        status: "ALL",
        view: "calendar",
      },
      viewMode: "calendar",
      selectedDate: dateToLocalString(new Date()),

      showCreateModal: false,
      showEditModal: false,
      showDeleteConfirm: false,
      showBulkActions: false,

      cacheValidDuration: 2 * 60 * 1000, // 2 minutes

      // Basic Appointment Actions
      setAppointments: (appointments) => set({
        appointments,
        appointmentsLastFetched: Date.now(),
        appointmentsError: null
      }),

      setAppointmentsLoading: (loading) => set({ appointmentsLoading: loading }),

      setAppointmentsError: (error) => set({ appointmentsError: error }),

      fetchAppointments: async (forceRefresh = false) => {
        const state = get();
        
        if (!forceRefresh && !state.isAppointmentsDataStale() && state.appointments.length > 0) {
          return;
        }
        
        if (state.appointmentsLoading) return;
        
        set({ appointmentsLoading: true, appointmentsError: null });
        
        try {
          const response = await fetch("/api/barber/appointments");
          
          if (response.ok) {
            const result = await response.json();
            if (result.success && Array.isArray(result.data)) {
              set({
                appointments: result.data,
                appointmentsLastFetched: Date.now(),
                appointmentsError: null
              });
            } else {
              set({
                appointmentsError: "Randevu verileri alınamadı",
                appointments: []
              });
            }
          } else {
            set({
              appointmentsError: "Randevular yüklenirken bir hata oluştu",
              appointments: []
            });
          }
        } catch (error) {
          console.error("Error fetching barber appointments:", error);
          set({
            appointmentsError: "Bağlantı hatası oluştu",
            appointments: []
          });
        } finally {
          set({ appointmentsLoading: false });
        }
      },

      // CRUD Operations with Optimistic Updates
      createAppointment: async (appointmentData) => {
        try {
          // Optimistic update - add temporary appointment
          const tempId = `temp_${Date.now()}`;
          const tempAppointment: BarberAppointment = {
            id: tempId,
            date: appointmentData.date || dateToLocalString(new Date()),
            startTime: appointmentData.startTime || "09:30",
            endTime: appointmentData.endTime || "10:15",
            status: "SCHEDULED",
            notes: appointmentData.notes,
            customer: appointmentData.customer || {
              id: "temp",
              firstName: "Yeni",
              lastName: "Müşteri",
              email: "temp@example.com"
            },
            createdAt: new Date().toISOString(),
          };

          const state = get();
          set({
            appointments: [...state.appointments, tempAppointment],
          });

          const response = await fetch("/api/barber/appointments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(appointmentData),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Replace temp appointment with real one
            set({
              appointments: state.appointments.map(apt =>
                apt.id === tempId ? result.data : apt
              ),
            });
            return true;
          } else {
            // Rollback optimistic update
            set({
              appointments: state.appointments.filter(apt => apt.id !== tempId),
              appointmentsError: result.error || "Randevu oluşturulamadı"
            });
            return false;
          }
        } catch (error) {
          console.error("Error creating appointment:", error);
          set({ appointmentsError: "Randevu oluşturulurken bir hata oluştu" });
          return false;
        }
      },

      updateAppointment: async (id, updates) => {
        try {
          const state = get();
          const originalAppointment = state.appointments.find(apt => apt.id === id);
          
          if (!originalAppointment) return false;

          // Optimistic update
          set({
            appointments: state.appointments.map(apt =>
              apt.id === id ? { ...apt, ...updates } : apt
            ),
          });

          const response = await fetch(`/api/barber/appointments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updates),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Update with server response
            set({
              appointments: state.appointments.map(apt =>
                apt.id === id ? result.data : apt
              ),
            });
            return true;
          } else {
            // Rollback optimistic update
            set({
              appointments: state.appointments.map(apt =>
                apt.id === id ? originalAppointment : apt
              ),
              appointmentsError: result.error || "Randevu güncellenemedi"
            });
            return false;
          }
        } catch (error) {
          console.error("Error updating appointment:", error);
          set({ appointmentsError: "Randevu güncellenirken bir hata oluştu" });
          return false;
        }
      },

      deleteAppointment: async (id) => {
        try {
          const state = get();
          const appointmentToDelete = state.appointments.find(apt => apt.id === id);
          
          if (!appointmentToDelete) return false;

          // Optimistic update
          set({
            appointments: state.appointments.filter(apt => apt.id !== id),
          });

          const response = await fetch(`/api/barber/appointments/${id}`, {
            method: "DELETE",
          });

          const result = await response.json();

          if (response.ok && result.success) {
            return true;
          } else {
            // Rollback optimistic update
            set({
              appointments: [...state.appointments, appointmentToDelete],
              appointmentsError: result.error || "Randevu silinemedi"
            });
            return false;
          }
        } catch (error) {
          console.error("Error deleting appointment:", error);
          set({ appointmentsError: "Randevu silinirken bir hata oluştu" });
          return false;
        }
      },

      bulkUpdateAppointments: async (ids, updates) => {
        try {
          const state = get();
          const originalAppointments = state.appointments.filter(apt => ids.includes(apt.id));

          // Optimistic update
          set({
            appointments: state.appointments.map(apt =>
              ids.includes(apt.id) ? { ...apt, ...updates } : apt
            ),
          });

          const response = await fetch("/api/barber/appointments/bulk", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ids, updates }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            // Update with server response
            set({
              appointments: state.appointments.map(apt => {
                const updatedApt = result.data.find((updated: BarberAppointment) => updated.id === apt.id);
                return updatedApt || apt;
              }),
              selectedAppointments: new Set(), // Clear selection after bulk update
            });
            return true;
          } else {
            // Rollback optimistic update
            set({
              appointments: state.appointments.map(apt => {
                const original = originalAppointments.find(orig => orig.id === apt.id);
                return original || apt;
              }),
              appointmentsError: result.error || "Toplu güncelleme başarısız"
            });
            return false;
          }
        } catch (error) {
          console.error("Error bulk updating appointments:", error);
          set({ appointmentsError: "Toplu güncelleme sırasında bir hata oluştu" });
          return false;
        }
      },

      // Appointment Editing State Management
      startEditingAppointment: (appointment) => {
        const editingAppointments = new Map(get().editingAppointments);
        editingAppointments.set(appointment.id, {
          id: appointment.id,
          originalData: appointment,
          editData: { ...appointment },
          isEditing: true,
          isSaving: false,
        });
        set({ editingAppointments });
      },

      updateEditingAppointment: (id, updates) => {
        const editingAppointments = new Map(get().editingAppointments);
        const currentEdit = editingAppointments.get(id);
        
        if (currentEdit) {
          editingAppointments.set(id, {
            ...currentEdit,
            editData: { ...currentEdit.editData, ...updates },
          });
          set({ editingAppointments });
        }
      },

      saveAppointmentEdit: async (id) => {
        const state = get();
        const editData = state.editingAppointments.get(id);
        
        if (!editData) return false;

        // Mark as saving
        const editingAppointments = new Map(state.editingAppointments);
        editingAppointments.set(id, { ...editData, isSaving: true });
        set({ editingAppointments });

        const success = await get().updateAppointment(id, editData.editData);

        if (success) {
          // Remove from editing state
          editingAppointments.delete(id);
          set({ editingAppointments });
        } else {
          // Reset saving state
          editingAppointments.set(id, { ...editData, isSaving: false });
          set({ editingAppointments });
        }

        return success;
      },

      cancelAppointmentEdit: (id) => {
        const editingAppointments = new Map(get().editingAppointments);
        editingAppointments.delete(id);
        set({ editingAppointments });
      },

      clearAllEdits: () => {
        set({ editingAppointments: new Map() });
      },

      // Bulk Selection Management
      toggleBulkEdit: () => {
        const bulkEditMode = !get().bulkEditMode;
        set({
          bulkEditMode,
          selectedAppointments: bulkEditMode ? get().selectedAppointments : new Set(),
          showBulkActions: bulkEditMode && get().selectedAppointments.size > 0,
        });
      },

      selectAppointment: (id) => {
        const selectedAppointments = new Set(get().selectedAppointments);
        selectedAppointments.add(id);
        set({
          selectedAppointments,
          showBulkActions: selectedAppointments.size > 0,
        });
      },

      deselectAppointment: (id) => {
        const selectedAppointments = new Set(get().selectedAppointments);
        selectedAppointments.delete(id);
        set({
          selectedAppointments,
          showBulkActions: selectedAppointments.size > 0,
        });
      },

      selectAllAppointments: () => {
        const appointments = get().getFilteredAppointments();
        const selectedAppointments = new Set(appointments.map(apt => apt.id));
        set({
          selectedAppointments,
          showBulkActions: selectedAppointments.size > 0,
        });
      },

      clearSelection: () => {
        set({
          selectedAppointments: new Set(),
          showBulkActions: false,
        });
      },

      // Availability Management
      setWeeklySchedule: (schedule) => set({ weeklySchedule: schedule }),

      updateDaySchedule: (day, schedule) => {
        const weeklySchedule = { ...get().weeklySchedule };
        weeklySchedule[day] = schedule;
        set({ weeklySchedule });
      },

      addCustomSlot: (slot) => {
        const state = get();
        const newSlot = { ...slot, id: slot.id || `slot_${Date.now()}` };
        const customSlots = [...state.customSlots, newSlot];
        set({ customSlots });
      },

      removeCustomSlot: (id) => {
        const customSlots = get().customSlots.filter(slot => slot.id !== id);
        set({ customSlots });
      },

      updateCustomSlot: (id, updates) => {
        const state = get();
        const customSlots = state.customSlots.map(slot =>
          slot.id === id ? { ...slot, ...updates } : slot
        );
        set({ customSlots });
      },

      fetchAvailability: async (forceRefresh = false) => {
        const state = get();
        
        if (!forceRefresh && !state.isAvailabilityDataStale()) {
          return;
        }
        
        if (state.availabilityLoading) return;
        
        set({ availabilityLoading: true, availabilityError: null });
        
        try {
          const response = await fetch("/api/barber/availability");
          
          if (response.ok) {
            const result = await response.json();
            if (result.success) {
              set({
                weeklySchedule: result.data.weeklySchedule || get().weeklySchedule,
                customSlots: result.data.customSlots || [],
                availabilityLastFetched: Date.now(),
                availabilityError: null
              });
            } else {
              set({ availabilityError: "Müsaitlik verileri alınamadı" });
            }
          } else {
            set({ availabilityError: "Müsaitlik verileri yüklenirken bir hata oluştu" });
          }
        } catch (error) {
          console.error("Error fetching availability:", error);
          set({ availabilityError: "Bağlantı hatası oluştu" });
        } finally {
          set({ availabilityLoading: false });
        }
      },

      saveAvailability: async () => {
        try {
          const state = get();
          const { weeklySchedule, customSlots } = state;
          
          // Store original state for rollback
          const originalWeeklySchedule = { ...state.weeklySchedule };
          const originalCustomSlots = [...state.customSlots];
          
          const response = await fetch("/api/barber/availability", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ weeklySchedule, customSlots }),
          });

          const result = await response.json();

          if (response.ok && result.success) {
            set({ availabilityLastFetched: Date.now(), availabilityError: null });
            return true;
          } else {
            // Rollback on server error
            set({ 
              weeklySchedule: originalWeeklySchedule,
              customSlots: originalCustomSlots,
              availabilityError: result.error || "Müsaitlik kaydedilemedi" 
            });
            return false;
          }
        } catch (error) {
          console.error("Error saving availability:", error);
          set({ availabilityError: "Müsaitlik kaydedilirken bir hata oluştu" });
          return false;
        }
      },

      // Dashboard Filter Management
      setFilters: (newFilters) => {
        const filters = { ...get().filters, ...newFilters };
        set({ filters });
      },

      setDateRange: (from, to) => {
        const filters = { ...get().filters };
        filters.dateRange = { from, to };
        set({ filters });
      },

      setStatusFilter: (status) => {
        const filters = { ...get().filters, status };
        set({ filters });
      },

      setViewMode: (viewMode) => {
        set({ viewMode });
        const filters = { ...get().filters, view: viewMode };
        set({ filters });
      },

      setSelectedDate: (selectedDate) => set({ selectedDate }),

      resetFilters: () => {
        set({
          filters: {
            dateRange: {
              from: dateToLocalString(new Date()),
              to: dateToLocalString(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)),
            },
            status: "ALL",
            view: "calendar",
          },
          selectedDate: dateToLocalString(new Date()),
        });
      },

      // UI State Management
      setShowCreateModal: (show) => set({ showCreateModal: show }),
      setShowEditModal: (show) => set({ showEditModal: show }),
      setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
      setShowBulkActions: (show) => set({ showBulkActions: show }),

      // Computed Functions
      getFilteredAppointments: () => {
        const { appointments, filters } = get();
        
        return appointments.filter(apt => {
          // Date range filter
          const aptDate = new Date(apt.date);
          const fromDate = new Date(filters.dateRange.from);
          const toDate = new Date(filters.dateRange.to);
          
          if (aptDate < fromDate || aptDate > toDate) return false;
          
          // Status filter
          if (filters.status !== "ALL" && apt.status !== filters.status) return false;
          
          return true;
        });
      },

      getTodayAppointments: () => {
        const today = dateToLocalString(new Date());
        return get().appointments.filter(apt => apt.date === today);
      },

      getUpcomingAppointments: () => {
        const now = new Date();
        return get().appointments.filter(apt => {
          const aptDateTime = localDateTimeToUTC(apt.date, apt.startTime);
          return aptDateTime > now && ["SCHEDULED", "CONFIRMED"].includes(apt.status);
        });
      },

      getAppointmentsByDate: (date) => {
        return get().appointments.filter(apt => apt.date === date);
      },

      isAppointmentsDataStale: () => {
        const state = get();
        if (!state.appointmentsLastFetched) return true;
        return Date.now() - state.appointmentsLastFetched > state.cacheValidDuration;
      },

      isAvailabilityDataStale: () => {
        const state = get();
        if (!state.availabilityLastFetched) return true;
        return Date.now() - state.availabilityLastFetched > 10 * 60 * 1000; // 10 minutes for availability
      },

      // Statistics
      getAppointmentStats: () => {
        const appointments = get().getFilteredAppointments();
        
        return {
          total: appointments.length,
          completed: appointments.filter(apt => apt.status === "COMPLETED").length,
          cancelled: appointments.filter(apt => apt.status === "CANCELLED").length,
          noShow: appointments.filter(apt => apt.status === "NO_SHOW").length,
          revenue: appointments
            .filter(apt => apt.status === "COMPLETED")
            .length * 50, // Assuming 50 TL per appointment
        };
      },

      // Enhanced rollback mechanisms
      rollbackAppointmentChanges: (originalAppointments: BarberAppointment[]) => {
        set({ appointments: originalAppointments, appointmentsError: null });
      },

      rollbackAvailabilityChanges: (originalWeeklySchedule: WeeklySchedule, originalCustomSlots: AvailabilitySlot[]) => {
        set({ 
          weeklySchedule: originalWeeklySchedule, 
          customSlots: originalCustomSlots,
          availabilityError: null 
        });
      },

      // Optimistic update helpers
      createOptimisticAppointment: (appointmentData: Partial<BarberAppointment>) => {
        const tempId = `temp_${Date.now()}`;
        const tempAppointment: BarberAppointment = {
          id: tempId,
          date: appointmentData.date || dateToLocalString(new Date()),
          startTime: appointmentData.startTime || "09:30",
          endTime: appointmentData.endTime || "10:15",
          status: appointmentData.status || "SCHEDULED",
          notes: appointmentData.notes,
          customer: appointmentData.customer || {
            id: "temp",
            firstName: "Yeni",
            lastName: "Müşteri",
            email: "temp@example.com"
          },
          createdAt: new Date().toISOString(),
        };

        const state = get();
        set({ appointments: [...state.appointments, tempAppointment] });
        return tempId;
      },

      removeOptimisticAppointment: (tempId: string) => {
        const state = get();
        set({ appointments: state.appointments.filter(apt => apt.id !== tempId) });
      },

      updateOptimisticAppointment: (tempId: string, realAppointment: BarberAppointment) => {
        const state = get();
        set({
          appointments: state.appointments.map(apt => 
            apt.id === tempId ? realAppointment : apt
          )
        });
      },

      // Cache Management
      invalidateAppointmentsCache: () => set({ appointmentsLastFetched: null }),
      invalidateAvailabilityCache: () => set({ availabilityLastFetched: null }),
      
      clearAllCache: () => set({
        appointments: [],
        appointmentsLastFetched: null,
        appointmentsError: null,
        editingAppointments: new Map(),
        selectedAppointments: new Set(),
        customSlots: [],
        availabilityLastFetched: null,
        availabilityError: null,
        bulkEditMode: false,
        showCreateModal: false,
        showEditModal: false,
        showDeleteConfirm: false,
        showBulkActions: false,
      }),
    }),
    {
      name: "barber-store",
    }
  )
);