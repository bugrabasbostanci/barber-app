"use client";

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import { useAuth } from '@/features/auth';
import { BookingData, CustomerInfo, Staff, TimeSlot } from '../types/booking.types';

interface BookingState {
  // Step management
  currentStep: number;
  totalSteps: number;
  
  // Data
  bookingData: Partial<BookingData>;
  customerInfo: CustomerInfo;
  
  // Available options
  staffList: Staff[];
  availableTimeSlots: TimeSlot[];
  
  // Loading states
  isLoadingStaff: boolean;
  isLoadingTimeSlots: boolean;
  isBooking: boolean;
  
  // Error states
  phoneError: string;
  bookingError: string;
  
  // UI states
  selectedDate: Date | null;
}

type BookingAction = 
  | { type: 'SET_CURRENT_STEP'; payload: number }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'UPDATE_BOOKING_DATA'; payload: Partial<BookingData> }
  | { type: 'UPDATE_CUSTOMER_INFO'; payload: Partial<CustomerInfo> }
  | { type: 'SET_STAFF_LIST'; payload: Staff[] }
  | { type: 'SET_TIME_SLOTS'; payload: TimeSlot[] }
  | { type: 'SET_LOADING_STAFF'; payload: boolean }
  | { type: 'SET_LOADING_TIME_SLOTS'; payload: boolean }
  | { type: 'SET_IS_BOOKING'; payload: boolean }
  | { type: 'SET_PHONE_ERROR'; payload: string }
  | { type: 'SET_BOOKING_ERROR'; payload: string }
  | { type: 'SET_SELECTED_DATE'; payload: Date | null }
  | { type: 'RESET_BOOKING' };

const initialState: BookingState = {
  currentStep: 1,
  totalSteps: 4,
  bookingData: {
    date: '',
    staffId: '',
    timeSlot: '',
  },
  customerInfo: {
    firstName: '',
    lastName: '',
    phone: '',
  },
  staffList: [],
  availableTimeSlots: [],
  isLoadingStaff: false,
  isLoadingTimeSlots: false,
  isBooking: false,
  phoneError: '',
  bookingError: '',
  selectedDate: null,
};

function bookingReducer(state: BookingState, action: BookingAction): BookingState {
  switch (action.type) {
    case 'SET_CURRENT_STEP':
      return { ...state, currentStep: action.payload };
    
    case 'NEXT_STEP':
      return { 
        ...state, 
        currentStep: Math.min(state.currentStep + 1, state.totalSteps) 
      };
    
    case 'PREV_STEP':
      return { 
        ...state, 
        currentStep: Math.max(state.currentStep - 1, 1) 
      };
    
    case 'UPDATE_BOOKING_DATA':
      return {
        ...state,
        bookingData: { ...state.bookingData, ...action.payload }
      };
    
    case 'UPDATE_CUSTOMER_INFO':
      return {
        ...state,
        customerInfo: { ...state.customerInfo, ...action.payload }
      };
    
    case 'SET_STAFF_LIST':
      return { ...state, staffList: action.payload };
    
    case 'SET_TIME_SLOTS':
      return { ...state, availableTimeSlots: action.payload };
    
    case 'SET_LOADING_STAFF':
      return { ...state, isLoadingStaff: action.payload };
    
    case 'SET_LOADING_TIME_SLOTS':
      return { ...state, isLoadingTimeSlots: action.payload };
    
    case 'SET_IS_BOOKING':
      return { ...state, isBooking: action.payload };
    
    case 'SET_PHONE_ERROR':
      return { ...state, phoneError: action.payload };
    
    case 'SET_BOOKING_ERROR':
      return { ...state, bookingError: action.payload };
    
    case 'SET_SELECTED_DATE':
      return { ...state, selectedDate: action.payload };
    
    case 'RESET_BOOKING':
      return { ...initialState };
    
    default:
      return state;
  }
}

interface BookingContextType {
  // State
  state: BookingState;
  
  // Actions
  setCurrentStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateBookingData: (data: Partial<BookingData>) => void;
  updateCustomerInfo: (info: Partial<CustomerInfo>) => void;
  setSelectedDate: (date: Date | null) => void;
  resetBooking: () => void;
  
  // Async actions
  loadStaffList: () => Promise<void>;
  loadTimeSlots: (date: string, staffId: string) => Promise<void>;
  submitBooking: () => Promise<boolean>;
  
  // Utilities
  canProceedToNextStep: () => boolean;
  getStepTitle: (step: number) => string;
  getSelectedStaff: () => Staff | null;
  isStepComplete: (step: number) => boolean;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

// Helper functions
const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(\+90|0)?[0-9]{10}$/;
  return phoneRegex.test(phone.replace(/\s/g, ""));
};

