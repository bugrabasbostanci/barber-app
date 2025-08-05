import { BookingData, Staff, TimeSlot, AvailableSlot } from '../types/booking.types';

const API_BASE = '/api';

export class BookingService {
  static async getStaff(): Promise<Staff[]> {
    const response = await fetch(`${API_BASE}/staff`);
    if (!response.ok) {
      throw new Error('Failed to fetch staff');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch staff');
    }
    
    return result.data || [];
  }

  static async getAvailableTimeSlots(date: string, staffId?: string): Promise<TimeSlot[]> {
    const searchParams = new URLSearchParams({ date });
    if (staffId) {
      searchParams.append('staffId', staffId);
    }

    const response = await fetch(`${API_BASE}/time-slots?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch time slots');
    }
    
    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch time slots');
    }
    
    return result.data || [];
  }

  static async createAppointment(bookingData: BookingData): Promise<any> {
    const appointmentData = {
      date: bookingData.date,
      startTime: bookingData.timeSlot,
      staffId: bookingData.staffId,
      notes: bookingData.notes,
      // Customer info
      ...(bookingData.customerId 
        ? { customerId: bookingData.customerId }
        : {
            manualCustomerName: bookingData.customerName,
            manualCustomerPhone: bookingData.customerPhone,
          }
      ),
    };

    const response = await fetch(`${API_BASE}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(appointmentData),
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create appointment');
    }

    return result.data;
  }

  static generateTimeSlots(): string[] {
    const slots: string[] = [];
    // Working hours: 09:30 - 21:30, 45-minute slots
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

  static calculateEndTime(startTime: string): string {
    const [hours, minutes] = startTime.split(':').map(Number);
    const totalMinutes = hours * 60 + minutes + 45; // 45-minute appointment
    
    const endHours = Math.floor(totalMinutes / 60);
    const endMinutes = totalMinutes % 60;
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`;
  }

  static formatPhoneNumber(phone: string): string {
    // Remove all non-digit characters
    const digits = phone.replace(/\D/g, '');
    
    // Handle Turkish phone numbers
    if (digits.startsWith('90')) {
      // +90 format
      return `+${digits}`;
    } else if (digits.startsWith('0')) {
      // 0xxx format, convert to +90
      return `+90${digits.slice(1)}`;
    } else if (digits.length === 10) {
      // xxx format (without leading 0), add +90
      return `+90${digits}`;
    }
    
    return phone; // Return as-is if format is unclear
  }

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

  static isValidDate(date: string): boolean {
    const appointmentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Not in the past
    if (appointmentDate < today) return false;

    // Not Sunday (day 0)
    if (appointmentDate.getDay() === 0) return false;

    // Not more than 7 days in advance
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);
    if (appointmentDate > maxDate) return false;

    return true;
  }

  static getBookingSteps(): Array<{ id: string; label: string; description: string }> {
    return [
      { id: 'staff', label: 'Berber Seçimi', description: 'Tercih ettiğiniz berberi seçin' },
      { id: 'date', label: 'Tarih Seçimi', description: 'Randevu tarihinizi belirleyin' },
      { id: 'time', label: 'Saat Seçimi', description: 'Uygun saati seçin' },
      { id: 'customer', label: 'Bilgiler', description: 'İletişim bilgilerinizi girin' },
      { id: 'confirmation', label: 'Onay', description: 'Randevunuzu onaylayın' },
    ];
  }

  static getNextStep(currentStep: string): string | null {
    const steps = ['staff', 'date', 'time', 'customer', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex === -1 || currentIndex === steps.length - 1) {
      return null;
    }
    
    return steps[currentIndex + 1];
  }

  static getPreviousStep(currentStep: string): string | null {
    const steps = ['staff', 'date', 'time', 'customer', 'confirmation'];
    const currentIndex = steps.indexOf(currentStep);
    
    if (currentIndex <= 0) {
      return null;
    }
    
    return steps[currentIndex - 1];
  }

  static async checkAvailability(date: string, time: string, staffId: string): Promise<boolean> {
    const searchParams = new URLSearchParams({
      date,
      time,
      staffId,
    });

    const response = await fetch(`${API_BASE}/time-slots/check?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to check availability');
    }
    
    const result = await response.json();
    return result.available || false;
  }
}