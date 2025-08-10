// Barber Dashboard Service Layer

import { DashboardStats, DashboardNotification } from '../types';

const API_BASE = '/api/barber';

export class BarberDashboardService {
  static async fetchDashboardStats(): Promise<DashboardStats | null> {
    const response = await fetch(`${API_BASE}/dashboard/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch dashboard stats');
    }
    const result = await response.json();
    return result.success ? result.data : null;
  }

  static async fetchNotifications(): Promise<DashboardNotification[]> {
    const response = await fetch(`${API_BASE}/notifications`);
    if (!response.ok) {
      throw new Error('Failed to fetch notifications');
    }
    const result = await response.json();
    return result.success ? result.data : [];
  }

  static async markNotificationAsRead(notificationId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}/read`, {
      method: 'PATCH',
    });

    if (!response.ok) {
      throw new Error('Failed to mark notification as read');
    }

    const result = await response.json();
    return result.success;
  }

  static async dismissNotification(notificationId: string): Promise<boolean> {
    const response = await fetch(`${API_BASE}/notifications/${notificationId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to dismiss notification');
    }

    const result = await response.json();
    return result.success;
  }
}