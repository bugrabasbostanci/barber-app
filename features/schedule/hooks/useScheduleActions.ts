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
      toast.error('Bloke saatler yüklenirken hata oluştu');
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
      toast.error('Personel listesi yüklenirken hata oluştu');
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
        throw new Error(error.message || 'Failed to create time block');
      }

      toast.success('Zaman bloğu başarıyla oluşturuldu');
      await fetchBlockedTimes(); // Refresh the list
    } catch (error) {
      console.error('Error creating time block:', error);
      const message = error instanceof Error ? error.message : 'Zaman bloğu oluşturulurken hata oluştu';
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

      toast.success('Zaman bloğu başarıyla silindi');
      await fetchBlockedTimes(); // Refresh the list
    } catch (error) {
      console.error('Error deleting time block:', error);
      const message = error instanceof Error ? error.message : 'Zaman bloğu silinirken hata oluştu';
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
      return { isValid: false, message: 'Lütfen bir tarih seçin' };
    }

    if (!blockStaff) {
      return { isValid: false, message: 'Lütfen bir personel seçin' };
    }

    if (blockType === 'time-range') {
      if (!blockStartTime || !blockEndTime) {
        return { isValid: false, message: 'Lütfen başlangıç ve bitiş saatlerini seçin' };
      }

      // Validate time format
      const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
      if (!timeRegex.test(blockStartTime) || !timeRegex.test(blockEndTime)) {
        return { isValid: false, message: 'Geçersiz saat formatı' };
      }

      // Check if start time is before end time
      const [startHours, startMinutes] = blockStartTime.split(':').map(Number);
      const [endHours, endMinutes] = blockEndTime.split(':').map(Number);
      
      const startMinutesTotal = startHours * 60 + startMinutes;
      const endMinutesTotal = endHours * 60 + endMinutes;
      
      if (startMinutesTotal >= endMinutesTotal) {
        return { isValid: false, message: 'Başlangıç saati bitiş saatinden önce olmalı' };
      }
    }

    if (!blockReason?.trim()) {
      return { isValid: false, message: 'Lütfen bir sebep girin' };
    }

    return { isValid: true };
  }, []);

  // Save working hours (placeholder - API endpoint needs to be implemented)
  const saveWorkingHours = useCallback(async (workingHours: any) => {
    setSaving(true);
    try {
      // TODO: Implement working hours API endpoint
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      toast.success('Çalışma saatleri başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving working hours:', error);
      toast.error('Çalışma saatleri kaydedilirken hata oluştu');
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
      toast.success('İş ayarları başarıyla kaydedildi');
    } catch (error) {
      console.error('Error saving business settings:', error);
      toast.error('İş ayarları kaydedilirken hata oluştu');
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