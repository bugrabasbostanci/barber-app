"use client";

import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Dashboard view types
export type DashboardView = 'overview' | 'calendar' | 'appointments' | 'customers' | 'analytics' | 'settings';

// Time range types for analytics
export type TimeRange = 'today' | 'week' | 'month' | 'quarter' | 'year' | 'custom';

// Calendar view types
export type CalendarView = 'day' | 'week' | 'month';

// Dashboard filters
export interface DashboardFilters {
  timeRange: TimeRange;
  customDateRange: {
    start: string;
    end: string;
  } | null;
  appointmentStatus: string;
  serviceType: string;
}

// Dashboard statistics
export interface DashboardStats {
  // Today's stats
  todayAppointments: number;
  todayRevenue: number;
  todayCompletedAppointments: number;
  todayNoShows: number;
  
  // Weekly stats
  weekAppointments: number;
  weekRevenue: number;
  weekGrowthPercentage: number;
  
  // Monthly stats
  monthAppointments: number;
  monthRevenue: number;
  monthGrowthPercentage: number;
  
  // Overall stats
  totalCustomers: number;
  averageRating: number;
  popularServices: Array<{
    service: string;
    count: number;
    percentage: number;
  }>;
  
  // Performance metrics
  appointmentCompletionRate: number;
  noShowRate: number;
  cancellationRate: number;
  averageServiceDuration: number;
}

// Quick action types
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: () => void;
  disabled?: boolean;
  badge?: number;
}

// Notification types
export interface DashboardNotification {
  id: string;
  type: 'info' | 'warning' | 'error' | 'success';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
}

interface BarberDashboardState {
  // View state
  currentView: DashboardView;
  calendarView: CalendarView;
  selectedDate: string;
  
  // Data
  stats: DashboardStats | null;
  notifications: DashboardNotification[];
  quickActions: QuickAction[];
  
  // Filters and settings
  filters: DashboardFilters;
  
  // UI state
  sidebarCollapsed: boolean;
  notificationsPanelOpen: boolean;
  quickActionsPanelOpen: boolean;
  
  // Loading states
  isLoadingStats: boolean;
  isLoadingNotifications: boolean;
  
  // Error states
  error: string;
  
  // Flags
  hasInitialized: boolean;
  lastStatsUpdate: number | null;
}

interface BarberDashboardContextType {
  // State
  currentView: DashboardView;
  calendarView: CalendarView;
  selectedDate: string;
  stats: DashboardStats | null;
  notifications: DashboardNotification[];
  quickActions: QuickAction[];
  filters: DashboardFilters;
  sidebarCollapsed: boolean;
  notificationsPanelOpen: boolean;
  quickActionsPanelOpen: boolean;
  isLoadingStats: boolean;
  isLoadingNotifications: boolean;
  error: string;
  hasInitialized: boolean;
  
  // View actions
  setCurrentView: (view: DashboardView) => void;
  setCalendarView: (view: CalendarView) => void;
  setSelectedDate: (date: string) => void;
  
  // Data actions
  fetchDashboardStats: (force?: boolean) => Promise<void>;
  fetchNotifications: () => Promise<void>;
  refreshDashboard: () => Promise<void>;
  
  // Filter actions
  setFilters: (filters: Partial<DashboardFilters>) => void;
  resetFilters: () => void;
  applyTimeRange: (range: TimeRange, customRange?: { start: string; end: string }) => void;
  
  // UI actions
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  toggleNotificationsPanel: () => void;
  toggleQuickActionsPanel: () => void;
  
  // Notification actions
  markNotificationAsRead: (notificationId: string) => void;
  markAllNotificationsAsRead: () => void;
  dismissNotification: (notificationId: string) => void;
  
  // Quick actions
  executeQuickAction: (actionId: string) => void;
  updateQuickActionBadge: (actionId: string, badge: number) => void;
  
  // Utilities
  clearError: () => void;
  getUnreadNotificationCount: () => number;
  getFilteredStats: () => DashboardStats | null;
  navigateToDate: (date: string) => void;
  goToToday: () => void;
}

const BarberDashboardContext = createContext<BarberDashboardContextType | undefined>(undefined);

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

