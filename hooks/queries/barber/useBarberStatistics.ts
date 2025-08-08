"use client";

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useMemo } from 'react';
import { getCacheConfig, createBarberQueryKey, getRetryConfig } from './cache-config';

// Types for statistics
export interface DashboardStats {
  today: {
    totalAppointments: number;
    completedAppointments: number;
    cancelledAppointments: number;
    noShowAppointments: number;
    revenue: number;
    nextAppointment?: {
      id: string;
      customerName: string;
      time: string;
    };
  };
  thisWeek: {
    totalAppointments: number;
    completedAppointments: number;
    revenue: number;
    averagePerDay: number;
  };
  thisMonth: {
    totalAppointments: number;
    completedAppointments: number;
    revenue: number;
    averagePerDay: number;
    growthRate: number; // Compared to last month
  };
  overview: {
    totalCustomers: number;
    totalAppointments: number;
    averageRating?: number;
    busyDays: string[]; // Days of week that are typically busy
    busyHours: string[]; // Hour ranges that are typically busy
  };
}

export interface PeriodStats {
  period: 'day' | 'week' | 'month' | 'year';
  startDate: string;
  endDate: string;
  appointments: {
    total: number;
    completed: number;
    cancelled: number;
    noShow: number;
    completionRate: number;
    cancellationRate: number;
  };
  revenue: {
    total: number;
    average: number;
    perDay: number;
  };
  customers: {
    total: number;
    new: number;
    returning: number;
  };
  busyTimes: Array<{
    hour: string;
    appointmentCount: number;
  }>;
}

export interface CustomerStats {
  totalCustomers: number;
  newCustomers: number;
  returningCustomers: number;
  topCustomers: Array<{
    id: string;
    name: string;
    appointmentCount: number;
    totalSpent: number;
    lastAppointment: string;
  }>;
  customerRetentionRate: number;
}

// Query keys for statistics
export const statisticsKeys = {
  all: ['barber', 'statistics'] as const,
  dashboard: () => [...statisticsKeys.all, 'dashboard'] as const,
  period: (period: string, startDate: string, endDate: string) => 
    [...statisticsKeys.all, 'period', period, startDate, endDate] as const,
  customers: (startDate?: string, endDate?: string) => 
    [...statisticsKeys.all, 'customers', startDate, endDate] as const,
  revenue: (period: 'day' | 'week' | 'month' | 'year', startDate: string, endDate: string) => 
    [...statisticsKeys.all, 'revenue', period, startDate, endDate] as const,
};

