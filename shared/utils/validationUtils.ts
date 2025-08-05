/**
 * Validation utility functions
 */

export class ValidationUtils {
  /**
   * Validate email format
   */
  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate Turkish phone number
   */
  static validatePhoneNumber(phone: string): boolean {
    const cleanPhone = phone.replace(/\D/g, '');
    
    // Turkish mobile phone patterns
    const patterns = [
      /^90[5-9]\d{9}$/, // +90 5xx xxx xxxx
      /^0[5-9]\d{9}$/, // 05xx xxx xxxx
      /^[5-9]\d{9}$/, // 5xx xxx xxxx
    ];
    
    return patterns.some(pattern => pattern.test(cleanPhone));
  }

  /**
   * Format Turkish phone number
   */
  static formatPhoneNumber(phone: string): string {
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

  /**
   * Validate password strength
   */
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

  /**
   * Validate required field
   */
  static validateRequired(value: any, fieldName: string): string | null {
    if (value === null || value === undefined || value === '') {
      return `${fieldName} gereklidir`;
    }
    return null;
  }

  /**
   * Validate minimum length
   */
  static validateMinLength(value: string, minLength: number, fieldName: string): string | null {
    if (value.length < minLength) {
      return `${fieldName} en az ${minLength} karakter olmalıdır`;
    }
    return null;
  }

  /**
   * Validate maximum length
   */
  static validateMaxLength(value: string, maxLength: number, fieldName: string): string | null {
    if (value.length > maxLength) {
      return `${fieldName} en fazla ${maxLength} karakter olmalıdır`;
    }
    return null;
  }

  /**
   * Validate numeric value
   */
  static validateNumeric(value: string, fieldName: string): string | null {
    if (isNaN(Number(value))) {
      return `${fieldName} sayısal bir değer olmalıdır`;
    }
    return null;
  }

  /**
   * Validate positive number
   */
  static validatePositiveNumber(value: number, fieldName: string): string | null {
    if (value <= 0) {
      return `${fieldName} pozitif bir sayı olmalıdır`;
    }
    return null;
  }

  /**
   * Validate Turkish ID number (TC Kimlik No)
   */
  static validateTurkishId(id: string): boolean {
    if (!/^\d{11}$/.test(id)) return false;
    
    const digits = id.split('').map(Number);
    
    // First digit cannot be 0
    if (digits[0] === 0) return false;
    
    // TC ID validation algorithm
    let sumOdd = 0;
    let sumEven = 0;
    
    for (let i = 0; i < 9; i++) {
      if (i % 2 === 0) {
        sumOdd += digits[i];
      } else {
        sumEven += digits[i];
      }
    }
    
    const check1 = (sumOdd * 7 - sumEven) % 10;
    const check2 = (sumOdd + sumEven + digits[9]) % 10;
    
    return check1 === digits[9] && check2 === digits[10];
  }

  /**
   * Validate time format (HH:MM)
   */
  static validateTimeFormat(time: string): boolean {
    const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
    return timeRegex.test(time);
  }

  /**
   * Validate date format (YYYY-MM-DD)
   */
  static validateDateFormat(date: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) return false;
    
    const dateObj = new Date(date);
    return dateObj.toISOString().slice(0, 10) === date;
  }

  /**
   * Sanitize HTML input
   */
  static sanitizeHtml(input: string): string {
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;');
  }

  /**
   * Validate URL format
   */
  static validateUrl(url: string): boolean {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check if string contains only letters and spaces
   */
  static isAlphaWithSpaces(value: string): boolean {
    return /^[a-zA-ZçğıöşüÇĞIİÖŞÜ\s]+$/.test(value);
  }

  /**
   * Check if string contains only alphanumeric characters
   */
  static isAlphanumeric(value: string): boolean {
    return /^[a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]+$/.test(value);
  }

  /**
   * Validate form data with multiple rules
   */
  static validateForm<T extends Record<string, any>>(
    data: T,
    rules: Record<keyof T, Array<(value: any) => string | null>>
  ): Record<keyof T, string[]> {
    const errors: Record<keyof T, string[]> = {} as any;
    
    for (const [field, validators] of Object.entries(rules)) {
      const fieldErrors: string[] = [];
      const value = data[field as keyof T];
      
      for (const validator of validators) {
        const error = validator(value);
        if (error) {
          fieldErrors.push(error);
        }
      }
      
      if (fieldErrors.length > 0) {
        errors[field as keyof T] = fieldErrors;
      }
    }
    
    return errors;
  }

  /**
   * Check if validation errors exist
   */
  static hasValidationErrors<T>(errors: Record<keyof T, string[]>): boolean {
    return Object.keys(errors).length > 0;
  }

  /**
   * Get first validation error message
   */
  static getFirstError<T>(errors: Record<keyof T, string[]>): string | null {
    for (const fieldErrors of Object.values(errors) as string[][]) {
      if (fieldErrors.length > 0) {
        return fieldErrors[0];
      }
    }
    return null;
  }
}