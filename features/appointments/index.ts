// Components
export { AppointmentCard } from './components/AppointmentCard';
export { AppointmentList } from './components/AppointmentList';
export { AppointmentStatusBadge } from './components/AppointmentStatusBadge';

// Hooks
export { useAppointments } from './hooks/useAppointments';
export { useAppointmentActions } from './hooks/useAppointmentActions';
export { useAppointmentFilters } from './hooks/useAppointmentFilters';
export { useMyAppointments, useCancelAppointment, useAppointmentUtils } from './hooks/useAppointmentsQuery';

// Context & Providers
export { AppointmentsProvider, useAppointmentsContext } from './contexts/AppointmentsContext';

// Stores
export { useAppointmentsStore } from './stores/appointmentsStore';

// Services
export { AppointmentService } from './services/appointmentService';
export { AppointmentValidation } from './services/appointmentValidation';

// Types
export type {
  Appointment,
  AppointmentStatus,
  AppointmentFilters,
  AppointmentFormData,
  AppointmentCardProps,
  AppointmentListProps,
  AppointmentModalProps,
} from './types/appointment.types';