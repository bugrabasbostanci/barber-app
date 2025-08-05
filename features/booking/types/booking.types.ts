export interface Staff {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  phone?: string;
  email?: string;
}

export interface TimeSlot {
  time: string;
  available: boolean;
  staffId: string;
}

export interface BookingData {
  date?: string;
  staffId?: string;
  timeSlot?: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

export interface CustomerInfo {
  firstName?: string;
  lastName?: string;
  phone: string;
  notes?: string;
}

export type BookingStep = 'staff' | 'date' | 'time' | 'customer' | 'confirmation';

export interface BookingWizardProps {
  onComplete?: (bookingData: BookingData) => void;
  onCancel?: () => void;
}

export interface StaffSelectionProps {
  staff: Staff[];
  selectedStaffId?: string;
  onSelect: (staffId: string) => void;
  loading?: boolean;
}

export interface DateSelectionProps {
  selectedDate?: string;
  onSelect: (date: string) => void;
  minDate?: Date;
  maxDate?: Date;
  excludeDates?: string[];
}

export interface TimeSelectionProps {
  date: string;
  staffId: string;
  selectedTime?: string;
  onSelect: (time: string) => void;
  timeSlots: TimeSlot[];
  loading?: boolean;
}

export interface CustomerInfoProps {
  customerInfo: Partial<CustomerInfo>;
  onUpdate: (info: Partial<CustomerInfo>) => void;
  phoneError?: string;
  onPhoneChange?: (phone: string, error?: string) => void;
}

export interface BookingConfirmationProps {
  bookingData: BookingData;
  staff: Staff[];
  customerInfo: CustomerInfo;
  onConfirm: () => void;
  onBack: () => void;
  loading?: boolean;
}

export interface BookingSummaryProps {
  bookingData: BookingData;
  staff: Staff[];
  customerInfo: Partial<CustomerInfo>;
}

export interface StepIndicatorProps {
  currentStep: BookingStep;
  completedSteps: BookingStep[];
}

export interface StepNavigationProps {
  currentStep: BookingStep;
  canGoBack: boolean;
  canGoNext: boolean;
  isLastStep: boolean;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
}

export interface BookingFlowState {
  currentStep: BookingStep;
  bookingData: BookingData;
  customerInfo: Partial<CustomerInfo>;
  isBooking: boolean;
  phoneError?: string;
  error?: string;
}

export interface AvailableSlot {
  time: string;
  available: boolean;
  staff: Staff;
}