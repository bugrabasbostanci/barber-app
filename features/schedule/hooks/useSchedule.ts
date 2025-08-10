"use client";

import { useEffect } from 'react';
import { useScheduleState } from './useScheduleState';
import { useScheduleActions } from './useScheduleActions';
import { TimeBlock } from '../types';

export function useSchedule() {
  // Get state and actions
  const {
    // State
    blockedTimes,
    staffMembers,
    workingHours,
    businessSettings,
    loading,
    saving,
    formData,
    showDeleteDialog,
    blockToDelete,
    showValidationDialog,
    validationMessage,
    calendarOpen,
    
    // State setters
    setBlockedTimes,
    setStaffMembers,
    setLoading,
    setSaving,
    
    // Form actions
    updateFormData,
    resetForm,
    
    // Modal actions
    openDeleteDialog,
    closeDeleteDialog,
    showValidation,
    hideValidation,
    setCalendarOpen,
    
    // Settings actions
    updateWorkingHours,
    updateBusinessSettings,
  } = useScheduleState();

  // Get API actions
  const {
    fetchBlockedTimes,
    fetchStaffMembers,
    createTimeBlock,
    deleteTimeBlock,
    validateTimeBlock,
    saveWorkingHours,
    saveBusinessSettings,
  } = useScheduleActions(
    setBlockedTimes,
    setStaffMembers,
    setLoading,
    setSaving
  );

  // Initialize data on mount
  useEffect(() => {
    fetchBlockedTimes();
    fetchStaffMembers();
  }, [fetchBlockedTimes, fetchStaffMembers]);

  // Enhanced actions
  const handleCreateTimeBlock = async () => {
    const {
      blockDate,
      blockStaff,
      blockType,
      blockStartTime,
      blockEndTime,
      blockReason
    } = formData;

    // Validate
    const validation = validateTimeBlock(
      blockDate,
      blockStaff,
      blockType,
      blockStartTime,
      blockEndTime,
      blockReason
    );

    if (!validation.isValid) {
      showValidation(validation.message || 'Geçersiz veri');
      return;
    }

    if (!blockDate) return;

    // Prepare time block data
    const timeBlock: Omit<TimeBlock, 'id'> = {
      date: blockDate.toISOString().split('T')[0],
      staffId: blockStaff,
      startTime: blockType === 'full-day' ? null : blockStartTime,
      endTime: blockType === 'full-day' ? null : blockEndTime,
      reason: blockReason.trim(),
      isFullDay: blockType === 'full-day',
    };

    try {
      await createTimeBlock(timeBlock);
      resetForm();
    } catch (error) {
      // Error is already handled in createTimeBlock
    }
  };

  const handleDeleteTimeBlock = async () => {
    if (!blockToDelete) return;

    try {
      await deleteTimeBlock(blockToDelete);
      closeDeleteDialog();
    } catch (error) {
      // Error is already handled in deleteTimeBlock
    }
  };

  const handleSaveWorkingHours = async () => {
    try {
      await saveWorkingHours(workingHours);
    } catch (error) {
      // Error is already handled in saveWorkingHours
    }
  };

  const handleSaveBusinessSettings = async () => {
    try {
      await saveBusinessSettings(businessSettings);
    } catch (error) {
      // Error is already handled in saveBusinessSettings
    }
  };

  // Get staff name helper
  const getStaffName = (staffId: string): string => {
    const staff = staffMembers.find(s => s.id === staffId);
    return staff ? `${staff.firstName} ${staff.lastName}` : 'Bilinmiyor';
  };

  return {
    // State
    blockedTimes,
    staffMembers,
    workingHours,
    businessSettings,
    loading,
    saving,
    formData,
    showDeleteDialog,
    blockToDelete,
    showValidationDialog,
    validationMessage,
    calendarOpen,
    
    // Form actions
    updateFormData,
    resetForm,
    
    // Modal actions
    openDeleteDialog,
    closeDeleteDialog,
    showValidation,
    hideValidation,
    setCalendarOpen,
    
    // Settings actions
    updateWorkingHours,
    updateBusinessSettings,
    
    // Enhanced actions
    handleCreateTimeBlock,
    handleDeleteTimeBlock,
    handleSaveWorkingHours,
    handleSaveBusinessSettings,
    
    // Data actions
    fetchBlockedTimes,
    fetchStaffMembers,
    
    // Helpers
    getStaffName,
  };
}