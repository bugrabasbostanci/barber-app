'use client'

import { useProfile, useUpdateProfile } from '@/hooks/queries/useProfile'
import { BarberProfile } from '../types'

export const useBarberProfileData = () => {
  const { data: profile, isLoading, error: queryError, refetch } = useProfile()
  const updateProfileMutation = useUpdateProfile()

  const barberProfile: BarberProfile | null = profile ? {
    id: profile.id,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    role: profile.role,
    createdAt: profile.createdAt,
    businessName: (profile as any).businessName || null,
    businessAddress: (profile as any).businessAddress || null,
    businessPhone: (profile as any).businessPhone || null,
    workingHours: (profile as any).workingHours || null,
    specialties: (profile as any).specialties || null,
    isAvailable: (profile as any).isAvailable || true
  } : null

  const updateProfile = async (data: any) => {
    return updateProfileMutation.mutateAsync(data)
  }

  return {
    profile: barberProfile,
    isLoading,
    error: queryError?.message || null,
    updateProfile,
    isUpdating: updateProfileMutation.isPending,
    refetch
  }
}