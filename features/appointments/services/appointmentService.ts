import { Appointment, AppointmentFilters, AppointmentFormData } from '../types/appointment.types';

const API_BASE = '/api/appointments';

export class AppointmentService {
  static async getAppointments(filters?: AppointmentFilters): Promise<Appointment[]> {
    const searchParams = new URLSearchParams();
    
    if (filters?.status) searchParams.append('status', filters.status);
    if (filters?.date) searchParams.append('date', filters.date);
    if (filters?.staffId) searchParams.append('staffId', filters.staffId);
    if (filters?.search) searchParams.append('search', filters.search);

    const response = await fetch(`${API_BASE}?${searchParams.toString()}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    
    return response.json();
  }

  static async getAppointmentById(id: string): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/${id}`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointment');
    }
    
    return response.json();
  }

  static async createAppointment(data: AppointmentFormData): Promise<Appointment> {
    const response = await fetch(API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to create appointment');
    }

    return response.json();
  }

  static async updateAppointment(id: string, data: Partial<AppointmentFormData>): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment');
    }

    return response.json();
  }

  static async cancelAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}/cancel`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error('Failed to cancel appointment');
    }
  }

  static async deleteAppointment(id: string): Promise<void> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete appointment');
    }
  }

  static async updateAppointmentStatus(id: string, status: Appointment['status']): Promise<Appointment> {
    const response = await fetch(`${API_BASE}/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment status');
    }

    return response.json();
  }
}