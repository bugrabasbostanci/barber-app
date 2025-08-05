// Components
export { BookingWizard } from './components/BookingWizard';
export { StepIndicator } from './components/StepIndicator';

// Step Components
export { StaffSelection } from './components/steps/StaffSelection';
export { DateSelection } from './components/steps/DateSelection';
export { TimeSelection } from './components/steps/TimeSelection';
export { CustomerInfo as CustomerInfoStep } from './components/steps/CustomerInfo';
export { BookingConfirmation } from './components/steps/BookingConfirmation';

// Hooks
export { useBookingFlow } from './hooks/useBookingFlow';

// Context & Providers
export { BookingProvider, useBookingContext, validatePhone, formatPhoneInput } from './contexts/BookingContext';

// Stores
export { useBookingStore } from './stores/bookingStore';

// Services
export { BookingService } from './services/bookingService';

// Types
export type {
  Staff,
  Customer,
  TimeSlot,
  BookingData,
  CustomerInfo,
  BookingStep,
  BookingWizardProps,
  StaffSelectionProps,
  DateSelectionProps,
  TimeSelectionProps,
  CustomerInfoProps,
  BookingConfirmationProps,
  BookingSummaryProps,
  StepIndicatorProps,
  StepNavigationProps,
  BookingFlowState,
  AvailableSlot,
} from './types/booking.types';