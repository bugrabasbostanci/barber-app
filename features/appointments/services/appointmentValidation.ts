import { AppointmentFormData } from '../types/appointment.types';

export interface ValidationError {
  field: string;
  message: string;
}

export class AppointmentValidation {
  static validateAppointmentForm(data: AppointmentFormData): ValidationError[] {
    const errors: ValidationError[] = [];

    // Date validation
    if (!data.date) {
      errors.push({ field: 'date', message: 'Tarih gereklidir' });
    } else {
      const appointmentDate = new Date(data.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (appointmentDate < today) {
        errors.push({ field: 'date', message: 'Geçmiş tarih seçilemez' });
      }

      // Check if it's Sunday
      if (appointmentDate.getDay() === 0) {
        errors.push({ field: 'date', message: 'Pazar günü randevu alınamaz' });
      }

      // Check if it's more than 7 days in advance
      const maxDate = new Date();
      maxDate.setDate(maxDate.getDate() + 7);
      if (appointmentDate > maxDate) {
        errors.push({ field: 'date', message: 'En fazla 7 gün sonrası için randevu alınabilir' });
      }
    }

    // Time validation
    if (!data.startTime) {
      errors.push({ field: 'startTime', message: 'Saat seçilmelidir' });
    } else {
      const [hours, minutes] = data.startTime.split(':').map(Number);
      const timeInMinutes = hours * 60 + minutes;
      
      // Working hours: 09:30 - 21:30
      const startWorkingTime = 9 * 60 + 30; // 09:30
      const endWorkingTime = 21 * 60 + 30; // 21:30
      
      if (timeInMinutes < startWorkingTime || timeInMinutes > endWorkingTime) {
        errors.push({ field: 'startTime', message: 'Çalışma saatleri: 09:30 - 21:30' });
      }
    }

    // Staff validation
    if (!data.staffId) {
      errors.push({ field: 'staffId', message: 'Berber seçilmelidir' });
    }

    // Customer validation
    if (!data.customerId && !data.manualCustomerName) {
      errors.push({ field: 'customer', message: 'Müşteri bilgisi gereklidir' });
    }

    // Phone validation for manual customers
    if (data.manualCustomerPhone && !this.validatePhone(data.manualCustomerPhone)) {
      errors.push({ field: 'manualCustomerPhone', message: 'Geçerli telefon numarası giriniz' });
    }

    return errors;
  }

  static validatePhone(phone: string): boolean {
    // Turkish phone number validation
    const phoneRegex = /^(\+90|0)?[5-9]\d{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  }

  static validateCancellation(appointment: any): ValidationError[] {
    const errors: ValidationError[] = [];
    
    if (appointment.status === 'cancelled') {
      errors.push({ field: 'status', message: 'Randevu zaten iptal edilmiş' });
    }

    if (appointment.status === 'completed') {
      errors.push({ field: 'status', message: 'Tamamlanmış randevu iptal edilemez' });
    }

    // Check if it's less than 2 hours before appointment
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}`);
    const now = new Date();
    const timeDifference = appointmentDateTime.getTime() - now.getTime();
    const hoursUntilAppointment = timeDifference / (1000 * 3600);

    if (hoursUntilAppointment < 2) {
      errors.push({ field: 'time', message: 'Randevudan 2 saat önce iptal edilebilir' });
    }

    return errors;
  }

  static isWithinWorkingHours(time: string): boolean {
    const [hours, minutes] = time.split(':').map(Number);
    const timeInMinutes = hours * 60 + minutes;
    
    const startWorkingTime = 9 * 60 + 30; // 09:30
    const endWorkingTime = 21 * 60 + 30; // 21:30
    
    return timeInMinutes >= startWorkingTime && timeInMinutes <= endWorkingTime;
  }

  static isValidDate(date: string): boolean {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Not in the past
    if (appointmentDate < today) return false;

    // Not Sunday
    if (appointmentDate.getDay() === 0) return false;

    // Not more than 7 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (appointmentDate > maxDate) return false;

    return true;
  }
}