// Statistics API functions
const statisticsApi = {
  getDashboardStats: async (): Promise<DashboardStats> => {
    const response = await fetch('/api/barber/statistics/dashboard');
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard statistics');
    }
    
    const result = await response.json();
    return result.data;
  },

  getPeriodStats: async (period: string, startDate: string, endDate: string): Promise<PeriodStats> => {
    const searchParams = new URLSearchParams({
      period,
      startDate,
      endDate,
    });
    
    const response = await fetch(`/api/barber/statistics/period?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch period statistics');
    }
    
    const result = await response.json();
    return result.data;
  },

  getCustomerStats: async (startDate?: string, endDate?: string): Promise<CustomerStats> => {
    const searchParams = new URLSearchParams();
    if (startDate) searchParams.append('startDate', startDate);
    if (endDate) searchParams.append('endDate', endDate);
    
    const response = await fetch(`/api/barber/statistics/customers?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch customer statistics');
    }
    
    const result = await response.json();
    return result.data;
  },

  getRevenueStats: async (period: 'day' | 'week' | 'month' | 'year', startDate: string, endDate: string) => {
    const searchParams = new URLSearchParams({
      period,
      startDate,
      endDate,
    });
    
    const response = await fetch(`/api/barber/statistics/revenue?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch revenue statistics');
    }
    
    const result = await response.json();
    return result.data;
  },
};

// Get dashboard statistics
export function useDashboardStatistics() {
  const { user } = useAuth();

  return useQuery({
    queryKey: statisticsKeys.dashboard(),
    queryFn: statisticsApi.getDashboardStats,
    enabled: !!user, // Only run if user is authenticated
    staleTime: 2 * 60 * 1000, // 2 minutes - dashboard stats need to be fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes for real-time updates
  });
}

// Get period statistics
export function usePeriodStatistics(period: 'day' | 'week' | 'month' | 'year', startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: statisticsKeys.period(period, startDate, endDate),
    queryFn: () => statisticsApi.getPeriodStats(period, startDate, endDate),
    enabled: !!user && !!period && !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Get customer statistics
export function useCustomerStatistics(startDate?: string, endDate?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: statisticsKeys.customers(startDate, endDate),
    queryFn: () => statisticsApi.getCustomerStats(startDate, endDate),
    enabled: !!user,
    staleTime: 15 * 60 * 1000, // 15 minutes - customer stats change less frequently
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
}

// Get revenue statistics
export function useRevenueStatistics(period: 'day' | 'week' | 'month' | 'year', startDate: string, endDate: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: statisticsKeys.revenue(period, startDate, endDate),
    queryFn: () => statisticsApi.getRevenueStats(period, startDate, endDate),
    enabled: !!user && !!period && !!startDate && !!endDate,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000, // 15 minutes
  });
}

// Convenience hooks for common date ranges
export function useTodayStatistics() {
  const today = new Date().toISOString().split('T')[0];
  return usePeriodStatistics('day', today, today);
}

export function useThisWeekStatistics() {
  const today = new Date();
  const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1));
  const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7));
  
  const startDate = startOfWeek.toISOString().split('T')[0];
  const endDate = endOfWeek.toISOString().split('T')[0];
  
  return usePeriodStatistics('week', startDate, endDate);
}

export function useThisMonthStatistics() {
  const today = new Date();
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
  
  const startDate = startOfMonth.toISOString().split('T')[0];
  const endDate = endOfMonth.toISOString().split('T')[0];
  
  return usePeriodStatistics('month', startDate, endDate);
}

export function useThisYearStatistics() {
  const today = new Date();
  const startOfYear = new Date(today.getFullYear(), 0, 1);
  const endOfYear = new Date(today.getFullYear(), 11, 31);
  
  const startDate = startOfYear.toISOString().split('T')[0];
  const endDate = endOfYear.toISOString().split('T')[0];
  
  return usePeriodStatistics('year', startDate, endDate);
}

// Custom hook for statistics utilities
export function useStatisticsUtils() {
  const { data: dashboardStats } = useDashboardStatistics();
  const { data: customerStats } = useCustomerStatistics();

  return useMemo(() => {
    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('tr-TR', { 
        style: 'currency', 
        currency: 'TRY' 
      }).format(amount);
    };

    const formatPercentage = (value: number): string => {
      return `${(value * 100).toFixed(1)}%`;
    };

    const calculateGrowthRate = (current: number, previous: number): number => {
      if (previous === 0) return current > 0 ? 1 : 0;
      return (current - previous) / previous;
    };

    const getPerformanceIndicator = (current: number, target: number) => {
      const percentage = (current / target) * 100;
      if (percentage >= 100) return { status: 'excellent', color: 'green' };
      if (percentage >= 80) return { status: 'good', color: 'blue' };
      if (percentage >= 60) return { status: 'warning', color: 'yellow' };
      return { status: 'poor', color: 'red' };
    };

    const getTodaysSummary = () => {
      if (!dashboardStats) return null;

      const { today } = dashboardStats;
      const completionRate = today.totalAppointments > 0 
        ? (today.completedAppointments / today.totalAppointments) * 100 
        : 0;

      return {
        appointments: today.totalAppointments,
        completed: today.completedAppointments,
        revenue: formatCurrency(today.revenue),
        completionRate: `${completionRate.toFixed(1)}%`,
        nextAppointment: today.nextAppointment,
        status: getPerformanceIndicator(today.completedAppointments, today.totalAppointments),
      };
    };

    const getWeeklyTrend = () => {
      if (!dashboardStats) return null;

      const { thisWeek } = dashboardStats;
      const completionRate = thisWeek.totalAppointments > 0 
        ? (thisWeek.completedAppointments / thisWeek.totalAppointments) * 100 
        : 0;

      return {
        appointments: thisWeek.totalAppointments,
        revenue: formatCurrency(thisWeek.revenue),
        averagePerDay: thisWeek.averagePerDay.toFixed(1),
        completionRate: `${completionRate.toFixed(1)}%`,
      };
    };

    const getMonthlyOverview = () => {
      if (!dashboardStats) return null;

      const { thisMonth } = dashboardStats;
      const completionRate = thisMonth.totalAppointments > 0 
        ? (thisMonth.completedAppointments / thisMonth.totalAppointments) * 100 
        : 0;

      return {
        appointments: thisMonth.totalAppointments,
        revenue: formatCurrency(thisMonth.revenue),
        averagePerDay: thisMonth.averagePerDay.toFixed(1),
        completionRate: `${completionRate.toFixed(1)}%`,
        growthRate: formatPercentage(thisMonth.growthRate),
        growthStatus: thisMonth.growthRate >= 0 ? 'positive' : 'negative',
      };
    };

    const getBusinessInsights = () => {
      if (!dashboardStats) return [];

      const insights = [];
      const { today, thisWeek, thisMonth, overview } = dashboardStats;

      // Today's performance
      if (today.totalAppointments === 0) {
        insights.push({
          type: 'warning',
          message: 'Bugün hiç randevu yok',
          suggestion: 'Müşterilere ulaşmayı veya promosyon yapmayı düşünün',
        });
      }

      // Weekly trend
      if (thisWeek.averagePerDay < 5) {
        insights.push({
          type: 'info',
          message: 'Haftalık ortalama düşük',
          suggestion: 'Pazarlama stratejilerinizi gözden geçirin',
        });
      }

      // Monthly growth
      if (thisMonth.growthRate < 0) {
        insights.push({
          type: 'warning',
          message: 'Bu ay geçen aya göre düşüş var',
          suggestion: 'Müşteri geri bildirimlerini analiz edin',
        });
      } else if (thisMonth.growthRate > 0.2) {
        insights.push({
          type: 'success',
          message: 'Harika büyüme trendi!',
          suggestion: 'Bu momentumu korumak için stratejilerinizi sürdürün',
        });
      }

      // Customer insights
      if (customerStats) {
        const retentionRate = customerStats.customerRetentionRate;
        if (retentionRate < 0.6) {
          insights.push({
            type: 'warning',
            message: 'Müşteri sadakati düşük',
            suggestion: 'Müşteri deneyimini iyileştirme fırsatları arayın',
          });
        }
      }

      return insights;
    };

    return {
      dashboardStats,
      customerStats,
      formatCurrency,
      formatPercentage,
      calculateGrowthRate,
      getPerformanceIndicator,
      getTodaysSummary,
      getWeeklyTrend,
      getMonthlyOverview,
      getBusinessInsights,
    };
  }, [dashboardStats, customerStats]);
}