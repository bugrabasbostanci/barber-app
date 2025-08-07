import { useEffect, useState } from 'react';

// CSRF token hook for client-side
export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // Get CSRF token on mount
    fetchCSRFToken();
  }, []);
  
  const fetchCSRFToken = async () => {
    try {
      setIsLoading(true);
      
      // Make a GET request to any protected endpoint to get CSRF token
      // The middleware will set the token in cookie
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include', // Include cookies
      });
      
      if (response.ok) {
        const data = await response.json();
        setCSRFToken(data.token);
      }
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Function to make authenticated requests with CSRF token
  const makeAuthenticatedRequest = async (
    url: string, 
    options: RequestInit = {}
  ): Promise<Response> => {
    if (!csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
      throw new Error('CSRF token not available');
    }
    
    const headers = new Headers(options.headers);
    
    // Add CSRF token for state-changing methods
    if (csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(options.method || 'GET')) {
      headers.set('x-csrf-token', csrfToken);
    }
    
    // Ensure content type for JSON requests
    if (options.body && typeof options.body === 'string') {
      headers.set('content-type', 'application/json');
    }
    
    return fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Always include cookies
    });
  };
  
  return {
    csrfToken,
    isLoading,
    makeAuthenticatedRequest,
    refreshToken: fetchCSRFToken,
  };
}