// API client with CSRF protection
import { useCSRF } from '@/lib/hooks/use-csrf';

// Example API client that uses CSRF protection
export class APIClient {
  private baseUrl: string;
  private makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>;
  
  constructor(makeAuthenticatedRequest: (url: string, options?: RequestInit) => Promise<Response>) {
    this.baseUrl = '/api';
    this.makeAuthenticatedRequest = makeAuthenticatedRequest;
  }
  
  // Book appointment with CSRF protection
  async bookAppointment(data: {
    date: string;
    staffId: string;
    startTime: string;
    notes?: string;
  }) {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/appointments`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    
    return response.json();
  }
  
  // Update user role (development only) with CSRF protection
  async updateRole(role: string) {
    const response = await this.makeAuthenticatedRequest(`${this.baseUrl}/update-role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
    
    return response.json();
  }
  
  // Cancel appointment with CSRF protection
  async cancelAppointment(appointmentId: string) {
    const response = await this.makeAuthenticatedRequest(
      `${this.baseUrl}/appointments/${appointmentId}/cancel`,
      {
        method: 'POST',
        body: JSON.stringify({}),
      }
    );
    
    return response.json();
  }
}

// Hook for using API client with CSRF protection
export function useAPIClient() {
  const { makeAuthenticatedRequest, isLoading: csrfLoading } = useCSRF();
  
  const client = new APIClient(makeAuthenticatedRequest);
  
  return {
    client,
    isLoading: csrfLoading,
  };
}

// Example usage in a React component:
/*
function BookingComponent() {
  const { client, isLoading } = useAPIClient();
  
  const handleBooking = async () => {
    if (isLoading) return; // Wait for CSRF token
    
    try {
      const result = await client.bookAppointment({
        date: '2024-01-15',
        staffId: 'staff-123',
        startTime: '10:00'
      });
      console.log('Booking successful:', result);
    } catch (error) {
      console.error('Booking failed:', error);
    }
  };
  
  if (isLoading) {
    return <div>Loading...</div>;
  }
  
  return (
    <button onClick={handleBooking}>
      Book Appointment
    </button>
  );
}
*/