import { useState, useEffect } from 'react';
import { StaffService } from '../services/staffService';
import { Staff, StaffFilters } from '../types/staff.types';

export function useStaff(initialFilters?: StaffFilters) {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<StaffFilters>(initialFilters || {});

  const fetchStaff = async (currentFilters?: StaffFilters) => {
    try {
      setLoading(true);
      setError(null);
      const data = await StaffService.getStaff(currentFilters || filters);
      setStaff(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch staff');
    } finally {
      setLoading(false);
    }
  };

  const updateFilters = (newFilters: Partial<StaffFilters>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    fetchStaff(updatedFilters);
  };

  const clearFilters = () => {
    setFilters({});
    fetchStaff({});
  };

  const refreshStaff = () => {
    fetchStaff();
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  return {
    staff,
    loading,
    error,
    filters,
    updateFilters,
    clearFilters,
    refreshStaff,
  };
}