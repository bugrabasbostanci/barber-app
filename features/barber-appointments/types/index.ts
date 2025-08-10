// Barber Appointments Feature Types

export interface BarberAppointment {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string | null;
  customerEmail: string;
  date: string;
  time: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed' | 'no_show';
  service: string;
  duration: number;
  price: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AppointmentFilters {
  status: string;
  dateRange: {
    start: string;
    end: string;
  } | null;
  searchTerm: string;
}

export interface AppointmentStats {
  totalAppointments: number;
  confirmedAppointments: number;
  pendingAppointments: number;
  cancelledAppointments: number;
  completedAppointments: number;
  noShowAppointments: number;
  todayAppointments: number;
  weekRevenue: number;
  monthRevenue: number;
}

export interface BarberAppointmentState {
  appointments: BarberAppointment[];
  filteredAppointments: BarberAppointment[];
  selectedAppointment: BarberAppointment | null;
  isLoading: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string;
  successMessage: string;
  filters: AppointmentFilters;
  stats: AppointmentStats | null;
  hasInitialized: boolean;
  lastFetch: number | null;
  isEditingAppointment: boolean;
  editingAppointmentId: string | null;
  appointmentNotes: string;
}

export interface BarberAppointmentActions {
  // Data fetching
  fetchAppointments: (force?: boolean) => Promise<void>;
  fetchAppointmentStats: () => Promise<void>;
  
  // Appointment management
  confirmAppointment: (appointmentId: string) => Promise<boolean>;
  cancelAppointment: (appointmentId: string, reason?: string) => Promise<boolean>;
  completeAppointment: (appointmentId: string) => Promise<boolean>;
  markNoShow: (appointmentId: string) => Promise<boolean>;
  updateAppointmentNotes: (appointmentId: string, notes: string) => Promise<boolean>;
  deleteAppointment: (appointmentId: string) => Promise<boolean>;
  
  // Selection and editing
  selectAppointment: (appointment: BarberAppointment | null) => void;
  startEditingAppointment: (appointmentId: string) => void;
  stopEditingAppointment: () => void;
  setAppointmentNotes: (notes: string) => void;
  saveAppointmentNotes: () => Promise<boolean>;
  
  // Filtering and search
  setFilters: (filters: Partial<AppointmentFilters>) => void;
  resetFilters: () => void;
  applyFilters: () => void;
  
  // Utilities
  clearMessages: () => void;
  getAppointmentsByDate: (date: string) => BarberAppointment[];
  getAppointmentsByStatus: (status: string) => BarberAppointment[];
  getTodayAppointments: () => BarberAppointment[];
  getUpcomingAppointments: () => BarberAppointment[];
}