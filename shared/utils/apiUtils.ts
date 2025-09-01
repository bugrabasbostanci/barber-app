/**
 * API utility functions for the barber appointment system
 */

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
}

export class ApiClientError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.code = code;
  }
}

export function createApiResponse<T>(
  success: boolean,
  data?: T,
  error?: string,
  message?: string
): ApiResponse<T> {
  return {
    success,
    data,
    error,
    message
  };
}

export function createSuccessResponse<T>(data: T, message?: string): ApiResponse<T> {
  return createApiResponse(true, data, undefined, message);
}

export function createErrorResponse(error: string, message?: string): ApiResponse {
  return createApiResponse(false, undefined, error, message);
}

export function handleApiError(error: unknown): ApiError {
  if (error instanceof ApiClientError) {
    return {
      message: error.message,
      status: error.status,
      code: error.code
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
      status: 500
    };
  }

  return {
    message: 'Unknown error occurred',
    status: 500
  };
}

export function isApiError(error: unknown): error is ApiError {
  return typeof error === 'object' && error !== null && 'message' in error && 'status' in error;
}

export function getErrorMessage(error: unknown): string {
  if (isApiError(error)) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error occurred';
}

export function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => searchParams.append(key, String(item)));
      } else {
        searchParams.append(key, String(value));
      }
    }
  });
  
  return searchParams.toString();
}

export function buildApiUrl(baseUrl: string, path: string, params?: Record<string, any>): string {
  const url = `${baseUrl}${path}`;
  
  if (!params || Object.keys(params).length === 0) {
    return url;
  }
  
  const queryString = buildQueryString(params);
  return queryString ? `${url}?${queryString}` : url;
}

export function parseApiResponse<T>(response: any): ApiResponse<T> {
  if (typeof response === 'object' && response !== null) {
    return {
      success: response.success ?? true,
      data: response.data,
      error: response.error,
      message: response.message
    };
  }
  
  return createSuccessResponse(response as T);
}

export function validateApiResponse<T>(response: ApiResponse<T>): T {
  if (!response.success) {
    throw new ApiClientError(
      response.error || response.message || 'API request failed',
      500
    );
  }
  
  return response.data as T;
}

export function retryApiCall<T>(
  apiCall: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    const attempt = (retryCount: number) => {
      apiCall()
        .then(resolve)
        .catch((error) => {
          if (retryCount < maxRetries) {
            setTimeout(() => attempt(retryCount + 1), delay);
          } else {
            reject(error);
          }
        });
    };
    
    attempt(0);
  });
}

export function debounceApiCall<T extends any[]>(
  fn: (...args: T) => Promise<any>,
  delay: number
): (...args: T) => Promise<any> {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: T) => {
    return new Promise((resolve, reject) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        fn(...args).then(resolve).catch(reject);
      }, delay);
    });
  };
}

export function createFetchConfig(options: {
  method?: string;
  headers?: Record<string, string>;
  body?: any;
  timeout?: number;
}): RequestInit {
  const { method = 'GET', headers = {}, body, timeout } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers
    }
  };
  
  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }
  
  if (timeout) {
    config.signal = AbortSignal.timeout(timeout);
  }
  
  return config;
}

export function handleFetchResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new ApiClientError(
      `HTTP Error: ${response.statusText}`,
      response.status
    );
  }
  
  const contentType = response.headers.get('content-type');
  
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as Promise<T>;
}