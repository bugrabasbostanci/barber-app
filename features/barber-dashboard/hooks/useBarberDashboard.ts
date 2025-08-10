"use client";

import { useState, useCallback, useEffect } from 'react';
import { useAuth, useIsBarber } from '@/hooks/useAuth';
import { BarberDashboardService } from '../services/dashboardService';
import {
  BarberDashboardState,
  DashboardView,
  CalendarView,
  TimeRange,
  DashboardFilters,
  QuickAction,
} from '../types';

const STATS_CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const initialFilters: DashboardFilters = {
  timeRange: 'today',
  customDateRange: null,
  appointmentStatus: 'all',
  serviceType: 'all',
};

const initialState: BarberDashboardState = {
  currentView: 'overview',
  calendarView: 'week',
  selectedDate: new Date().toISOString().split('T')[0],
  stats: null,
  notifications: [],
  quickActions: [],
  filters: initialFilters,
  sidebarCollapsed: false,
  notificationsPanelOpen: false,
  quickActionsPanelOpen: false,
  isLoadingStats: false,
  isLoadingNotifications: false,
  error: '',
  hasInitialized: false,
  lastStatsUpdate: null,
};

export function useBarberDashboard() {
  const { user } = useAuth();
  const isBarber = useIsBarber();
  const [state, setState] = useState<BarberDashboardState>(initialState);

  // State updaters
  const updateState = useCallback((updates: Partial<BarberDashboardState>) => {
    setState(prev => ({ ...prev, ...updates }));
  }, []);

  // View actions
  const setCurrentView = useCallback((view: DashboardView) => {
    updateState({ currentView: view });
  }, [updateState]);

  const setCalendarView = useCallback((view: CalendarView) => {
    updateState({ calendarView: view });
  }, [updateState]);

  const setSelectedDate = useCallback((date: string) => {
    updateState({ selectedDate: date });
  }, [updateState]);

  // Data fetching
  const fetchDashboardStats = useCallback(async (force = false) => {
    const now = Date.now();
    if (!force && state.lastStatsUpdate && (now - state.lastStatsUpdate) < STATS_CACHE_DURATION) {
      return;
    }

    updateState({ isLoadingStats: true, error: '' });
    try {
      const stats = await BarberDashboardService.fetchDashboardStats();
      updateState({ 
        stats: stats || null, 
        lastStatsUpdate: now,
        hasInitialized: true 
      });
    } catch (error) {
      updateState({ 
        error: error instanceof Error ? error.message : 'Failed to fetch stats' 
      });
    } finally {
      updateState({ isLoadingStats: false });
    }
  }, [state.lastStatsUpdate, updateState]);

  const fetchNotifications = useCallback(async () => {
    updateState({ isLoadingNotifications: true });
    try {
      const notifications = await BarberDashboardService.fetchNotifications();
      updateState({ notifications });
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      updateState({ isLoadingNotifications: false });
    }
  }, [updateState]);

  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(true),
      fetchNotifications(),
    ]);
  }, [fetchDashboardStats, fetchNotifications]);

  // Filter actions
  const setFilters = useCallback((filters: Partial<DashboardFilters>) => {
    updateState({ 
      filters: { ...state.filters, ...filters }
    });
  }, [updateState, state.filters]);

  const resetFilters = useCallback(() => {
    updateState({ filters: initialFilters });
  }, [updateState]);

  const applyTimeRange = useCallback((range: TimeRange, customRange?: { start: string; end: string }) => {
    updateState({
      filters: {
        ...state.filters,
        timeRange: range,
        customDateRange: customRange || null,
      }
    });
  }, [updateState, state.filters]);

  // UI actions
  const toggleSidebar = useCallback(() => {
    updateState({ sidebarCollapsed: !state.sidebarCollapsed });
  }, [updateState, state.sidebarCollapsed]);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    updateState({ sidebarCollapsed: collapsed });
  }, [updateState]);

  const toggleNotificationsPanel = useCallback(() => {
    updateState({ notificationsPanelOpen: !state.notificationsPanelOpen });
  }, [updateState, state.notificationsPanelOpen]);

  const toggleQuickActionsPanel = useCallback(() => {
    updateState({ quickActionsPanelOpen: !state.quickActionsPanelOpen });
  }, [updateState, state.quickActionsPanelOpen]);

  // Notification actions
  const markNotificationAsRead = useCallback(async (notificationId: string) => {
    try {
      await BarberDashboardService.markNotificationAsRead(notificationId);
      updateState({
        notifications: state.notifications.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      });
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  }, [updateState, state.notifications]);

  const dismissNotification = useCallback(async (notificationId: string) => {
    try {
      await BarberDashboardService.dismissNotification(notificationId);
      updateState({
        notifications: state.notifications.filter(n => n.id !== notificationId)
      });
    } catch (error) {
      console.error('Failed to dismiss notification:', error);
    }
  }, [updateState, state.notifications]);

  const clearError = useCallback(() => {
    updateState({ error: '' });
  }, [updateState]);

  // Initialize quick actions
  const initializeQuickActions = useCallback(() => {
    const quickActions: QuickAction[] = [
      {
        id: 'new-appointment',
        label: 'New Appointment',
        icon: 'plus',
        action: () => setCurrentView('appointments'),
      },
      {
        id: 'view-calendar',
        label: 'Calendar',
        icon: 'calendar',
        action: () => setCurrentView('calendar'),
      },
      {
        id: 'view-analytics',
        label: 'Analytics',
        icon: 'bar-chart',
        action: () => setCurrentView('analytics'),
      },
    ];
    
    updateState({ quickActions });
  }, [updateState, setCurrentView]);

  // Auto-initialize on mount
  useEffect(() => {
    if (user && isBarber && !state.hasInitialized) {
      refreshDashboard();
      initializeQuickActions();
    }
  }, [user, isBarber, state.hasInitialized, refreshDashboard, initializeQuickActions]);

  return {
    // State
    ...state,
    
    // View actions
    setCurrentView,
    setCalendarView,
    setSelectedDate,
    
    // Data actions
    fetchDashboardStats,
    fetchNotifications,
    refreshDashboard,
    
    // Filter actions
    setFilters,
    resetFilters,
    applyTimeRange,
    
    // UI actions
    toggleSidebar,
    setSidebarCollapsed,
    toggleNotificationsPanel,
    toggleQuickActionsPanel,
    
    // Notification actions
    markNotificationAsRead,
    dismissNotification,
    
    // Utilities
    clearError,
  };
}