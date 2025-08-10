// Centralized types for appointments domain

// Common appointment interface
export interface BaseAppointment {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:MM
  endTime: string; // HH:MM
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string | null;
  createdAt: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  shop: {
    name: string;
    address: string;
  };
}

// Customer appointment interface
export interface CustomerAppointment extends BaseAppointment {
  customer?: {
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
}

// Barber appointment interface with manual customer fields
export interface BarberAppointment extends BaseAppointment {
  customer?: {
    firstName: string;
    lastName: string;
    phone: string;
  } | null;
  manualCustomerName?: string | null;
  manualCustomerPhone?: string | null;
}

// Query filters
export interface AppointmentFilters {
  startDate?: string;
  endDate?: string;
  status?: BaseAppointment['status'][];
  staffId?: string;
  customerId?: string;
}

// Pagination
export interface AppointmentPagination {
  page: number;
  limit: number;
  total?: number;
}

// Query keys for React Query
export interface AppointmentQueryKeys {
  all: readonly string[];
  lists: () => readonly string[];
  list: (filters?: AppointmentFilters) => readonly (string | AppointmentFilters)[];
  details: () => readonly string[];
  detail: (id: string) => readonly string[];
  myAppointments: () => readonly string[];
  barberAppointments: (filters?: AppointmentFilters) => readonly (string | AppointmentFilters)[];
  dayView: (date: string) => readonly string[];
  weekView: (startDate: string) => readonly string[];
  monthView: (year: number, month: number) => readonly (string | number)[];
}

// API response wrapper
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// Statistics
export interface AppointmentStats {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
  upcoming: number;
}

// Create appointment data
export interface CreateManualAppointmentData {
  customerType: 'new' | 'existing';
  existingCustomerId?: string;
  customerName?: string;
  customerPhone?: string;
  date: string;
  staffId: string;
  startTime: string;
  notes?: string;
}

// Update appointment data
export interface UpdateAppointmentData {
  status?: BaseAppointment['status'];
  notes?: string;
  startTime?: string;
  date?: string;
}

// Bulk operations
export interface BulkUpdateAppointmentData {
  ids: string[];
  status: BaseAppointment['status'];
}