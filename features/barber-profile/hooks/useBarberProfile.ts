'use client'

import { useBarberProfileData } from './useBarberProfileData'
import { useBarberProfileForm } from './useBarberProfileForm'
import { BarberProfileFormData } from '../types'

// Main hook that combines data and form management
export const useBarberProfile = () => {
  const { 
    profile, 
    isLoading, 
    error, 
    updateProfile, 
    isUpdating, 
    refetch 
  } = useBarberProfileData()

  const handleSave = async (formData: BarberProfileFormData) => {
    const updateData = {
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.phone,
      email: formData.email || undefined,
      businessName: formData.businessName || undefined,
      businessAddress: formData.businessAddress || undefined,
      businessPhone: formData.businessPhone || undefined,
      workingHours: {
        start: formData.workingHoursStart,
        end: formData.workingHoursEnd
      },
      specialties: formData.specialties 
        ? formData.specialties.split(',').map(s => s.trim()).filter(Boolean)
        : undefined
    }

    await updateProfile(updateData)
    refetch() // Refresh the data
  }

  const form = useBarberProfileForm({ profile, onSave: handleSave })

  return {
    // Profile data
    profile,
    isLoading,
    error,
    isUpdating,
    
    // Form management
    ...form,
    
    // Actions
    refetch
  }
}