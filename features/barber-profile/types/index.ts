// Barber profile types
export interface BarberProfile {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  role: string
  createdAt: string
  // Barber-specific fields
  businessName: string | null
  businessAddress: string | null
  businessPhone: string | null
  workingHours: {
    start: string
    end: string
  } | null
  specialties: string[] | null
  isAvailable: boolean
}

export interface BarberProfileFormData {
  firstName: string
  lastName: string
  phone: string
  email: string
  businessName: string
  businessAddress: string
  businessPhone: string
  workingHoursStart: string
  workingHoursEnd: string
  specialties: string
}

export interface BarberProfileEditState {
  isEditing: boolean
  editForm: BarberProfileFormData
  validationErrors: Record<string, string>
  hasUnsavedChanges: boolean
}