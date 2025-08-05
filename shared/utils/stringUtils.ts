/**
 * String utility functions
 */

export class StringUtils {
  /**
   * Capitalize first letter of each word
   */
  static capitalize(str: string): string {
    return str.replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Convert string to title case
   */
  static toTitleCase(str: string): string {
    return str.toLowerCase().replace(/\b\w/g, l => l.toUpperCase());
  }

  /**
   * Truncate string to specified length
   */
  static truncate(str: string, length: number, suffix: string = '...'): string {
    if (str.length <= length) return str;
    return str.substring(0, length - suffix.length) + suffix;
  }

  /**
   * Remove extra spaces and trim
   */
  static normalizeSpaces(str: string): string {
    return str.replace(/\s+/g, ' ').trim();
  }

  /**
   * Convert to kebab-case
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Convert to camelCase
   */
  static toCamelCase(str: string): string {
    return str
      .replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
        return index === 0 ? word.toLowerCase() : word.toUpperCase();
      })
      .replace(/\s+/g, '');
  }

  /**
   * Convert to snake_case
   */
  static toSnakeCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1_$2')
      .replace(/\s+/g, '_')
      .toLowerCase();
  }

  /**
   * Remove Turkish accents and convert to ASCII
   */
  static removeAccents(str: string): string {
    const turkishChars: Record<string, string> = {
      'ç': 'c', 'Ç': 'C',
      'ğ': 'g', 'Ğ': 'G',
      'ı': 'i', 'I': 'I',
      'İ': 'I', 'i': 'i',
      'ö': 'o', 'Ö': 'O',
      'ş': 's', 'Ş': 'S',
      'ü': 'u', 'Ü': 'U'
    };

    return str.replace(/[çÇğĞıIİiöÖşŞüÜ]/g, char => turkishChars[char] || char);
  }

  /**
   * Generate slug from string
   */
  static generateSlug(str: string): string {
    return this.removeAccents(str)
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  /**
   * Check if string is empty or only whitespace
   */
  static isEmpty(str: string): boolean {
    return !str || str.trim().length === 0;
  }

  /**
   * Check if string contains only digits
   */
  static isNumeric(str: string): boolean {
    return /^\d+$/.test(str);
  }

  /**
   * Format phone number for display
   */
  static formatPhoneDisplay(phone: string): string {
    const cleaned = phone.replace(/\D/g, '');
    
    if (cleaned.startsWith('90')) {
      // +90 5xx xxx xx xx
      const match = cleaned.match(/^90(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `+90 ${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
      }
    } else if (cleaned.startsWith('0')) {
      // 0xxx xxx xx xx
      const match = cleaned.match(/^0(\d{3})(\d{3})(\d{2})(\d{2})$/);
      if (match) {
        return `0${match[1]} ${match[2]} ${match[3]} ${match[4]}`;
      }
    }
    
    return phone;
  }

  /**
   * Mask sensitive information (e.g., phone, email)
   */
  static maskSensitive(str: string, visibleStart: number = 2, visibleEnd: number = 2): string {
    if (str.length <= visibleStart + visibleEnd) return str;
    
    const start = str.substring(0, visibleStart);
    const end = str.substring(str.length - visibleEnd);
    const middle = '*'.repeat(str.length - visibleStart - visibleEnd);
    
    return start + middle + end;
  }

  /**
   * Extract initials from full name
   */
  static getInitials(fullName: string): string {
    return fullName
      .split(' ')
      .map(name => name.charAt(0).toUpperCase())
      .join('')
      .substring(0, 2);
  }

  /**
   * Format full name
   */
  static formatFullName(firstName: string, lastName: string): string {
    return this.normalizeSpaces(`${firstName} ${lastName}`);
  }

  /**
   * Generate random string
   */
  static generateRandomString(length: number, charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  /**
   * Count words in string
   */
  static wordCount(str: string): number {
    return str.trim().split(/\s+/).filter(word => word.length > 0).length;
  }

  /**
   * Highlight search terms in text
   */
  static highlightSearch(text: string, searchTerm: string, highlightClass: string = 'highlight'): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${highlightClass}">$1</span>`);
  }

  /**
   * Parse query string parameters
   */
  static parseQueryString(queryString: string): Record<string, string> {
    const params: Record<string, string> = {};
    const urlParams = new URLSearchParams(queryString);
    
    for (const [key, value] of urlParams) {
      params[key] = value;
    }
    
    return params;
  }

  /**
   * Build query string from object
   */
  static buildQueryString(params: Record<string, any>): string {
    const urlParams = new URLSearchParams();
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        urlParams.append(key, String(value));
      }
    }
    
    return urlParams.toString();
  }

  /**
   * Escape special regex characters
   */
  static escapeRegex(str: string): string {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  /**
   * Check if string matches pattern
   */
  static matchesPattern(str: string, pattern: string): boolean {
    const escapedPattern = pattern.replace(/\*/g, '.*').replace(/\?/g, '.');
    const regex = new RegExp(`^${escapedPattern}$`, 'i');
    return regex.test(str);
  }

  /**
   * Convert bytes to human readable format
   */
  static formatBytes(bytes: number, decimals: number = 2): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  /**
   * Convert string to boolean
   */
  static toBoolean(str: string): boolean {
    return ['true', '1', 'yes', 'on'].includes(str.toLowerCase());
  }
}