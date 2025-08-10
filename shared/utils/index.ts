/**
 * Shared utility functions index
 * Central export for all utility functions
 */

// Date utilities
export * from './dateUtils';

// String utilities  
export * from './stringUtils';

// Validation utilities
export type { ValidationError } from './validationUtils';
export { 
  emailSchema,
  phoneSchema,
  nameSchema,
  passwordSchema,
  isValidTurkishId,
  isValidDate,
  isDateInFuture,
  isDateInPast,
  isValidTime,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validateEmail,
  validatePhone,
  customerInfoSchema,
  appointmentSchema,
  profileUpdateSchema,
  validateForm
} from './validationUtils';

// Time utilities
export * from './timeUtils';

// Business rules utilities
export * from './businessRules';

// API utilities
export type { ApiResponse, ApiError } from './apiUtils';
export { 
  ApiClientError, 
  createApiResponse,
  createSuccessResponse,
  createErrorResponse,
  isApiError,
  getErrorMessage,
  buildQueryString,
  buildApiUrl,
  parseApiResponse,
  validateApiResponse,
  retryApiCall,
  debounceApiCall,
  createFetchConfig,
  handleFetchResponse
} from './apiUtils';

// Re-export common utilities from existing lib/utils.ts
export { cn } from '@/lib/utils';