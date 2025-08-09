import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { BarberAppointment } from "./appointments-store";

export interface AppointmentEdit {
  id: string;
  originalData: BarberAppointment;
  editData: Partial<BarberAppointment>;
  isEditing: boolean;
  isSaving: boolean;
}

interface UIState {
  // Modal State
  showCreateModal: boolean;
  showEditModal: boolean;
  showDeleteConfirm: boolean;
  showBulkActions: boolean;
  
  // View Mode
  viewMode: "calendar" | "list" | "timeline";
  
  // Appointment Editing State
  editingAppointments: Map<string, AppointmentEdit>;
  bulkEditMode: boolean;
  selectedAppointments: Set<string>;
  
  // Modal Actions
  setShowCreateModal: (show: boolean) => void;
  setShowEditModal: (show: boolean) => void;
  setShowDeleteConfirm: (show: boolean) => void;
  setShowBulkActions: (show: boolean) => void;
  
  // View Actions
  setViewMode: (mode: "calendar" | "list" | "timeline") => void;
  
  // Appointment Editing Actions
  startEditingAppointment: (appointment: BarberAppointment) => void;
  updateEditingAppointment: (id: string, updates: Partial<BarberAppointment>) => void;
  saveAppointmentEdit: (id: string) => Promise<boolean>;
  cancelAppointmentEdit: (id: string) => void;
  clearAllEdits: () => void;
  
  // Bulk Selection Actions
  toggleBulkEdit: () => void;
  selectAppointment: (id: string) => void;
  deselectAppointment: (id: string) => void;
  selectAllAppointments: (appointmentIds: string[]) => void;
  clearSelection: () => void;
  
  // Computed
  getEditingAppointment: (id: string) => AppointmentEdit | undefined;
  hasEditingAppointments: () => boolean;
  getSelectedCount: () => number;
}

export const useBarberUIStore = create<UIState>()(
  devtools(
    (set, get) => ({
      // Initial State
      showCreateModal: false,
      showEditModal: false,
      showDeleteConfirm: false,
      showBulkActions: false,
      
      viewMode: "calendar",
      
      editingAppointments: new Map(),
      bulkEditMode: false,
      selectedAppointments: new Set(),
      
      // Modal Actions
      setShowCreateModal: (show) => set({ showCreateModal: show }),
      
      setShowEditModal: (show) => set({ showEditModal: show }),
      
      setShowDeleteConfirm: (show) => set({ showDeleteConfirm: show }),
      
      setShowBulkActions: (show) => set({ showBulkActions: show }),
      
      // View Actions
      setViewMode: (mode) => set({ viewMode: mode }),
      
      // Appointment Editing Actions
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
        const current = editingAppointments.get(id);
        if (current) {
          editingAppointments.set(id, {
            ...current,
            editData: { ...current.editData, ...updates },
          });
          set({ editingAppointments });
        }
      },
      
      saveAppointmentEdit: async (id) => {
        const editingAppointments = new Map(get().editingAppointments);
        const editData = editingAppointments.get(id);
        
        if (!editData) return false;
        
        // Set saving state
        editingAppointments.set(id, { ...editData, isSaving: true });
        set({ editingAppointments });
        
        try {
          const response = await fetch(`/api/barber/appointments/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(editData.editData),
          });
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          
          const result = await response.json();
          if (result.success) {
            // Remove from editing state
            editingAppointments.delete(id);
            set({ editingAppointments });
            return true;
          } else {
            throw new Error(result.message || "Failed to save appointment");
          }
        } catch (error) {
          // Reset saving state
          editingAppointments.set(id, { ...editData, isSaving: false });
          set({ editingAppointments });
          console.error("Failed to save appointment edit:", error);
          return false;
        }
      },
      
      cancelAppointmentEdit: (id) => {
        const editingAppointments = new Map(get().editingAppointments);
        editingAppointments.delete(id);
        set({ editingAppointments });
      },
      
      clearAllEdits: () => {
        set({ editingAppointments: new Map() });
      },
      
      // Bulk Selection Actions
      toggleBulkEdit: () => {
        const { bulkEditMode } = get();
        set({ 
          bulkEditMode: !bulkEditMode,
          selectedAppointments: new Set(), // Clear selection when toggling
        });
      },
      
      selectAppointment: (id) => {
        const selectedAppointments = new Set(get().selectedAppointments);
        selectedAppointments.add(id);
        set({ selectedAppointments });
      },
      
      deselectAppointment: (id) => {
        const selectedAppointments = new Set(get().selectedAppointments);
        selectedAppointments.delete(id);
        set({ selectedAppointments });
      },
      
      selectAllAppointments: (appointmentIds) => {
        set({ selectedAppointments: new Set(appointmentIds) });
      },
      
      clearSelection: () => {
        set({ selectedAppointments: new Set() });
      },
      
      // Computed Functions
      getEditingAppointment: (id) => {
        return get().editingAppointments.get(id);
      },
      
      hasEditingAppointments: () => {
        return get().editingAppointments.size > 0;
      },
      
      getSelectedCount: () => {
        return get().selectedAppointments.size;
      },
    }),
    {
      name: "barber-ui-store",
    }
  )
);