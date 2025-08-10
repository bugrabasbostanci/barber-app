/**
 * useApi hook for API calls with loading, error, and retry logic
 */

'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { ApiClientError, handleApiError } from '../utils/apiUtils';

export interface UseApiOptions {
  immediate?: boolean;
  retryCount?: number;
  retryDelay?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
}

export interface UseApiState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  isSuccess: boolean;
  isError: boolean;
}

export function useApi<T = any, P extends any[] = any[]>(
  apiFunction: (...params: P) => Promise<T>,
  options: UseApiOptions = {}
) {
  const { immediate = false, retryCount = 0, retryDelay = 1000, onSuccess, onError } = options;
  
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    loading: false,
    error: null,
    isSuccess: false,
    isError: false
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const retryCountRef = useRef(0);

  const execute = useCallback(async (...params: P): Promise<T | undefined> => {
    // Cancel any pending request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();
    
    setState(prev => ({
      ...prev,
      loading: true,
      error: null,
      isSuccess: false,
      isError: false
    }));

    retryCountRef.current = 0;

    const attemptRequest = async (): Promise<T | undefined> => {
      try {
        const result = await apiFunction(...params);
        
        setState(prev => ({
          ...prev,
          data: result,
          loading: false,
          isSuccess: true,
          isError: false,
          error: null
        }));

        onSuccess?.(result);
        return result;
      } catch (error: any) {
        if (abortControllerRef.current?.signal.aborted) {
          return;
        }

        const apiError = handleApiError(error);
        
        // Retry logic
        if (retryCountRef.current < retryCount) {
          retryCountRef.current++;
          await new Promise(resolve => setTimeout(resolve, retryDelay));
          return attemptRequest();
        }

        setState(prev => ({
          ...prev,
          loading: false,
          error: apiError.message,
          isSuccess: false,
          isError: true
        }));

        onError?.(apiError);
        throw error;
      }
    };

    return attemptRequest();
  }, [apiFunction, retryCount, retryDelay, onSuccess, onError]);

  const reset = useCallback(() => {
    setState({
      data: null,
      loading: false,
      error: null,
      isSuccess: false,
      isError: false
    });
    retryCountRef.current = 0;
  }, []);

  const cancel = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setState(prev => ({
        ...prev,
        loading: false
      }));
    }
  }, []);

  // Auto-execute if immediate is true
  useEffect(() => {
    if (immediate) {
      execute(...([] as any as P));
    }
  }, [immediate, execute]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    ...state,
    execute,
    reset,
    cancel,
    retry: () => execute(...([] as any as P))
  };
}

// Specialized hook for GET requests
export function useApiGet<T = any>(
  url: string,
  options: UseApiOptions & { params?: Record<string, any> } = {}
) {
  const { params, ...apiOptions } = options;
  
  const fetchFunction = useCallback(async () => {
    const queryString = params ? new URLSearchParams(params).toString() : '';
    const fullUrl = queryString ? `${url}?${queryString}` : url;
    
    const response = await fetch(fullUrl);
    if (!response.ok) {
      throw new ApiClientError(`HTTP Error: ${response.statusText}`, response.status);
    }
    
    return response.json();
  }, [url, params]);

  return useApi<T>(fetchFunction, apiOptions);
}

// Specialized hook for POST requests
export function useApiPost<T = any, D = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const postFunction = useCallback(async (data: D) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new ApiClientError(`HTTP Error: ${response.statusText}`, response.status);
    }
    
    return response.json();
  }, [url]);

  return useApi<T, [D]>(postFunction, options);
}

// Specialized hook for PUT requests
export function useApiPut<T = any, D = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const putFunction = useCallback(async (data: D) => {
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new ApiClientError(`HTTP Error: ${response.statusText}`, response.status);
    }
    
    return response.json();
  }, [url]);

  return useApi<T, [D]>(putFunction, options);
}

// Specialized hook for DELETE requests
export function useApiDelete<T = any>(
  url: string,
  options: UseApiOptions = {}
) {
  const deleteFunction = useCallback(async () => {
    const response = await fetch(url, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      throw new ApiClientError(`HTTP Error: ${response.statusText}`, response.status);
    }
    
    return response.json();
  }, [url]);

  return useApi<T>(deleteFunction, options);
}