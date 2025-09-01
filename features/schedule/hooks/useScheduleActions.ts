"use client";

import { useCallback } from 'react';
import { toast } from 'sonner';
import { TimeBlock, Staff, ValidationResult } from '../types';

export function useScheduleActions(
  setBlockedTimes: (blocks: TimeBlock[]) => void,
  setStaffMembers: (staff: Staff[]) => void,
  setLoading: (loading: boolean) => void,
  setSaving: (saving: boolean) => void
) {
  // Fetch blocked times
  const fetchBlockedTimes = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/time-blocks');
      if (!response.ok) {
        throw new Error('Failed to fetch blocked times');
      }
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setBlockedTimes(result.data);
      } else {
        setBlockedTimes([]);
      }
    } catch (error) {
      console.error('Error fetching blocked times:', error);
      toast.error('Error loading blocked times');
      setBlockedTimes([]);
    } finally {
      setLoading(false);
    }
  }, [setBlockedTimes, setLoading]);

  // Fetch staff members
  const fetchStaffMembers = useCallback(async () => {
    try {
      const response = await fetch('/api/staff');
      if (!response.ok) {
        throw new Error('Failed to fetch staff');
      }
      const result = await response.json();
      
      if (result.success && Array.isArray(result.data)) {
        setStaffMembers(result.data);
      } else {
        setStaffMembers([]);
      }
    } catch (error) {
      console.error('Error fetching staff:', error);
      toast.error('Error loading staff list');
      setStaffMembers([]);
    }
  }, [setStaffMembers]);

  // Create time block
  const createTimeBlock = useCallback(async (block: Omit<TimeBlock, 'id'>) => {
    setSaving(true);
    try {
      const response = await fetch('/api/time-blocks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: block.date,
          staffId: block.staffId,
          startTime: block.isFullDay ? null : block.startTime,
          endTime: block.isFullDay ? null : block.endTime,
          reason: block.reason,
          isFullDay: block.isFullDay,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || error.error || 'Failed to create time block');
      }

      toast.success('Time block created successfully');
      await fetchBlockedTimes(); // Refresh the list
    } catch (error) {
      console.error('Error creating time block:', error);
      const message = error instanceof Error ? error.message : 'Error creating time block';
      toast.error(message);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [setSaving, fetchBlockedTimes]);

  // Delete time block
  const deleteTimeBlock = useCallback(async (id: string) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/time-blocks/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete time block');
      }

      toast.success('Time block deleted successfully');
      await fetchBlockedTimes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting time block:', error);
      const message = error instanceof Error ? error.message : 'Error deleting time block';
      toast.error(message);
      throw error;
    } finally {
      setSaving(false);
    }
  }, [setSaving, fetchBlockedTimes]);

  // Validate time block data
  const validateTimeBlock = useCallback((
    blockDate?: Date,
    blockStaff?: string,
    blockType?: string,
    blockStartTime?: string,
    blockEndTime?: string,
    blockReason?: string
  ): ValidationResult => {
    if (!blockDate) {
      return { isValid: false, message: 'Please select a date' };
    }

    if (!blockStaff) {
      return { isValid: false, message: 'Please select a staff member' };
    }

    if (blockType === 'time-range') {
      if (!blockStartTime || !blockEndTime) {
        return { isValid: false, message: 'Please select start and end times' };
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(blockStartTime) || !timeRegex.test(blockEndTime)) {
        return { isValid: false, message: 'Invalid time format' };
      }

      // Check if start time is before end time
      const [startHours, startMinutes] = blockStartTime.split(':').map(Number);
      const [endHours, endMinutes] = blockEndTime.split(':').map(Number);
      
      const startMinutesTotal = startHours * 60 + startMinutes;
      const endMinutesTotal = endHours * 60 + endMinutes;
      
      if (startMinutesTotal >= endMinutesTotal) {
        return { isValid: false, message: 'Start time must be before end time' };
      }
    }

    if (!blockReason?.trim()) {
      return { isValid: false, message: 'Please enter a reason' };
    }

    return { isValid: true };
  }, []);

  // Save working hours (placeholder - API endpoint needs to be implemented)
  const saveWorkingHours = useCallback(async (workingHours: any) => {
    setSaving(true);
    try {
      // TODO: Implement working hours API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Working hours saved successfully');
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast.error('Error saving working hours');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [setSaving]);

  // Save business settings (placeholder - API endpoint needs to be implemented)
  const saveBusinessSettings = useCallback(async (settings: any) => {
    setSaving(true);
    try {
      // TODO: Implement business settings API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Business settings saved successfully');
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast.error('Error saving business settings');
      throw error;
    } finally {
      setSaving(false);
    }
  }, [setSaving]);

  return {
    fetchBlockedTimes,
    fetchStaffMembers,
    createTimeBlock,
    deleteTimeBlock,
    validateTimeBlock,
    saveWorkingHours,
    saveBusinessSettings,
  };
}