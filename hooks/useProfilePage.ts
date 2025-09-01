"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

// Types
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
}

export function useProfilePage() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState<ProfileFormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: ''
  });
  const [phoneError, setPhoneError] = useState('');
  const [firstNameError, setFirstNameError] = useState('');
  const [lastNameError, setLastNameError] = useState('');

  const fetchProfile = useCallback(async (force = false) => {
    if (!user) return;
    
    setIsLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setEditForm({
          firstName: data.data.firstName || '',
          lastName: data.data.lastName || '',
          phone: data.data.phone || '',
          email: data.data.email || ''
        });
      } else {
        setError(data.error || 'Error loading profile');
      }
    } catch (err) {
      setError('Error loading profile');
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  const updateEditForm = (field: keyof ProfileFormData, value: string) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
    
    // Clear validation errors
    if (field === 'phone') setPhoneError('');
    if (field === 'firstName') setFirstNameError('');
    if (field === 'lastName') setLastNameError('');
  };

  const resetEditForm = () => {
    if (profile) {
      setEditForm({
        firstName: profile.firstName || '',
        lastName: profile.lastName || '',
        phone: profile.phone || '',
        email: profile.email || ''
      });
    }
    setPhoneError('');
    setFirstNameError('');
    setLastNameError('');
  };

  const saveProfile = async () => {
    setIsSaving(true);
    setError('');
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.data);
        setIsEditing(false);
        setSuccessMessage('Profile updated successfully');
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.error || 'Error updating profile');
      }
    } catch (err) {
      setError('Error updating profile');
    } finally {
      setIsSaving(false);
    }
  };

  const deleteAccount = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch('/api/profile', { method: 'DELETE' });
      const data = await response.json();
      return data.success;
    } catch (err) {
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  const getUserDisplayName = () => {
    if (profile?.firstName && profile?.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile?.email?.split('@')[0] || 'User';
  };

  const isFormValid = () => {
    return editForm.firstName.trim() && editForm.lastName.trim();
  };

  const hasFormChanges = () => {
    if (!profile) return false;
    return (
      editForm.firstName !== (profile.firstName || '') ||
      editForm.lastName !== (profile.lastName || '') ||
      editForm.phone !== (profile.phone || '') ||
      editForm.email !== (profile.email || '')
    );
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return {
    profile,
    isLoading,
    error,
    successMessage,
    isEditing,
    isSaving,
    isDeleting,
    editForm,
    phoneError,
    firstNameError,
    lastNameError,
    fetchProfile,
    setIsEditing,
    updateEditForm,
    resetEditForm,
    saveProfile,
    deleteAccount,
    getUserDisplayName,
    isFormValid,
    hasFormChanges,
  };
}