import { useState, useEffect, useMemo } from 'react';
import { ViewType, StaffMember, CalendarDay } from '../types/calendar.types';
import { CalendarService } from '../services/calendarService';
import { Appointment } from '@/features/appointments';

export function useCalendarData(initialViewType: ViewType = 'week') {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>(initialViewType);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch staff members
  useEffect(() => {
    async function fetchStaff() {
      try {
        const response = await fetch('/api/staff');
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setStaffMembers(result.data);
          } else {
            console.error('Invalid staff data format:', result);
            setStaffMembers([]);
          }
        }
      } catch (error) {
        console.error('Error fetching staff:', error);
        setError('Staff verileri yüklenemedi');
      }
    }
    fetchStaff();
  }, []);

  // Fetch appointments based on current date and view type
  useEffect(() => {
    async function fetchAppointments() {
      try {
        setLoading(true);
        setError(null);

        const { startDate, endDate } = CalendarService.getDateRange(currentDate, viewType);
        
        const params = new URLSearchParams({
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0],
        });

        const response = await fetch(`/api/barber/appointments?${params.toString()}`);
        
        if (response.ok) {
          const result = await response.json();
          if (result.success && Array.isArray(result.data)) {
            setAppointments(result.data);
          } else {
            console.error('Invalid appointments data format:', result);
            setAppointments([]);
          }
        } else {
          throw new Error('Failed to fetch appointments');
        }
      } catch (err) {
        console.error('Error fetching appointments:', err);
        setError('Randevular yüklenemedi');
        setAppointments([]);
      } finally {
        setLoading(false);
      }
    }

    fetchAppointments();
  }, [currentDate, viewType]);

  // Generate calendar data based on current state
  const calendarData = useMemo(() => {
    if (viewType === 'month') {
      return CalendarService.generateCalendarWeeks(currentDate, appointments);
    } else {
      return CalendarService.generateCalendarDays(currentDate, viewType, appointments);
    }
  }, [currentDate, viewType, appointments]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = CalendarService.navigateDate(currentDate, direction, viewType);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDate = (date: Date) => {
    setCurrentDate(date);
  };

  const changeViewType = (newViewType: ViewType) => {
    setViewType(newViewType);
  };

  const refreshData = () => {
    // Trigger a re-fetch by updating the dependency
    setCurrentDate(new Date(currentDate));
  };

  const getFormattedDateString = () => {
    return CalendarService.formatDateForDisplay(currentDate, viewType);
  };

  const getTodayAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => apt.date === today && apt.status !== 'cancelled');
  };

  const getUpcomingAppointments = () => {
    const today = new Date().toISOString().split('T')[0];
    return appointments.filter(apt => 
      apt.date >= today && 
      apt.status !== 'cancelled'
    ).sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.startTime.localeCompare(b.startTime);
    });
  };

  return {
    // State
    currentDate,
    viewType,
    appointments,
    staffMembers,
    loading,
    error,
    calendarData,

    // Actions
    navigateDate,
    goToToday,
    goToDate,
    changeViewType,
    refreshData,

    // Computed values
    getFormattedDateString,
    getTodayAppointments,
    getUpcomingAppointments,
  };
}