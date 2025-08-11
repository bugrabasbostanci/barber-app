'use client'

import { useState, useCallback, useEffect } from 'react'
import { BarberProfile, BarberProfileFormData, BarberProfileEditState } from '../types'
import { barberProfileFormSchema } from '@/lib/validations'
import { toast } from 'sonner'

interface UseBarberProfileFormProps {
  profile: BarberProfile | null
  onSave: (data: BarberProfileFormData) => Promise<void>
}

export const useBarberProfileForm = ({ profile, onSave }: UseBarberProfileFormProps) => {
  const [editState, setEditState] = useState<BarberProfileEditState>({
    isEditing: false,
    editForm: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      businessName: '',
      businessAddress: '',
      businessPhone: '',
      workingHoursStart: '',
      workingHoursEnd: '',
      specialties: ''
    },
    validationErrors: {},
    hasUnsavedChanges: false
  })

  // Initialize form when profile loads (only when we first get profile data)
  useEffect(() => {
    if (profile) {
      setEditState(prev => ({
        ...prev,
        editForm: {
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          phone: profile.phone || '',
          email: profile.email || '',
          businessName: profile.businessName || '',
          businessAddress: profile.businessAddress || '',
          businessPhone: profile.businessPhone || '',
          workingHoursStart: profile.workingHours?.start || '09:30',
          workingHoursEnd: profile.workingHours?.end || '21:30',
          specialties: profile.specialties?.join(', ') || ''
        }
      }))
    }
  }, [profile?.id]) // Only run when profile ID changes, not on every profile update

  const startEditing = useCallback(() => {
    setEditState(prev => ({ ...prev, isEditing: true, hasUnsavedChanges: false }))
  }, [])

  const cancelEditing = useCallback(() => {
    setEditState(prev => {
      if (prev.hasUnsavedChanges) {
        const confirmed = window.confirm('Kaydedilmemiş değişiklikleriniz var. İptal etmek istediğinizden emin misiniz?')
        if (!confirmed) return prev
      }
      
      return {
        ...prev,
        isEditing: false,
        hasUnsavedChanges: false,
        validationErrors: {}
      }
    })
  }, [])

  const updateFormField = useCallback((field: keyof BarberProfileFormData, value: string) => {
    setEditState(prev => ({
      ...prev,
      editForm: { ...prev.editForm, [field]: value },
      hasUnsavedChanges: true,
      validationErrors: { ...prev.validationErrors, [field]: '' } // Clear field error on change
    }))
  }, [])

  const validateForm = useCallback((formData: BarberProfileFormData): boolean => {
    try {
      barberProfileFormSchema.parse({
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email || undefined,
        businessName: formData.businessName || undefined,
        address: formData.businessAddress || undefined
      })
      
      setEditState(prev => ({ ...prev, validationErrors: {} }))
      return true
    } catch (error: any) {
      if (error.issues) {
        const errors: Record<string, string> = {}
        error.issues.forEach((issue: any) => {
          const field = issue.path[0]
          errors[field] = issue.message
        })
        setEditState(prev => ({ ...prev, validationErrors: errors }))
      }
      return false
    }
  }, [])

  const saveProfile = useCallback(async () => {
    if (!validateForm(editState.editForm)) {
      toast.error('Lütfen form hatalarını düzeltin')
      return
    }

    try {
      await onSave(editState.editForm)
      setEditState(prev => ({
        ...prev,
        isEditing: false,
        hasUnsavedChanges: false,
        validationErrors: {}
      }))
      toast.success('Profil başarıyla güncellendi')
    } catch (error) {
      console.error('Profile save error:', error)
      toast.error('Profil güncellenirken hata oluştu')
    }
  }, [editState.editForm, onSave, validateForm])

  // Validation utilities
  const validatePhoneNumber = useCallback((phone: string): boolean => {
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/
    return phoneRegex.test(phone.replace(/\s/g, ''))
  }, [])

  const formatPhoneNumber = useCallback((phone: string): string => {
    const cleaned = phone.replace(/\D/g, '')
    if (cleaned.startsWith('90')) {
      const number = cleaned.slice(2)
      if (number.length <= 3) return number
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`
      if (number.length <= 8) return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`
    }
    
    if (cleaned.startsWith('0')) {
      const number = cleaned.slice(1)
      if (number.length <= 3) return number
      if (number.length <= 6) return `${number.slice(0, 3)} ${number.slice(3)}`
      if (number.length <= 8) return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6)}`
      return `${number.slice(0, 3)} ${number.slice(3, 6)} ${number.slice(6, 8)} ${number.slice(8, 10)}`
    }
    
    if (cleaned.length <= 3) return cleaned
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
    if (cleaned.length <= 8) return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6)}`
    return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 8)} ${cleaned.slice(8, 10)}`
  }, [])

  return {
    editState,
    startEditing,
    cancelEditing,
    updateFormField,
    saveProfile,
    validateForm,
    validatePhoneNumber,
    formatPhoneNumber
  }
}