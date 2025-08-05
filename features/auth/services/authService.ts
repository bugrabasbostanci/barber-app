import { 
  User, 
  LoginCredentials, 
  RegisterData, 
  ResetPasswordData, 
  UpdatePasswordData,
  AuthResponse 
} from '../types/auth.types';

const API_BASE = '/api/auth';

export class AuthService {
  static async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Giriş başarısız' };
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Giriş sırasında hata oluştu' 
      };
    }
  }

  static async register(data: RegisterData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Kayıt başarısız' };
      }

      return { success: true, user: result.user };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Kayıt sırasında hata oluştu' 
      };
    }
  }

  static async logout(): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/logout`, {
        method: 'POST',
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Çıkış başarısız' };
      }

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Çıkış sırasında hata oluştu' 
      };
    }
  }

  static async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/forgot-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Şifre sıfırlama başarısız' };
      }

      return { success: true, message: result.message };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Şifre sıfırlama sırasında hata oluştu' 
      };
    }
  }

  static async updatePassword(data: UpdatePasswordData): Promise<AuthResponse> {
    try {
      const response = await fetch(`${API_BASE}/update-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Şifre güncelleme başarısız' };
      }

      return { success: true, message: result.message };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Şifre güncelleme sırasında hata oluştu' 
      };
    }
  }

  static async getCurrentUser(): Promise<User | null> {
    try {
      const response = await fetch(`${API_BASE}/me`);
      
      if (!response.ok) {
        return null;
      }

      const result = await response.json();
      
      if (!result.success) {
        return null;
      }

      return result.user;
    } catch (error) {
      console.error('Error fetching current user:', error);
      return null;
    }
  }

  static async checkUserRole(): Promise<{ role: User['role'] | null; success: boolean }> {
    try {
      const response = await fetch(`${API_BASE}/check-role`);
      
      if (!response.ok) {
        return { role: null, success: false };
      }

      const result = await response.json();
      
      return {
        role: result.role || null,
        success: result.success || false
      };
    } catch (error) {
      console.error('Error checking user role:', error);
      return { role: null, success: false };
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static validatePassword(password: string): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (password.length < 6) {
      errors.push('Şifre en az 6 karakter olmalıdır');
    }
    
    if (!/[A-Z]/.test(password)) {
      errors.push('Şifre en az bir büyük harf içermelidir');
    }
    
    if (!/[a-z]/.test(password)) {
      errors.push('Şifre en az bir küçük harf içermelidir');
    }
    
    if (!/\d/.test(password)) {
      errors.push('Şifre en az bir rakam içermelidir');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validatePhone(phone: string): boolean {
    // Turkish phone number validation
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static formatPhone(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle Turkish phone numbers
    if (digits.startsWith('90')) {
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      return `+90${digits.slice(1)}`;
    } else if (digits.length === 10) {
      return `+90${digits}`;
    }
    
    return phone;
  }

  static getErrorMessage(error: string): string {
    const errorMessages: Record<string, string> = {
      'Invalid email or password': 'E-posta veya şifre hatalı',
      'User already exists': 'Bu e-posta adresi zaten kullanımda',
      'Invalid email format': 'Geçersiz e-posta formatı',
      'Password too weak': 'Şifre çok zayıf',
      'User not found': 'Kullanıcı bulunamadı',
      'Invalid token': 'Geçersiz token',
      'Token expired': 'Token süresi dolmuş',
      'Unauthorized': 'Yetkisiz erişim',
      'Forbidden': 'Erişim reddedildi',
    };

    return errorMessages[error] || error;
  }

  static isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      return payload.exp < currentTime;
    } catch (error) {
      return true;
    }
  }

  static getTokenExpiry(token: string): Date | null {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return new Date(payload.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  static isAlphaWithSpaces(value: string): boolean {
    return /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/.test(value);
  }
}