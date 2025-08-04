// API service for user profile
export interface UserProfile {
  id: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  role: string;
  createdAt: string;
}

export interface ProfileFormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
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

// Profile API functions
export const profileApi = {
  // Get user profile
  getProfile: async (): Promise<UserProfile> => {
    return apiCall<UserProfile>('/api/profile');
  },

  // Update user profile
  updateProfile: async (data: ProfileFormData): Promise<UserProfile> => {
    return apiCall<UserProfile>('/api/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // Delete user profile
  deleteProfile: async (): Promise<{ message: string }> => {
    return apiCall<{ message: string }>('/api/profile', {
      method: 'DELETE',
    });
  },
};

// Error boundary helper
export { ApiError };