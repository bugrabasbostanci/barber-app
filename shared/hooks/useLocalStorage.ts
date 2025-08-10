/**
 * useLocalStorage hook for persisting state in localStorage
 */

'use client';

import { useState, useEffect } from 'react';

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void, () => void] {
  // State to store our value
  // Pass initial state function to useState so logic is only executed once
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    
    try {
      // Get from local storage by key
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialValue
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      // If error also return initialValue
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Return a wrapped version of useState's setter function that persists the new value to localStorage.
  const setValue = (value: T | ((val: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      
      // Save state
      setStoredValue(valueToStore);
      
      // Save to local storage
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      // A more advanced implementation would handle the error case
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  // Function to remove the item from localStorage
  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue];
}

export function useLocalStorageState<T>(key: string, initialValue: T) {
  return useLocalStorage(key, initialValue);
}

// Hook for boolean values
export function useLocalStorageBoolean(key: string, initialValue: boolean = false) {
  return useLocalStorage(key, initialValue);
}

// Hook for string values
export function useLocalStorageString(key: string, initialValue: string = '') {
  return useLocalStorage(key, initialValue);
}

// Hook for number values
export function useLocalStorageNumber(key: string, initialValue: number = 0) {
  return useLocalStorage(key, initialValue);
}

// Hook for array values
export function useLocalStorageArray<T>(key: string, initialValue: T[] = []) {
  return useLocalStorage(key, initialValue);
}

// Hook for object values
export function useLocalStorageObject<T extends Record<string, any>>(
  key: string, 
  initialValue: T
) {
  return useLocalStorage(key, initialValue);
}