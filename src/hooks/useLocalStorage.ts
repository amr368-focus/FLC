import { useState, useEffect, useCallback } from 'react';

/**
 * Custom hook for localStorage with automatic JSON serialization.
 * Handles Date objects specially to preserve them through serialization.
 */
export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Deserialize dates from ISO strings
  const deserialize = (value: string): T => {
    return JSON.parse(value, (k, v) => {
      // Convert ISO date strings back to Date objects
      if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/.test(v)) {
        return new Date(v);
      }
      return v;
    });
  };

  // Read initial value from localStorage or use provided initial value
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = localStorage.getItem(key);
      return item ? deserialize(item) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.warn(`Error saving to localStorage key "${key}":`, error);
    }
  }, [key, storedValue]);

  // Reset to initial value
  const reset = useCallback(() => {
    setStoredValue(initialValue);
    localStorage.removeItem(key);
  }, [key, initialValue]);

  return [storedValue, setStoredValue, reset];
}

/**
 * Hook to check if localStorage has existing data for a key
 */
export function useHasStoredData(key: string): boolean {
  const [hasData, setHasData] = useState(false);
  
  useEffect(() => {
    try {
      setHasData(localStorage.getItem(key) !== null);
    } catch {
      setHasData(false);
    }
  }, [key]);
  
  return hasData;
}

/**
 * Storage keys for the PMO app
 */
export const STORAGE_KEYS = {
  PROJECTS: 'pmo-projects',
  TASKS: 'pmo-tasks',
  GOALS: 'pmo-goals',
  MEETINGS: 'pmo-meetings',
  SETTINGS: 'pmo-settings',
} as const;
