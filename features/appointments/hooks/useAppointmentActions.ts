import { useState } from 'react';
import { AppointmentService } from '../services/appointmentService';
import { AppointmentValidation } from '../services/appointmentValidation';
import { Appointment, AppointmentFormData } from '../types/appointment.types';

export function useAppointmentActions() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createAppointment = async (data: AppointmentFormData): Promise<Appointment | null> => {
    try {
      setLoading(true);
      setError(null);

      // Validate form data
      const validationErrors = AppointmentValidation.validateAppointmentForm(data);
      if (validationErrors.length > 0) {
        setError(validationErrors[0].message);
        return null;
      }

      const appointment = await AppointmentService.createAppointment(data);
      return appointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create appointment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointment = async (id: string, data: Partial<AppointmentFormData>): Promise<Appointment | null> => {
    try {
      setLoading(true);
      setError(null);

      const appointment = await AppointmentService.updateAppointment(id, data);
      return appointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (appointment: Appointment): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      // Validate cancellation
      const validationErrors = AppointmentValidation.validateCancellation(appointment);
      if (validationErrors.length > 0) {
        setError(validationErrors[0].message);
        return false;
      }

      await AppointmentService.cancelAppointment(appointment.id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to cancel appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateAppointmentStatus = async (id: string, status: Appointment['status']): Promise<Appointment | null> => {
    try {
      setLoading(true);
      setError(null);

      const appointment = await AppointmentService.updateAppointmentStatus(id, status);
      return appointment;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update appointment status');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteAppointment = async (id: string): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);

      await AppointmentService.deleteAppointment(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete appointment');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    loading,
    error,
    createAppointment,
    updateAppointment,
    cancelAppointment,
    updateAppointmentStatus,
    deleteAppointment,
    clearError,
  };
}