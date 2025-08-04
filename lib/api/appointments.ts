// API service for appointments
export interface Appointment {
  id: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW';
  notes?: string;
  staff: {
    id: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  shop: {
    name: string;
    address: string;
  };
  createdAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: string;
}

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

// Base API function with error handling
async function apiCall<T>(
  url: string,
  options: RequestInit = {}
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

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
      throw new ApiError(
        `HTTP error: ${response.status}`,
        response.status
      );
    }

    const result: ApiResponse<T> = await response.json();

    if (!result.success) {
      throw new ApiError(result.error || 'API request failed');
    }

    return result.data;
  } catch (error) {
    clearTimeout(timeoutId);
    
    if (error instanceof ApiError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ApiError('Request timeout');
      }
      
      if (error.message?.includes('Failed to fetch')) {
        throw new ApiError('Network error. Please check your connection.');
      }
    }
    
    throw new ApiError('An unexpected error occurred');
  }
}

// Appointments API functions
export const appointmentsApi = {
  // Get user appointments
  getMyAppointments: async (): Promise<Appointment[]> => {
    return apiCall<Appointment[]>('/api/my-appointments');
  },

  // Cancel appointment
  cancelAppointment: async (appointmentId: string): Promise<{ message: string }> => {
    return apiCall<{ message: string }>(`/api/appointments/${appointmentId}/cancel`, {
      method: 'POST',
    });
  },

  // Get barber appointments (if needed later)
  getBarberAppointments: async (date?: string): Promise<Appointment[]> => {
    const params = date ? `?date=${date}` : '';
    return apiCall<Appointment[]>(`/api/barber/appointments${params}`);
  },
};

// Error boundary helper
export { ApiError };