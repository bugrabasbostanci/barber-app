import { Staff, StaffFilters, StaffFormData, StaffAvailability, StaffSchedule } from '../types/staff.types';

const API_BASE = '/api/staff';

export class StaffService {
  static async getStaff(filters?: StaffFilters): Promise<Staff[]> {
    const searchParams = new URLSearchParams();
    
    if (filters?.role) searchParams.append('role', filters.role);
    if (filters?.isActive !== undefined) searchParams.append('isActive', filters.isActive.toString());
    if (filters?.search) searchParams.append('search', filters.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    
    const result = await response.json();
    return result.success ? result.data : [];
  }

  static async getStaffById(id: string): Promise<Staff> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff member');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch staff member');
    }
    
    return result.data;
  }

  static async createStaff(data: StaffFormData): Promise<Staff> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create staff member');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create staff member');
    }

    return result.data;
  }

  static async updateStaff(id: string, data: Partial<StaffFormData>): Promise<Staff> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update staff member');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update staff member');
    }

    return result.data;
  }

  static async deleteStaff(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete staff member');
    }
  }

  static async toggleStaffStatus(id: string, isActive: boolean): Promise<Staff> {
    const response = await fetch(`${API_BASE}/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ isActive }),
    });

    if (!response.ok) {
      throw new Error('Failed to update staff status');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update staff status');
    }

    return result.data;
  }

  static async getStaffAvailability(staffId: string, date: string): Promise<StaffAvailability> {
    const response = await fetch(`${API_BASE}/${staffId}/availability?date=${date}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff availability');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch staff availability');
    }
    
    return result.data;
  }

  static async getStaffSchedule(staffId: string): Promise<StaffSchedule[]> {
    const response = await fetch(`${API_BASE}/${staffId}/schedule`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch staff schedule');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch staff schedule');
    }
    
    return result.data;
  }

  static async updateStaffSchedule(staffId: string, schedule: Omit<StaffSchedule, 'staffId'>[]): Promise<StaffSchedule[]> {
    const response = await fetch(`${API_BASE}/${staffId}/schedule`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(schedule),
    });

    if (!response.ok) {
      throw new Error('Failed to update staff schedule');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to update staff schedule');
    }

    return result.data;
  }

  static validateStaffData(data: StaffFormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.firstName.trim()) {
      errors.push('Ad gereklidir');
    }

    if (!data.lastName.trim()) {
      errors.push('Soyad gereklidir');
    }

    if (!data.email.trim()) {
      errors.push('E-posta adresi gereklidir');
    } else if (!this.validateEmail(data.email)) {
      errors.push('Geçerli bir e-posta adresi girin');
    }

    if (data.phone && !this.validatePhone(data.phone)) {
      errors.push('Geçerli bir telefon numarası girin');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static formatPhone(phone: string): string {
    const digits = phone.replace(/\D/g, '');
    
    if (digits.startsWith('90')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+90${digits.slice(1)}`;
    } else if (digits.length === 10) {
      return `+90${digits}`;
    }
    
    return phone;
  }

  static getRoleDisplayName(role: Staff['role']): string {
    const roleNames = {
      barber: 'Berber',
      admin: 'Yönetici'
    };
    
    return roleNames[role];
  }

  static getStatusDisplayName(isActive: boolean): string {
    return isActive ? 'Aktif' : 'Pasif';
  }

  static generateTimeSlots(): string[] {
    const slots: string[] = [];
    let hour = 9;
    let minute = 30;

    while (hour < 21 || (hour === 21 && minute <= 30)) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);

      minute += 45;
      if (minute >= 60) {
        hour += Math.floor(minute / 60);
        minute = minute % 60;
      }
    }

    return slots;
  }

  static getDayNames(): string[] {
    return ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
  }
}