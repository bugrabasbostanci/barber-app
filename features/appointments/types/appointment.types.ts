export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  notes?: string;
  customer?: {
    firstName: string;
    lastName: string;
    phone?: string;
  };
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
  };
}

export interface AppointmentFilters {
  status?: Appointment['status'];
  date?: string;
  staffId?: string;
  search?: string;
}

export interface AppointmentFormData {
  date: string;
  startTime: string;
  staffId: string;
  customerId?: string;
  manualCustomerName?: string;
  manualCustomerPhone?: string;
  notes?: string;
}

export type AppointmentStatus = Appointment['status'];

export interface AppointmentCardProps {
  appointment: Appointment;
  onEdit?: (appointment: Appointment) => void;
  onCancel?: (appointmentId: string) => void;
  onStatusChange?: (appointmentId: string, status: AppointmentStatus) => void;
}

export interface AppointmentListProps {
  appointments: Appointment[];
  loading?: boolean;
  filters?: AppointmentFilters;
  onFiltersChange?: (filters: AppointmentFilters) => void;
}

export interface AppointmentModalProps {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (appointment: Appointment) => void;
}