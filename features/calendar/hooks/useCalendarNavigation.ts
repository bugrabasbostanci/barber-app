"use client";

import { useState, useCallback, useMemo } from 'react';
import { CalendarViewType, CalendarNavigation } from '../types';

export function useCalendarNavigation(
  initialDate: Date = new Date(),
  initialViewType: CalendarViewType = 'month'
): CalendarNavigation {
  const [currentDate, setCurrentDate] = useState<Date>(initialDate);
  const [viewType, setViewType] = useState<CalendarViewType>(initialViewType);

  // Navigation functions
  const goToNext = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      
      switch (viewType) {
        case 'day':
          newDate.setDate(newDate.getDate() + 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() + 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() + 1);
          break;
      }
      
      return newDate;
    });
  }, [viewType]);

  const goToPrevious = useCallback(() => {
    setCurrentDate(prevDate => {
      const newDate = new Date(prevDate);
      
      switch (viewType) {
        case 'day':
          newDate.setDate(newDate.getDate() - 1);
          break;
        case 'week':
          newDate.setDate(newDate.getDate() - 7);
          break;
        case 'month':
          newDate.setMonth(newDate.getMonth() - 1);
          break;
      }
      
      return newDate;
    });
  }, [viewType]);

  const goToToday = useCallback(() => {
    setCurrentDate(new Date());
  }, []);

  return {
    currentDate,
    viewType,
    goToNext,
    goToPrevious,
    goToToday,
    setViewType,
    setCurrentDate,
  };
}