export function BarberDashboardProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<BarberDashboardState>(initialState);
  const { user, isBarber } = useAuth();

  // Only provide context if user is actually a barber
  const shouldProvideContext = isBarber();

  // Initialize quick actions
  const initializeQuickActions = useCallback((): QuickAction[] => {
    return [
      {
        id: 'new-appointment',
        label: 'Yeni Randevu',
        icon: 'calendar-plus',
        action: () => {
          // Navigate to new appointment form
          console.log('Navigate to new appointment');
        },
      },
      {
        id: 'block-time',
        label: 'Zaman Engelle',
        icon: 'calendar-x',
        action: () => {
          // Open time blocking modal
          console.log('Open time blocking modal');
        },
      },
      {
        id: 'view-today',
        label: 'Bugünkü Randevular',
        icon: 'calendar-days',
        action: () => {
          setCurrentView('appointments');
          applyTimeRange('today');
        },
      },
      {
        id: 'customer-list',
        label: 'Müşteriler',
        icon: 'users',
        action: () => {
          setCurrentView('customers');
        },
      },
      {
        id: 'analytics',
        label: 'Analitikler',
        icon: 'bar-chart-3',
        action: () => {
          setCurrentView('analytics');
        },
      },
    ];
  }, []);

  // Fetch dashboard statistics
  const fetchDashboardStats = useCallback(async (force: boolean = false) => {
    if (!shouldProvideContext) return;

    const now = Date.now();
    if (!force && state.lastStatsUpdate && (now - state.lastStatsUpdate) < STATS_CACHE_DURATION) {
      return; // Use cached data
    }

    setState(prev => ({ ...prev, isLoadingStats: true, error: '' }));

    try {
      // Mock data for development - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay
      
      const stats: DashboardStats = {
        todayAppointments: 8,
        todayRevenue: 850,
        todayCompletedAppointments: 6,
        todayNoShows: 1,
        weekAppointments: 45,
        weekRevenue: 4250,
        weekGrowthPercentage: 12.5,
        monthAppointments: 180,
        monthRevenue: 16800,
        monthGrowthPercentage: 8.3,
        totalCustomers: 156,
        averageRating: 4.7,
        popularServices: [
          { service: 'Saç Kesimi', count: 120, percentage: 45 },
          { service: 'Sakal Tıraşı', count: 80, percentage: 30 },
          { service: 'Komple Bakım', count: 40, percentage: 15 },
          { service: 'Yıkama', count: 26, percentage: 10 },
        ],
        appointmentCompletionRate: 85.5,
        noShowRate: 8.2,
        cancellationRate: 6.3,
        averageServiceDuration: 42,
      };
      
      setState(prev => ({
        ...prev,
        stats,
        isLoadingStats: false,
        lastStatsUpdate: now,
      }));
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      setState(prev => ({
        ...prev,
        isLoadingStats: false,
        error: error instanceof Error ? error.message : 'Dashboard verisi yüklenemedi',
      }));
    }
  }, [shouldProvideContext, state.lastStatsUpdate]);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!shouldProvideContext) return;

    setState(prev => ({ ...prev, isLoadingNotifications: true }));

    try {
      // Mock data for development - replace with actual API call when backend is ready
      await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
      
      const notifications: DashboardNotification[] = [
        {
          id: '1',
          type: 'info',
          title: 'Yeni Randevu',
          message: 'Ahmet Yılmaz yarın saat 14:30 için randevu aldı',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          read: false,
          actionUrl: '/barber/appointments',
          actionLabel: 'Randevuları Gör',
        },
        {
          id: '2',
          type: 'warning',
          title: 'Randevu İptali',
          message: 'Mehmet Demir bugünkü 16:00 randevusunu iptal etti',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        {
          id: '3',
          type: 'success',
          title: 'Ödeme Alındı',
          message: '850 TL haftalık kazancınız hesabınıza yatırıldı',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        }
      ];
      
      setState(prev => ({
        ...prev,
        notifications,
        isLoadingNotifications: false,
      }));
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
      setState(prev => ({
        ...prev,
        isLoadingNotifications: false,
      }));
    }
  }, [shouldProvideContext]);

  // Refresh entire dashboard
  const refreshDashboard = useCallback(async () => {
    await Promise.all([
      fetchDashboardStats(true),
      fetchNotifications(),
    ]);
  }, [fetchDashboardStats, fetchNotifications]);

  // View actions
  const setCurrentView = useCallback((view: DashboardView) => {
    setState(prev => ({ ...prev, currentView: view }));
  }, []);

  const setCalendarView = useCallback((view: CalendarView) => {
    setState(prev => ({ ...prev, calendarView: view }));
  }, []);

  const setSelectedDate = useCallback((date: string) => {
    setState(prev => ({ ...prev, selectedDate: date }));
  }, []);

  // Filter actions
  const setFilters = useCallback((newFilters: Partial<DashboardFilters>) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, ...newFilters },
    }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: initialFilters,
    }));
  }, []);

  const applyTimeRange = useCallback((range: TimeRange, customRange?: { start: string; end: string }) => {
    setState(prev => ({
      ...prev,
      filters: {
        ...prev.filters,
        timeRange: range,
        customDateRange: customRange || null,
      },
    }));
    
    // Fetch new stats with the time range
    fetchDashboardStats(true);
  }, [fetchDashboardStats]);

  // UI actions
  const toggleSidebar = useCallback(() => {
    setState(prev => ({ ...prev, sidebarCollapsed: !prev.sidebarCollapsed }));
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setState(prev => ({ ...prev, sidebarCollapsed: collapsed }));
  }, []);

  const toggleNotificationsPanel = useCallback(() => {
    setState(prev => ({ ...prev, notificationsPanelOpen: !prev.notificationsPanelOpen }));
  }, []);

  const toggleQuickActionsPanel = useCallback(() => {
    setState(prev => ({ ...prev, quickActionsPanelOpen: !prev.quickActionsPanelOpen }));
  }, []);

  // Notification actions
  const markNotificationAsRead = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      ),
    }));

    // TODO: Update on server
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.map(notification => ({
        ...notification,
        read: true,
      })),
    }));

    // TODO: Update on server
  }, []);

  const dismissNotification = useCallback((notificationId: string) => {
    setState(prev => ({
      ...prev,
      notifications: prev.notifications.filter(notification => notification.id !== notificationId),
    }));

    // TODO: Update on server
  }, []);

  // Quick actions
  const executeQuickAction = useCallback((actionId: string) => {
    const action = state.quickActions.find(qa => qa.id === actionId);
    if (action && !action.disabled) {
      action.action();
    }
  }, [state.quickActions]);

  const updateQuickActionBadge = useCallback((actionId: string, badge: number) => {
    setState(prev => ({
      ...prev,
      quickActions: prev.quickActions.map(qa =>
        qa.id === actionId ? { ...qa, badge } : qa
      ),
    }));
  }, []);

  // Utilities
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: '' }));
  }, []);

  const getUnreadNotificationCount = useCallback((): number => {
    return state.notifications.filter(n => !n.read).length;
  }, [state.notifications]);

  const getFilteredStats = useCallback((): DashboardStats | null => {
    // Apply current filters to stats
    // This is a placeholder - in a real app, you'd filter the stats based on current filters
    return state.stats;
  }, [state.stats]);

  const navigateToDate = useCallback((date: string) => {
    setSelectedDate(date);
    setCurrentView('calendar');
  }, [setSelectedDate, setCurrentView]);

  const goToToday = useCallback(() => {
    const today = new Date().toISOString().split('T')[0];
    navigateToDate(today);
  }, [navigateToDate]);

  // Initialize dashboard on mount
  useEffect(() => {
    if (shouldProvideContext && !state.hasInitialized) {
      const quickActions = initializeQuickActions();
      setState(prev => ({
        ...prev,
        quickActions,
        hasInitialized: true,
      }));
      
      fetchDashboardStats();
      fetchNotifications();
    }
  }, [shouldProvideContext, state.hasInitialized, initializeQuickActions, fetchDashboardStats, fetchNotifications]);

  const contextValue: BarberDashboardContextType = {
    currentView: state.currentView,
    calendarView: state.calendarView,
    selectedDate: state.selectedDate,
    stats: state.stats,
    notifications: state.notifications,
    quickActions: state.quickActions,
    filters: state.filters,
    sidebarCollapsed: state.sidebarCollapsed,
    notificationsPanelOpen: state.notificationsPanelOpen,
    quickActionsPanelOpen: state.quickActionsPanelOpen,
    isLoadingStats: state.isLoadingStats,
    isLoadingNotifications: state.isLoadingNotifications,
    error: state.error,
    hasInitialized: state.hasInitialized,
    setCurrentView,
    setCalendarView,
    setSelectedDate,
    fetchDashboardStats,
    fetchNotifications,
    refreshDashboard,
    setFilters,
    resetFilters,
    applyTimeRange,
    toggleSidebar,
    setSidebarCollapsed,
    toggleNotificationsPanel,
    toggleQuickActionsPanel,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    dismissNotification,
    executeQuickAction,
    updateQuickActionBadge,
    clearError,
    getUnreadNotificationCount,
    getFilteredStats,
    navigateToDate,
    goToToday,
  };

  // Only provide context if user is a barber
  if (!shouldProvideContext) {
    return <>{children}</>;
  }

  return (
    <BarberDashboardContext.Provider value={contextValue}>
      {children}
    </BarberDashboardContext.Provider>
  );
}

export function useBarberDashboard() {
  const context = useContext(BarberDashboardContext);
  if (context === undefined) {
    throw new Error('useBarberDashboard must be used within a BarberDashboardProvider');
  }
  return context;
}