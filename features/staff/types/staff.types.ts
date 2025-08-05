export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'barber' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StaffFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'barber' | 'admin';
  isActive: boolean;
}

export interface StaffFilters {
  role?: Staff['role'];
  isActive?: boolean;
  search?: string;
}

export interface StaffCardProps {
  staff: Staff;
  onEdit?: (staff: Staff) => void;
  onDelete?: (staffId: string) => void;
  onToggleStatus?: (staffId: string, isActive: boolean) => void;
}

export interface StaffListProps {
  staff: Staff[];
  loading?: boolean;
  filters?: StaffFilters;
  onFiltersChange?: (filters: StaffFilters) => void;
}

export interface StaffModalProps {
  staff: Staff | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (staff: Staff) => void;
}

export interface StaffFormProps {
  staff?: Staff;
  onSubmit: (data: StaffFormData) => void;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface StaffAvailability {
  staffId: string;
  date: string;
  timeSlots: {
    time: string;
    available: boolean;
    appointmentId?: string;
  }[];
}

export interface StaffSchedule {
  staffId: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface StaffStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  revenue: number;
  rating: number;
  reviewCount: number;
}