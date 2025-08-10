// Centralized exports for appointments hooks

// Data fetching hooks
export {
  useMyAppointments,
  useBarberAppointments,
  useDayAppointments,
  useWeekAppointments,
  useMonthAppointments,
  useAppointmentDetails,
} from './useAppointments';

// Action hooks
export {
  useCancelAppointment,
  useCreateManualAppointment,
  useUpdateAppointmentStatus,
  useBulkUpdateAppointmentStatus,
  useDeleteAppointment,
} from './useAppointmentActions';

// Filter hooks
export {
  useAppointmentFilters,
} from './useAppointmentFilters';

// Validation hooks
export {
  useAppointmentValidation,
  type ValidationError,
  type ValidationResult,
} from './useAppointmentValidation';