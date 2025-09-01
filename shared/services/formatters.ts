/**
 * Data formatting service for consistent data presentation
 */

import { 
  formatTurkishDate, 
  formatTurkishDateShort, 
  utcToLocalTime,
  getRelativeTimeString 
} from '../utils/dateUtils';
import { 
  formatPhoneNumber, 
  formatName, 
  formatCurrency,
  capitalizeWords 
} from '../utils/stringUtils';

export interface AppointmentData {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  customerName?: string;
  customerPhone?: string;
  staffName?: string;
  status: string;
  notes?: string;
  createdAt?: string;
}

export interface CustomerData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  createdAt?: string;
  lastAppointment?: string;
}

export interface StaffData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
}

// Appointment formatters
export class AppointmentFormatter {
  static formatDate(appointment: AppointmentData): string {
    return formatTurkishDate(appointment.date);
  }

  static formatDateShort(appointment: AppointmentData): string {
    return formatTurkishDateShort(appointment.date);
  }

  static formatTime(appointment: AppointmentData): string {
    return `${appointment.startTime} - ${appointment.endTime}`;
  }

  static formatDateTime(appointment: AppointmentData): string {
    const date = this.formatDateShort(appointment);
    const time = this.formatTime(appointment);
    return `${date} ${time}`;
  }

  static formatCustomer(appointment: AppointmentData): string {
    if (!appointment.customerName) return 'No customer information';
    return formatName(appointment.customerName);
  }

  static formatCustomerWithPhone(appointment: AppointmentData): string {
    const name = this.formatCustomer(appointment);
    if (!appointment.customerPhone) return name;
    const phone = formatPhoneNumber(appointment.customerPhone);
    return `${name} - ${phone}`;
  }

  static formatStaff(appointment: AppointmentData): string {
    if (!appointment.staffName) return 'No barber assigned';
    return formatName(appointment.staffName);
  }

  static formatStatus(appointment: AppointmentData): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pending',
      'CONFIRMED': 'Confirmed',
      'CANCELLED': 'Cancelled',
      'COMPLETED': 'Completed',
      'NO_SHOW': 'No Show'
    };
    return statusMap[appointment.status] || appointment.status;
  }

  static formatStatusColor(appointment: AppointmentData): string {
    const colorMap: Record<string, string> = {
      'PENDING': 'yellow',
      'CONFIRMED': 'blue',
      'CANCELLED': 'red',
      'COMPLETED': 'green',
      'NO_SHOW': 'gray'
    };
    return colorMap[appointment.status] || 'gray';
  }

  static formatNotes(appointment: AppointmentData): string {
    if (!appointment.notes) return '';
    return appointment.notes.length > 50 
      ? appointment.notes.substring(0, 50) + '...'
      : appointment.notes;
  }

  static formatCreatedAt(appointment: AppointmentData): string {
    if (!appointment.createdAt) return '';
    return getRelativeTimeString(new Date(appointment.createdAt));
  }

  static formatDuration(): string {
    return '45 dakika'; // Fixed duration from business rules
  }

  static formatSummary(appointment: AppointmentData): string {
    const date = this.formatDateShort(appointment);
    const time = appointment.startTime;
    const customer = this.formatCustomer(appointment);
    return `${customer} - ${date} ${time}`;
  }
}

// Customer formatters
export class CustomerFormatter {
  static formatFullName(customer: CustomerData): string {
    return formatName(customer.firstName, customer.lastName);
  }

  static formatInitials(customer: CustomerData): string {
    const name = this.formatFullName(customer);
    return name.split(' ').map(word => word.charAt(0).toUpperCase()).join('');
  }

  static formatPhone(customer: CustomerData): string {
    return formatPhoneNumber(customer.phone);
  }

  static formatEmail(customer: CustomerData): string {
    return customer.email.toLowerCase();
  }

  static formatCreatedAt(customer: CustomerData): string {
    if (!customer.createdAt) return '';
    return getRelativeTimeString(new Date(customer.createdAt));
  }

  static formatLastAppointment(customer: CustomerData): string {
    if (!customer.lastAppointment) return 'No appointments yet';
    return getRelativeTimeString(new Date(customer.lastAppointment));
  }

  static formatContactInfo(customer: CustomerData): string {
    const phone = this.formatPhone(customer);
    const email = this.formatEmail(customer);
    return `${phone} • ${email}`;
  }

  static formatSummary(customer: CustomerData): string {
    const name = this.formatFullName(customer);
    const phone = this.formatPhone(customer);
    return `${name} - ${phone}`;
  }
}

// Staff formatters
export class StaffFormatter {
  static formatFullName(staff: StaffData): string {
    return formatName(staff.firstName, staff.lastName);
  }

  static formatRole(staff: StaffData): string {
    const roleMap: Record<string, string> = {
      'BARBER': 'Barber',
      'ADMIN': 'Administrator',
      'STAFF': 'Staff'
    };
    return roleMap[staff.role] || staff.role;
  }

  static formatStatus(staff: StaffData): string {
    return staff.isActive ? 'Aktif' : 'Pasif';
  }

  static formatStatusColor(staff: StaffData): string {
    return staff.isActive ? 'green' : 'red';
  }

  static formatPhone(staff: StaffData): string {
    if (!staff.phone) return 'Telefon yok';
    return formatPhoneNumber(staff.phone);
  }

  static formatContactInfo(staff: StaffData): string {
    const phone = this.formatPhone(staff);
    return `${staff.email} • ${phone}`;
  }

  static formatSummary(staff: StaffData): string {
    const name = this.formatFullName(staff);
    const role = this.formatRole(staff);
    const status = this.formatStatus(staff);
    return `${name} (${role}) - ${status}`;
  }
}

// Generic formatters
export class GenericFormatter {
  static formatBoolean(value: boolean, trueLabel: string = 'Evet', falseLabel: string = 'Hayır'): string {
    return value ? trueLabel : falseLabel;
  }

  static formatArray(items: string[], separator: string = ', ', lastSeparator: string = ' and '): string {
    if (items.length === 0) return '';
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(lastSeparator);
    
    const allButLast = items.slice(0, -1).join(separator);
    const last = items[items.length - 1];
    return `${allButLast}${lastSeparator}${last}`;
  }

  static formatNumber(value: number, decimals: number = 0): string {
    return new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  static formatPercentage(value: number, decimals: number = 1): string {
    return new Intl.NumberFormat('tr-TR', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  }

  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`;
  }

  static formatDuration(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} minutes`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hours`;
    }
    
    return `${hours} hours ${remainingMinutes} minutes`;
  }

  static truncateText(text: string, maxLength: number, suffix: string = '...'): string {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + suffix;
  }

  static highlightText(text: string, searchTerm: string, className: string = 'highlight'): string {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, `<span class="${className}">$1</span>`);
  }
}

// Export all formatters
export const formatters = {
  appointment: AppointmentFormatter,
  customer: CustomerFormatter,
  staff: StaffFormatter,
  generic: GenericFormatter
};

export default formatters;