// Shared types for booking stores

export interface BookingData {
  date: string;
  staffId: string;
  timeSlot: string;
}

export interface CustomerInfo {
  phone: string;
  notes: string;
}

export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface UserProfile {
  phone: string | null;
}