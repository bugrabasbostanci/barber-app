// Client-side CSRF token management

export class CSRFManager {
  private static readonly TOKEN_NAME = 'csrf-token';

  // Get CSRF token from cookie
  static getToken(): string | null {
    if (typeof document === 'undefined') return null;
    
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.TOKEN_NAME) {
        return decodeURIComponent(value);
      }
    }
    return null;
  }

  // Add CSRF token to fetch request headers
  static addTokenToHeaders(headers: Record<string, string> = {}): Record<string, string> {
    const token = this.getToken();
    if (token) {
      headers['x-csrf-token'] = token;
    }
    return headers;
  }

  // Enhanced fetch with automatic CSRF protection
  static async fetch(url: string, options: RequestInit = {}): Promise<Response> {
    const token = this.getToken();
    
    // Add CSRF token to headers for state-changing operations
    const method = (options.method || 'GET').toUpperCase();
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method) && token) {
      options.headers = {
        ...options.headers,
        'x-csrf-token': token,
      };
    }

    return fetch(url, options);
  }
}

// Hook for easy React usage
export function useCSRF() {
  const getToken = () => CSRFManager.getToken();
  
  const addToHeaders = (headers: Record<string, string> = {}) => 
    CSRFManager.addTokenToHeaders(headers);

  const secureFetch = (url: string, options: RequestInit = {}) =>
    CSRFManager.fetch(url, options);

  return {
    getToken,
    addToHeaders,
    fetch: secureFetch,
  };
}