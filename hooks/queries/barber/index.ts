"use client";

// Central export file for all barber React Query hooks
export * from './useBarberAppointments';
export * from './useBarberAvailability';
export * from './useBarberSettings';
export * from './useBarberStatistics';

// Re-export query keys for easy access
export {
  barberAppointmentKeys,
  type BarberAppointment,
  type CreateManualAppointmentData,
} from './useBarberAppointments';

export {
  availabilityKeys,
  type TimeBlock,
  type BlockedDate,
  type CreateTimeBlockData,
  type UpdateTimeBlockData,
} from './useBarberAvailability';

export {
  settingsKeys,
  type StaffMember,
  type BarberProfile,
  type UpdateProfileData,
  type UpdateBusinessSettingsData,
} from './useBarberSettings';

export {
  statisticsKeys,
  type DashboardStats,
  type PeriodStats,
  type CustomerStats,
} from './useBarberStatistics';