/**
 * useDebounce hook for debouncing values and functions
 */

'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

// Hook for debouncing a value
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Hook for debouncing a function
export function useDebouncedCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedCallback = useCallback(
    (...args: Parameters<T>) => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
      }

      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  return debouncedCallback;
}

// Hook for debouncing async functions
export function useDebouncedAsyncCallback<T extends (...args: any[]) => Promise<any>>(
  callback: T,
  delay: number
): [T, boolean] {
  const [isLoading, setIsLoading] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const debouncedCallback = useCallback(
    async (...args: Parameters<T>): Promise<ReturnType<T>> => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
      }

      return new Promise((resolve, reject) => {
        timeoutRef.current = setTimeout(async () => {
          try {
            setIsLoading(true);
            const result = await callback(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            setIsLoading(false);
          }
        }, delay);
      });
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  return [debouncedCallback, isLoading];
}

// Hook for debouncing state updates
export function useDebouncedState<T>(
  initialValue: T,
  delay: number
): [T, T, (value: T) => void] {
  const [value, setValue] = useState<T>(initialValue);
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return [value, debouncedValue, setValue];
}

// Hook for debouncing search queries
export function useDebouncedSearch(
  searchTerm: string,
  delay: number = 300
): [string, boolean] {
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState(searchTerm);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    setIsSearching(true);
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setIsSearching(false);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay]);

  return [debouncedSearchTerm, isSearching];
}

// Hook for throttling function calls
export function useThrottledCallback<T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T {
  const lastCall = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const throttledCallback = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      
      if (now - lastCall.current >= delay) {
        lastCall.current = now;
        callback(...args);
      } else {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
        timeoutRef.current = setTimeout(() => {
          lastCall.current = Date.now();
          callback(...args);
        }, delay - (now - lastCall.current));
      }
    },
    [callback, delay]
  ) as T;

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== undefined) {
        clearTimeout(timeoutRef.current as ReturnType<typeof setTimeout>);
      }
    };
  }, []);

  return throttledCallback;
}