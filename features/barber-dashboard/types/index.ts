// Barber Dashboard Feature Types

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

export interface BarberDashboardState {
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