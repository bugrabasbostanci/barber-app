import { UserProfile, ProfileFormData, ProfileValidationErrors } from '../types/profile.types';

const API_BASE = '/api/profile';

export class ProfileService {
  static async getProfile(): Promise<UserProfile> {
    const response = await fetch(API_BASE);
    
    if (!response.ok) {
      throw new Error('Profil bilgileri alınamadı');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Profil bilgileri alınamadı');
    }
    
    return result.data;
  }

  static async updateProfile(data: Partial<ProfileFormData>): Promise<UserProfile> {
    const response = await fetch(API_BASE, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: data.firstName?.trim() || null,
        lastName: data.lastName?.trim() || null,
        phone: data.phone?.trim() || null,
      }),
    });

    if (!response.ok) {
      throw new Error('Profil güncellenemedi');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Profil güncellenemedi');
    }

    return result.data;
  }

  static async deleteProfile(): Promise<void> {
    const response = await fetch(API_BASE, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const result = await response.json();
      throw new Error(result.error || 'Hesap silinemedi');
    }
  }

  // Validation Methods
  static validatePhone(phone: string): boolean {
    const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateName(name: string): boolean {
    const trimmedName = name.trim();
    const nameRegex = /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]{2,50}$/;
    return trimmedName.length >= 2 && nameRegex.test(trimmedName);
  }

  static validateProfileData(data: ProfileFormData): { valid: boolean; errors: ProfileValidationErrors } {
    const errors: ProfileValidationErrors = {};

    if (data.firstName.trim() && !this.validateName(data.firstName)) {
      errors.firstName = 'Ad en az 2 karakter olmalı ve sadece harf içermeli';
    }

    if (data.lastName.trim() && !this.validateName(data.lastName)) {
      errors.lastName = 'Soyad en az 2 karakter olmalı ve sadece harf içermeli';
    }

    if (data.phone.trim() && !this.validatePhone(data.phone)) {
      errors.phone = 'Geçerli bir telefon numarası giriniz';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  // Formatting Methods
  static formatNameInput(value: string): string {
    return value.replace(/[^a-zA-ZçğıöşüÇĞIİÖŞÜ\s]/g, '').slice(0, 50);
  }

  static formatPhoneInput(value: string): string {
    const cleaned = value.replace(/[^\d+]/g, '');
    
    if (cleaned.startsWith('+90')) {
      const digits = cleaned.slice(3);
      if (digits.length <= 10) {
        return '+90 ' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
      }
      return '+90 ' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    
    if (cleaned.startsWith('0')) {
      const digits = cleaned.slice(1);
      if (digits.length <= 10) {
        return '0' + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
      }
      return '0' + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
    }
    
    const digits = cleaned.slice(0, 10);
    return digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, '$1 $2 $3 $4').trim();
  }

  // Utility Methods
  static getDisplayName(profile: UserProfile): string {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName} ${profile.lastName}`;
    }
    return profile.email.split('@')[0] || 'Kullanıcı';
  }

  static getUserInitials(profile: UserProfile): string {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase();
    }
    return profile.email.charAt(0).toUpperCase();
  }

  static isProfileComplete(profile: UserProfile): boolean {
    return !!(profile.firstName && profile.lastName && profile.phone);
  }

  static getRoleDisplayName(role: string): string {
    const roleNames: Record<string, string> = {
      CUSTOMER: 'Müşteri',
      BARBER: 'Berber',
      ADMIN: 'Yönetici',
      EMPLOYEE: 'Çalışan'
    };
    
    return roleNames[role] || role;
  }

  static formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  static formatDateTime(dateString: string): string {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}