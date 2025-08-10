// Centralized appointment API service
import { 
  BaseAppointment, 
  CustomerAppointment, 
  BarberAppointment,
  AppointmentFilters,
  CreateManualAppointmentData,
  UpdateAppointmentData,
  BulkUpdateAppointmentData,
  ApiResponse
} from '../types';

// API Error class
export class AppointmentApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'AppointmentApiError';
  }
}

// Base API call function with common error handling
async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new AppointmentApiError(
        `HTTP error: ${response.status}`,
        response.status
      );
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new AppointmentApiError(result.error || 'API request failed');
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof AppointmentApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new AppointmentApiError('Request timeout');
      }
      
      if (error.message?.includes('Failed to fetch')) {
        throw new AppointmentApiError('Network error. Please check your connection.');
      }
    }
    
    throw new AppointmentApiError('An unexpected error occurred');
  }
}

// Build query string from filters
function buildQueryString(filters?: AppointmentFilters): string {
  if (!filters) return '';
  
  const params = new URLSearchParams();
  
  if (filters.startDate) params.append('startDate', filters.startDate);
  if (filters.endDate) params.append('endDate', filters.endDate);
  if (filters.status?.length) {
    filters.status.forEach(status => params.append('status', status));
  }
  if (filters.staffId) params.append('staffId', filters.staffId);
  if (filters.customerId) params.append('customerId', filters.customerId);
  
  return params.toString();
}

// Customer appointment service
export const customerAppointmentService = {
  // Get customer's appointments
  getMyAppointments: async (): Promise<CustomerAppointment[]> => {
    return apiCall<CustomerAppointment[]>('/api/my-appointments');
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId: string): Promise<CustomerAppointment> => {
    return apiCall<CustomerAppointment>(`/api/appointments/${appointmentId}`);
  },
};

// Barber appointment service
export const barberAppointmentService = {
  // Get barber appointments with optional filters
  getAppointments: async (filters?: AppointmentFilters): Promise<BarberAppointment[]> => {
    const queryString = buildQueryString(filters);
    const url = `/api/barber/appointments${queryString ? '?' + queryString : ''}`;
    return apiCall<BarberAppointment[]>(url);
  },

  // Get appointments for specific date
  getDayAppointments: async (date: string): Promise<BarberAppointment[]> => {
    return barberAppointmentService.getAppointments({ startDate: date, endDate: date });
  },

  // Get appointments for week range
  getWeekAppointments: async (startDate: string): Promise<BarberAppointment[]> => {
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 6);
    const endDateString = endDate.toISOString().split('T')[0];
    
    return barberAppointmentService.getAppointments({ 
      startDate, 
      endDate: endDateString 
    });
  },

  // Get appointments for month
  getMonthAppointments: async (year: number, month: number): Promise<BarberAppointment[]> => {
    const startDate = new Date(year, month - 1, 1).toISOString().split('T')[0];
    const endDate = new Date(year, month, 0).toISOString().split('T')[0];
    
    return barberAppointmentService.getAppointments({ startDate, endDate });
  },

  // Create manual appointment
  createManualAppointment: async (data: CreateManualAppointmentData): Promise<BarberAppointment> => {
    return apiCall<BarberAppointment>('/api/barber/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update appointment status
  updateAppointmentStatus: async (
    appointmentId: string, 
    status: BaseAppointment['status']
  ): Promise<BarberAppointment> => {
    return apiCall<BarberAppointment>(`/api/barber/appointments/${appointmentId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  // Update appointment details
  updateAppointment: async (
    appointmentId: string, 
    data: UpdateAppointmentData
  ): Promise<BarberAppointment> => {
    return apiCall<BarberAppointment>(`/api/barber/appointments/${appointmentId}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Bulk update appointment status
  bulkUpdateStatus: async (data: BulkUpdateAppointmentData): Promise<BarberAppointment[]> => {
    return apiCall<BarberAppointment[]>('/api/barber/appointments/bulk/status', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete appointment
  deleteAppointment: async (appointmentId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/barber/appointments/${appointmentId}`, {
      method: 'DELETE',
    });
  },

  // Get appointment details
  getAppointmentDetails: async (appointmentId: string): Promise<BarberAppointment> => {
    return apiCall<BarberAppointment>(`/api/barber/appointments/${appointmentId}`);
  },
};

// Combined service export
export const appointmentService = {
  customer: customerAppointmentService,
  barber: barberAppointmentService,
};