import { useState, useCallback } from 'react';
import { BookingStep, BookingData, CustomerInfo, BookingFlowState } from '../types/booking.types';
import { BookingService } from '../services/bookingService';

export function useBookingFlow() {
  const [state, setState] = useState<BookingFlowState>({
    currentStep: 'staff',
    bookingData: {},
    customerInfo: {},
    isBooking: false,
  });

  const updateBookingData = useCallback((data: Partial<BookingData>) => {
    setState(prev => ({
      ...prev,
      bookingData: { ...prev.bookingData, ...data },
    }));
  }, []);

  const updateCustomerInfo = useCallback((info: Partial<CustomerInfo>) => {
    setState(prev => ({
      ...prev,
      customerInfo: { ...prev.customerInfo, ...info },
    }));
  }, []);

  const setPhoneError = useCallback((error?: string) => {
    setState(prev => ({ ...prev, phoneError: error }));
  }, []);

  const setError = useCallback((error?: string) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  const nextStep = useCallback(() => {
    const next = BookingService.getNextStep(state.currentStep);
    if (next) {
      setState(prev => ({ ...prev, currentStep: next as BookingStep }));
    }
  }, [state.currentStep]);

  const prevStep = useCallback(() => {
    const prev = BookingService.getPreviousStep(state.currentStep);
    if (prev) {
      setState(prevState => ({ ...prevState, currentStep: prev as BookingStep }));
    }
  }, [state.currentStep]);

  const goToStep = useCallback((step: BookingStep) => {
    setState(prev => ({ ...prev, currentStep: step }));
  }, []);

  const canGoNext = useCallback(() => {
    switch (state.currentStep) {
      case 'staff':
        return !!state.bookingData.staffId;
      case 'date':
        return !!state.bookingData.date;
      case 'time':
        return !!state.bookingData.timeSlot;
      case 'customer':
        return !!(
          state.customerInfo.firstName &&
          state.customerInfo.lastName &&
          state.customerInfo.phone &&
          !state.phoneError
        );
      case 'confirmation':
        return false; // This is the last step
      default:
        return false;
    }
  }, [state.currentStep, state.bookingData, state.customerInfo, state.phoneError]);

  const canGoBack = useCallback(() => {
    return state.currentStep !== 'staff' && !state.isBooking;
  }, [state.currentStep, state.isBooking]);

  const isLastStep = useCallback(() => {
    return state.currentStep === 'confirmation';
  }, [state.currentStep]);

  const validateCurrentStep = useCallback(() => {
    setError(undefined);
    
    switch (state.currentStep) {
      case 'staff':
        if (!state.bookingData.staffId) {
          setError('Lütfen bir berber seçin');
          return false;
        }
        break;
      case 'date':
        if (!state.bookingData.date) {
          setError('Lütfen tarih seçin');
          return false;
        }
        if (!BookingService.isValidDate(state.bookingData.date)) {
          setError('Geçersiz tarih seçimi');
          return false;
        }
        break;
      case 'time':
        if (!state.bookingData.timeSlot) {
          setError('Lütfen saat seçin');
          return false;
        }
        break;
      case 'customer':
        if (!state.customerInfo.firstName) {
          setError('Ad alanı gereklidir');
          return false;
        }
        if (!state.customerInfo.lastName) {
          setError('Soyad alanı gereklidir');
          return false;
        }
        if (!state.customerInfo.phone) {
          setError('Telefon numarası gereklidir');
          return false;
        }
        if (!BookingService.validatePhoneNumber(state.customerInfo.phone)) {
          setError('Geçerli bir telefon numarası girin');
          return false;
        }
        break;
    }
    
    return true;
  }, [state.currentStep, state.bookingData, state.customerInfo]);

  const submitBooking = useCallback(async () => {
    if (!validateCurrentStep()) {
      return false;
    }

    setState(prev => ({ ...prev, isBooking: true, error: undefined }));

    try {
      const bookingData: BookingData = {
        ...state.bookingData,
        customerName: `${state.customerInfo.firstName} ${state.customerInfo.lastName}`,
        customerPhone: state.customerInfo.phone,
      };

      const result = await BookingService.createAppointment(bookingData);
      return result;
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Randevu oluşturulurken hata oluştu');
      return false;
    } finally {
      setState(prev => ({ ...prev, isBooking: false }));
    }
  }, [state.bookingData, state.customerInfo, validateCurrentStep]);

  const resetFlow = useCallback(() => {
    setState({
      currentStep: 'staff',
      bookingData: {},
      customerInfo: {},
      isBooking: false,
    });
  }, []);

  const getCompletedSteps = useCallback((): BookingStep[] => {
    const steps: BookingStep[] = [];
    
    if (state.bookingData.staffId) steps.push('staff');
    if (state.bookingData.date) steps.push('date');
    if (state.bookingData.timeSlot) steps.push('time');
    if (state.customerInfo.firstName && 
        state.customerInfo.lastName && 
        state.customerInfo.phone) steps.push('customer');
    
    return steps;
  }, [state.bookingData, state.customerInfo]);

  return {
    // State
    currentStep: state.currentStep,
    bookingData: state.bookingData,
    customerInfo: state.customerInfo,
    isBooking: state.isBooking,
    phoneError: state.phoneError,
    error: state.error,

    // Actions
    updateBookingData,
    updateCustomerInfo,
    setPhoneError,
    setError,
    nextStep,
    prevStep,
    goToStep,
    submitBooking,
    resetFlow,

    // Computed values
    canGoNext: canGoNext(),
    canGoBack: canGoBack(),
    isLastStep: isLastStep(),
    completedSteps: getCompletedSteps(),
    validateCurrentStep,
  };
}