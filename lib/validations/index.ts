/**
 * Unified validation schemas
 * Single source of truth for all form validations
 */

// Auth validations
export * from './auth'

// Appointment validations  
export * from './appointments'

// Profile validations
export * from './profile'

// Common validation patterns (re-exported from appointments for backward compatibility)
export { 
  phoneSchema,
  turkishNameSchema,
  emailSchema,
  requiredEmailSchema,
  dateSchema,
  timeSchema
} from './appointments'