const formatPhoneInput = (value: string): string => {
  const cleaned = value.replace(/[^\d+]/g, "");
  
  if (cleaned.startsWith("+90")) {
    const digits = cleaned.slice(3);
    if (digits.length <= 10) {
      return "+90 " + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
    }
    return "+90 " + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  if (cleaned.startsWith("0")) {
    const digits = cleaned.slice(1);
    if (digits.length <= 10) {
      return "0" + digits.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
    }
    return "0" + digits.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  if (cleaned.length <= 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
  }
  
  return cleaned.slice(0, 10).replace(/(\d{3})(\d{3})(\d{2})(\d{2})/, "$1 $2 $3 $4").trim();
};

export function BookingProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bookingReducer, initialState);
  const { user } = useAuth();

  // Initialize customer info from user profile
  useEffect(() => {
    if (user?.phone && !state.customerInfo.phone) {
      dispatch({
        type: 'UPDATE_CUSTOMER_INFO',
        payload: { phone: user.phone }
      });
    }
  }, [user?.phone, state.customerInfo.phone]);

  // Actions
  const setCurrentStep = useCallback((step: number) => {
    dispatch({ type: 'SET_CURRENT_STEP', payload: step });
  }, []);

  const nextStep = useCallback(() => {
    dispatch({ type: 'NEXT_STEP' });
  }, []);

  const prevStep = useCallback(() => {
    dispatch({ type: 'PREV_STEP' });
  }, []);

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    dispatch({ type: 'UPDATE_BOOKING_DATA', payload: data });
  }, []);

  const updateCustomerInfo = useCallback((info: Partial<CustomerInfo>) => {
    // Auto-format phone number
    if (info.phone !== undefined) {
      info.phone = formatPhoneInput(info.phone);
      
      // Clear phone error if phone becomes valid
      if (validatePhone(info.phone)) {
        dispatch({ type: 'SET_PHONE_ERROR', payload: '' });
      }
    }
    
    dispatch({ type: 'UPDATE_CUSTOMER_INFO', payload: info });
  }, []);

  const setSelectedDate = useCallback((date: Date | null) => {
    dispatch({ type: 'SET_SELECTED_DATE', payload: date });
  }, []);

  const resetBooking = useCallback(() => {
    dispatch({ type: 'RESET_BOOKING' });
  }, []);

  // Async actions
  const loadStaffList = useCallback(async () => {
    dispatch({ type: 'SET_LOADING_STAFF', payload: true });
    
    try {
      const response = await fetch('/api/staff');
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          dispatch({ type: 'SET_STAFF_LIST', payload: result.data });
        }
      }
    } catch (error) {
      console.error('Failed to load staff list:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_STAFF', payload: false });
    }
  }, []);

  const loadTimeSlots = useCallback(async (date: string, staffId: string) => {
    dispatch({ type: 'SET_LOADING_TIME_SLOTS', payload: true });
    
    try {
      const response = await fetch(`/api/time-slots?date=${date}&staffId=${staffId}`);
      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          const timeSlots = result.data.map((slot: string) => ({
            id: slot,
            time: slot,
            available: true
          }));
          dispatch({ type: 'SET_TIME_SLOTS', payload: timeSlots });
        }
      }
    } catch (error) {
      console.error('Failed to load time slots:', error);
    } finally {
      dispatch({ type: 'SET_LOADING_TIME_SLOTS', payload: false });
    }
  }, []);

  const submitBooking = useCallback(async (): Promise<boolean> => {
    dispatch({ type: 'SET_IS_BOOKING', payload: true });
    dispatch({ type: 'SET_BOOKING_ERROR', payload: '' });

    // Validate phone
    if (!validatePhone(state.customerInfo.phone)) {
      dispatch({ type: 'SET_PHONE_ERROR', payload: 'Geçerli bir telefon numarası girin' });
      dispatch({ type: 'SET_IS_BOOKING', payload: false });
      return false;
    }

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          date: state.bookingData.date,
          staffId: state.bookingData.staffId,
          timeSlot: state.bookingData.timeSlot,
          phone: state.customerInfo.phone,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success) {
          return true;
        } else {
          dispatch({ type: 'SET_BOOKING_ERROR', payload: result.error || 'Randevu oluşturulamadı' });
        }
      } else {
        dispatch({ type: 'SET_BOOKING_ERROR', payload: 'Bir hata oluştu. Lütfen tekrar deneyin.' });
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      dispatch({ type: 'SET_BOOKING_ERROR', payload: 'Bağlantı hatası. Lütfen tekrar deneyin.' });
    } finally {
      dispatch({ type: 'SET_IS_BOOKING', payload: false });
    }

    return false;
  }, [state.bookingData, state.customerInfo]);

  // Utilities
  const canProceedToNextStep = useCallback((): boolean => {
    switch (state.currentStep) {
      case 1: // Staff selection
        return !!state.bookingData.staffId;
      case 2: // Date selection
        return !!state.bookingData.date;
      case 3: // Time selection
        return !!state.bookingData.timeSlot;
      case 4: // Customer info
        return !!state.customerInfo.phone && validatePhone(state.customerInfo.phone);
      default:
        return false;
    }
  }, [state.currentStep, state.bookingData, state.customerInfo]);

  const getStepTitle = useCallback((step: number): string => {
    const titles = {
      1: 'Berber Seçin',
      2: 'Tarih Seçin',
      3: 'Saat Seçin',
      4: 'Bilgilerinizi Girin',
    };
    return titles[step as keyof typeof titles] || '';
  }, []);

  const getSelectedStaff = useCallback((): Staff | null => {
    return state.staffList.find(staff => staff.id === state.bookingData.staffId) || null;
  }, [state.staffList, state.bookingData.staffId]);

  const isStepComplete = useCallback((step: number): boolean => {
    switch (step) {
      case 1:
        return !!state.bookingData.staffId;
      case 2:
        return !!state.bookingData.date;
      case 3:
        return !!state.bookingData.timeSlot;
      case 4:
        return !!state.customerInfo.phone && validatePhone(state.customerInfo.phone);
      default:
        return false;
    }
  }, [state.bookingData, state.customerInfo]);

  const contextValue: BookingContextType = {
    state,
    setCurrentStep,
    nextStep,
    prevStep,
    updateBookingData,
    updateCustomerInfo,
    setSelectedDate,
    resetBooking,
    loadStaffList,
    loadTimeSlots,
    submitBooking,
    canProceedToNextStep,
    getStepTitle,
    getSelectedStaff,
    isStepComplete,
  };

  return (
    <BookingContext.Provider value={contextValue}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBookingContext() {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBookingContext must be used within a BookingProvider');
  }
  return context;
}

// Export helper functions for external use
export { validatePhone, formatPhoneInput };