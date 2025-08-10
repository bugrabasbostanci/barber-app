"use client";

import { useState, useMemo, useCallback } from 'react';
import { AppointmentFilters, BaseAppointment } from '../types';

// Default filter values
const DEFAULT_FILTERS: AppointmentFilters = {
  startDate: undefined,
  endDate: undefined,
  status: undefined,
  staffId: undefined,
  customerId: undefined,
};

export function useAppointmentFilters(initialFilters?: Partial<AppointmentFilters>) {
  const [filters, setFilters] = useState<AppointmentFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters,
  });

  // Update individual filter
  const updateFilter = useCallback(<K extends keyof AppointmentFilters>(
    key: K, 
    value: AppointmentFilters[K]
  ) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Update multiple filters at once
  const updateFilters = useCallback((newFilters: Partial<AppointmentFilters>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  // Reset filters to default
  const resetFilters = useCallback(() => {
    setFilters({ ...DEFAULT_FILTERS, ...initialFilters });
  }, [initialFilters]);

  // Reset to initial filters
  const resetToInitial = useCallback(() => {
    setFilters({
      ...DEFAULT_FILTERS,
      ...initialFilters,
    });
  }, [initialFilters]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  // Date range helpers
  const setDateRange = useCallback((startDate: string, endDate: string) => {
    updateFilters({ startDate, endDate });
  }, [updateFilters]);

  const setToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    setDateRange(today, today);
  }, [setDateRange]);

  const setThisWeek = useCallback(() => {
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    
    setDateRange(
      startOfWeek.toISOString().split('T')[0],
      endOfWeek.toISOString().split('T')[0]
    );
  }, [setDateRange]);

  const setThisMonth = useCallback(() => {
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    
    setDateRange(
      startOfMonth.toISOString().split('T')[0],
      endOfMonth.toISOString().split('T')[0]
    );
  }, [setDateRange]);

  // Status helpers
  const setStatus = useCallback((status: BaseAppointment['status'][]) => {
    updateFilter('status', status);
  }, [updateFilter]);

  const addStatus = useCallback((status: BaseAppointment['status']) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status ? [...prev.status, status] : [status],
    }));
  }, []);

  const removeStatus = useCallback((status: BaseAppointment['status']) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status?.filter(s => s !== status) || [],
    }));
  }, []);

  const toggleStatus = useCallback((status: BaseAppointment['status']) => {
    setFilters(prev => {
      const currentStatuses = prev.status || [];
      const isIncluded = currentStatuses.includes(status);
      
      return {
        ...prev,
        status: isIncluded 
          ? currentStatuses.filter(s => s !== status)
          : [...currentStatuses, status],
      };
    });
  }, []);

  // Staff helpers
  const setStaffId = useCallback((staffId: string | undefined) => {
    updateFilter('staffId', staffId);
  }, [updateFilter]);

  // Customer helpers
  const setCustomerId = useCallback((customerId: string | undefined) => {
    updateFilter('customerId', customerId);
  }, [updateFilter]);

  // Check if filters are applied
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(value => 
      value !== undefined && 
      value !== null && 
      (Array.isArray(value) ? value.length > 0 : true)
    );
  }, [filters]);

  // Get filter summary for display
  const filterSummary = useMemo(() => {
    const parts: string[] = [];
    
    if (filters.startDate && filters.endDate) {
      if (filters.startDate === filters.endDate) {
        parts.push(`Tarih: ${filters.startDate}`);
      } else {
        parts.push(`Tarih: ${filters.startDate} - ${filters.endDate}`);
      }
    } else if (filters.startDate) {
      parts.push(`Başlangıç: ${filters.startDate}`);
    } else if (filters.endDate) {
      parts.push(`Bitiş: ${filters.endDate}`);
    }
    
    if (filters.status && filters.status.length > 0) {
      const statusLabels = {
        'SCHEDULED': 'Planlandı',
        'CONFIRMED': 'Onaylandı', 
        'COMPLETED': 'Tamamlandı',
        'CANCELLED': 'İptal Edildi',
        'NO_SHOW': 'Gelmedi'
      };
      const statusNames = filters.status.map(s => statusLabels[s]).join(', ');
      parts.push(`Durum: ${statusNames}`);
    }
    
    if (filters.staffId) {
      parts.push(`Personel: ${filters.staffId}`);
    }
    
    if (filters.customerId) {
      parts.push(`Müşteri: ${filters.customerId}`);
    }
    
    return parts.join(' | ');
  }, [filters]);

  // Get query-ready filters (remove undefined values)
  const queryFilters = useMemo(() => {
    const result: AppointmentFilters = {};
    
    if (filters.startDate) result.startDate = filters.startDate;
    if (filters.endDate) result.endDate = filters.endDate;
    if (filters.status && filters.status.length > 0) result.status = filters.status;
    if (filters.staffId) result.staffId = filters.staffId;
    if (filters.customerId) result.customerId = filters.customerId;
    
    return Object.keys(result).length > 0 ? result : undefined;
  }, [filters]);

  return {
    filters,
    queryFilters,
    hasActiveFilters,
    filterSummary,
    
    // Update functions
    updateFilter,
    updateFilters,
    resetFilters,
    resetToInitial,
    clearFilters,
    
    // Date helpers
    setDateRange,
    setToday,
    setThisWeek,
    setThisMonth,
    
    // Status helpers
    setStatus,
    addStatus,
    removeStatus,
    toggleStatus,
    
    // Staff helpers
    setStaffId,
    
    // Customer helpers
    setCustomerId,
  };
}