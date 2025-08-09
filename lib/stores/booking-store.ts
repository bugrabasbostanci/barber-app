// Re-export from the new modular booking stores for backward compatibility
export { 
  useBookingStore,
  validatePhone, 
  formatPhoneInput,
  type BookingData,
  type CustomerInfo,
  type Staff,
  type UserProfile
} from './booking';