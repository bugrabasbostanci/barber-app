"use client";

import { useState, useCallback } from 'react';
import { CalendarAppointment, CalendarFilters } from '../types';

interface CalendarModalState {
  isOpen: boolean;
  appointment: CalendarAppointment | null;
  date?: Date;
  timeSlot?: string;
}

export function useCalendarState() {
  // Modal states
  const [appointmentModal, setAppointmentModal] = useState<CalendarModalState>({
    isOpen: false,
    appointment: null,
  });

  const [newAppointmentModal, setNewAppointmentModal] = useState<CalendarModalState>({
    isOpen: false,
    appointment: null,
  });

  // Filter state
  const [filters, setFilters] = useState<CalendarFilters>({});

  // Loading states
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // Appointment modal functions
  const openAppointmentModal = useCallback((appointment: CalendarAppointment) => {
    setAppointmentModal({
      isOpen: true,
      appointment,
    });
  }, []);

  const closeAppointmentModal = useCallback(() => {
    setAppointmentModal({
      isOpen: false,
      appointment: null,
    });
  }, []);

  // New appointment modal functions
  const openNewAppointmentModal = useCallback((date?: Date, timeSlot?: string) => {
    setNewAppointmentModal({
      isOpen: true,
      appointment: null,
      date,
      timeSlot,
    });
  }, []);

  const closeNewAppointmentModal = useCallback(() => {
    setNewAppointmentModal({
      isOpen: false,
      appointment: null,
      date: undefined,
      timeSlot: undefined,
    });
  }, []);

  // Filter functions
  const updateFilters = useCallback((newFilters: Partial<CalendarFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({});
  }, []);

  // Date selection
  const handleDateSelect = useCallback((date: Date) => {
    setSelectedDate(date);
  }, []);

  const clearDateSelection = useCallback(() => {
    setSelectedDate(null);
  }, []);

  // Loading state
  const setLoadingState = useCallback((loading: boolean) => {
    setIsLoading(loading);
  }, []);

  return {
    // Modal states
    appointmentModal,
    newAppointmentModal,
    openAppointmentModal,
    closeAppointmentModal,
    openNewAppointmentModal,
    closeNewAppointmentModal,
    
    // Filter state
    filters,
    updateFilters,
    clearFilters,
    
    // Date selection
    selectedDate,
    handleDateSelect,
    clearDateSelection,
    
    // Loading state
    isLoading,
    setLoadingState,
  };
}