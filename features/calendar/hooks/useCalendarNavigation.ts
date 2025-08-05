import { useState } from 'react';
import { ViewType } from '../types/calendar.types';
import { CalendarService } from '../services/calendarService';

export function useCalendarNavigation(
  initialDate: Date = new Date(),
  initialViewType: ViewType = 'week'
) {
  const [currentDate, setCurrentDate] = useState(initialDate);
  const [viewType, setViewType] = useState<ViewType>(initialViewType);

  const navigatePrevious = () => {
    const newDate = CalendarService.navigateDate(currentDate, 'prev', viewType);
    setCurrentDate(newDate);
  };

  const navigateNext = () => {
    const newDate = CalendarService.navigateDate(currentDate, 'next', viewType);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const goToDate = (date: Date) => {
    setCurrentDate(new Date(date));
  };

  const changeViewType = (newViewType: ViewType) => {
    setViewType(newViewType);
  };

  const getDateRange = () => {
    return CalendarService.getDateRange(currentDate, viewType);
  };

  const getFormattedTitle = () => {
    return CalendarService.formatDateForDisplay(currentDate, viewType);
  };

  const canGoToPrevious = () => {
    // Add business logic if needed (e.g., don't allow going too far back)
    return true;
  };

  const canGoToNext = () => {
    // Add business logic if needed (e.g., don't allow going too far forward)
    return true;
  };

  const isToday = () => {
    const today = new Date();
    return CalendarService.isSameDay(currentDate, today);
  };

  const getDayOfWeek = () => {
    return currentDate.getDay();
  };

  const getWeekNumber = () => {
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const pastDaysOfYear = (currentDate.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getMonthInfo = () => {
    return {
      month: currentDate.getMonth(),
      year: currentDate.getFullYear(),
      monthName: CalendarService.getMonthNames()[currentDate.getMonth()],
      daysInMonth: new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate()
    };
  };

  return {
    // State
    currentDate,
    viewType,

    // Navigation actions
    navigatePrevious,
    navigateNext,
    goToToday,
    goToDate,
    changeViewType,

    // Computed values
    getDateRange,
    getFormattedTitle,
    canGoToPrevious,
    canGoToNext,
    isToday,
    getDayOfWeek,
    getWeekNumber,
    getMonthInfo,
  };
}