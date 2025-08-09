// Combined booking store hook for backward compatibility
import { useBookingFlowStore } from './flow-store';
import { useBookingDataStore } from './data-store';
import { useBookingStaffStore } from './staff-store';
import { validatePhone } from './validation';

// Re-export types and validation
export type { BookingData, CustomerInfo, Staff, UserProfile } from './types';
export { validatePhone, formatPhoneInput } from './validation';

// Combined hook that provides the same interface as the original booking store
export const useBookingStore = () => {
  const flowStore = useBookingFlowStore();
  const dataStore = useBookingDataStore();
  const staffStore = useBookingStaffStore();

  // Enhanced canProceed that checks actual data
  const canProceed = () => {
    switch (flowStore.currentStep) {
      case 1:
        return dataStore.bookingData.date !== "" && dataStore.bookingData.date !== null;
      case 2:
        return dataStore.bookingData.staffId !== "" && dataStore.bookingData.staffId !== null;
      case 3:
        return dataStore.bookingData.timeSlot !== "" && dataStore.bookingData.timeSlot !== null;
      case 4:
        return (
          dataStore.customerInfo.phone.trim() !== "" &&
          validatePhone(dataStore.customerInfo.phone) &&
          !flowStore.phoneError
        );
      default:
        return false;
    }
  };

  // Combined reset function
  const resetBooking = () => {
    flowStore.resetFlow();
    dataStore.resetBookingData();
    // Note: We don't reset staff data as it can be reused
  };

  return {
    // Flow state
    currentStep: flowStore.currentStep,
    isBooking: flowStore.isBooking,
    phoneError: flowStore.phoneError,
    
    // Data state
    bookingData: dataStore.bookingData,
    customerInfo: dataStore.customerInfo,
    userProfile: dataStore.userProfile,
    profileLoading: dataStore.profileLoading,
    
    // Staff state
    staffMembers: staffStore.staffMembers,
    staffLoading: staffStore.staffLoading,
    
    // Flow actions
    setCurrentStep: flowStore.setCurrentStep,
    nextStep: flowStore.nextStep,
    prevStep: flowStore.prevStep,
    setIsBooking: flowStore.setIsBooking,
    setPhoneError: flowStore.setPhoneError,
    
    // Data actions
    updateBookingData: dataStore.updateBookingData,
    updateCustomerInfo: dataStore.updateCustomerInfo,
    setUserProfile: dataStore.setUserProfile,
    fetchUserProfile: dataStore.fetchUserProfile,
    submitBooking: dataStore.submitBooking,
    
    // Staff actions
    setStaffMembers: staffStore.setStaffMembers,
    fetchStaffMembers: staffStore.fetchStaffMembers,
    getStaffName: staffStore.getStaffName,
    
    // Combined computed
    canProceed,
    
    // Combined reset
    resetBooking,
  };
};