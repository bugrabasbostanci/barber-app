// Barber Appointments Service Layer

import { BarberAppointment, AppointmentStats } from '../types';

const API_BASE = '/api/barber';

export class BarberAppointmentService {
  static async fetchAppointments(): Promise<BarberAppointment[]> {
    const response = await fetch(`${API_BASE}/appointments`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointments');
    }
    const result = await response.json();
    return result.success ? result.data : [];
  }

  static async fetchAppointmentStats(): Promise<AppointmentStats | null> {
    const response = await fetch(`${API_BASE}/appointments/stats`);
    if (!response.ok) {
      throw new Error('Failed to fetch appointment stats');
    }
    const result = await response.json();
    return result.success ? result.data : null;
  }

  static async updateAppointmentStatus(
    appointmentId: string, 
    status: string,
    reason?: string
  ): Promise<boolean> {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, reason }),
    });

    if (!response.ok) {
      throw new Error(`Failed to update appointment status to ${status}`);
    }

    const result = await response.json();
    return result.success;
  }

  static async updateAppointmentNotes(
    appointmentId: string, 
    notes: string
  ): Promise<boolean> {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });

    if (!response.ok) {
      throw new Error('Failed to update appointment notes');
    }

    const result = await response.json();
    return result.success;
  }

  static async deleteAppointment(appointmentId: string): Promise<boolean> {
    const response = await fetch(`/api/appointments/${appointmentId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error('Failed to delete appointment');
    }

    const result = await response.json();
    return result.success;
  }

  // Convenience methods for specific status updates
  static confirmAppointment(appointmentId: string): Promise<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'confirmed');
  }

  static cancelAppointment(appointmentId: string, reason?: string): Promise<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'cancelled', reason);
  }

  static completeAppointment(appointmentId: string): Promise<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'completed');
  }

  static markNoShow(appointmentId: string): Promise<boolean> {
    return this.updateAppointmentStatus(appointmentId, 'no_show');
  }
}