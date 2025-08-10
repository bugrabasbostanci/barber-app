/**
 * Shared infrastructure index
 * Central export for all shared utilities, hooks, services, and components
 */

// Utilities
export * from './utils';

// Hooks
export * from './hooks';

// Services (use specific exports to avoid conflicts)
export { 
  ApiClient,
  apiClient,
  TypedApiClient,
  appointmentsApi,
  customersApi,
  staffApi,
  profileApi,
  handleApiError,
  handleComponentError,
  handleAsyncError,
  AppointmentFormatter,
  CustomerFormatter,
  StaffFormatter,
  GenericFormatter,
  formatters,
  CacheService,
  LocalStorageCacheService,
  memoryCache,
  persistentCache,
  cacheable,
  cacheInvalidate
} from './services';

// Components
export * from './components';