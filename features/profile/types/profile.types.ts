// Core Profile Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
  // Additional profile fields that might come from API
  updatedAt?: string;
  lastLogin?: string;
  totalAppointments?: number;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

// Component Props Types
export interface ProfileCardProps {
  profile: UserProfile;
  onEdit?: () => void;
  onDelete?: () => void;
  loading?: boolean;
}

export interface ProfileFormProps {
  profile?: UserProfile;
  onSubmit: (data: ProfileFormData) => Promise<boolean>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}

export interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onSave?: (profile: UserProfile) => void;
}

// Validation Types
export interface ProfileValidationErrors {
  firstName?: string;
  lastName?: string;
  phone?: string;
  email?: string;
}

// API Response Types
export interface ProfileResponse {
  success: boolean;
  data?: UserProfile;
  error?: string;
}

export interface ProfileStats {
  totalAppointments: number;
  completedAppointments: number;
  cancelledAppointments: number;
  memberSince: string;
  lastAppointment?: string;
}