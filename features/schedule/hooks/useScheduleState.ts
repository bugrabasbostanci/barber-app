"use client";

import { useState, useCallback } from 'react';
import { 
  ScheduleState, 
  ScheduleFormData, 
  WorkingHours, 
  ScheduleBusinessSettings, 
  BlockType,
  WorkingDay 
} from '../types';
import { BUSINESS_RULES } from '@/lib/constants';

const initialFormData: ScheduleFormData = {
  blockDate: undefined,
  blockStaff: '',
  blockType: 'time-range',
  blockStartTime: '',
  blockEndTime: '',
  blockReason: '',
};

const initialWorkingHours: WorkingHours = {
  monday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  tuesday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  wednesday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  thursday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  friday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  saturday: {
    isOpen: true,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
  sunday: {
    isOpen: false,
    start: BUSINESS_RULES.WORKING_HOURS.start,
    end: BUSINESS_RULES.WORKING_HOURS.end,
  },
};

const initialBusinessSettings: ScheduleBusinessSettings = {
  appointmentDuration: BUSINESS_RULES.APPOINTMENT_DURATION,
  reservationDays: BUSINESS_RULES.BOOKING_WINDOW_DAYS,
  cancellationHours: BUSINESS_RULES.CANCELLATION_HOURS,
};

export function useScheduleState() {
  // Main state
  const [state, setState] = useState<ScheduleState>({
    blockedTimes: [],
    staffMembers: [],
    workingHours: initialWorkingHours,
    businessSettings: initialBusinessSettings,
    loading: false,
    saving: false,
    formData: initialFormData,
    showDeleteDialog: false,
    blockToDelete: null,
    showValidationDialog: false,
    validationMessage: '',
    calendarOpen: false,
  });

  // Form data actions
  const updateFormData = useCallback((data: Partial<ScheduleFormData>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const resetForm = useCallback(() => {
    setState(prev => ({
      ...prev,
      formData: initialFormData
    }));
  }, []);

  // Modal actions
  const openDeleteDialog = useCallback((blockId: string) => {
    setState(prev => ({
      ...prev,
      showDeleteDialog: true,
      blockToDelete: blockId
    }));
  }, []);

  const closeDeleteDialog = useCallback(() => {
    setState(prev => ({
      ...prev,
      showDeleteDialog: false,
      blockToDelete: null
    }));
  }, []);

  const showValidation = useCallback((message: string) => {
    setState(prev => ({
      ...prev,
      showValidationDialog: true,
      validationMessage: message
    }));
  }, []);

  const hideValidation = useCallback(() => {
    setState(prev => ({
      ...prev,
      showValidationDialog: false,
      validationMessage: ''
    }));
  }, []);

  const setCalendarOpen = useCallback((open: boolean) => {
    setState(prev => ({
      ...prev,
      calendarOpen: open
    }));
  }, []);

  // Settings actions
  const updateWorkingHours = useCallback((day: keyof WorkingHours, hours: Partial<WorkingDay>) => {
    setState(prev => ({
      ...prev,
      workingHours: {
        ...prev.workingHours,
        [day]: { ...prev.workingHours[day], ...hours }
      }
    }));
  }, []);

  const updateBusinessSettings = useCallback((settings: Partial<ScheduleBusinessSettings>) => {
    setState(prev => ({
      ...prev,
      businessSettings: { ...prev.businessSettings, ...settings }
    }));
  }, []);

  // Data setters
  const setBlockedTimes = useCallback((blockedTimes: typeof state.blockedTimes) => {
    setState(prev => ({ ...prev, blockedTimes }));
  }, []);

  const setStaffMembers = useCallback((staffMembers: typeof state.staffMembers) => {
    setState(prev => ({ ...prev, staffMembers }));
  }, []);

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }));
  }, []);

  const setSaving = useCallback((saving: boolean) => {
    setState(prev => ({ ...prev, saving }));
  }, []);

  return {
    // State
    ...state,
    
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
    
    // Data setters
    setBlockedTimes,
    setStaffMembers,
    setLoading,
    setSaving,
  };
}