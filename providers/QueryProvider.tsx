"use client";

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';

interface QueryProviderProps {
  children: React.ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  const [queryClient] = useState(
    () => {
      const client = new QueryClient({
        defaultOptions: {
          queries: {
            // Stale time: how long data is considered fresh
            staleTime: 5 * 60 * 1000, // 5 minutes
            // Cache time: how long data stays in cache after being unused
            gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
            // Retry configuration
            retry: (failureCount, error: any) => {
              // Don't retry for 4xx errors (client errors)
              if (error?.status >= 400 && error?.status < 500) return false;
              // Retry up to 3 times for other errors
              return failureCount < 3;
            },
            retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
            // Refetch configuration
            refetchOnWindowFocus: false,
            refetchOnReconnect: true,
            refetchOnMount: true,
          },
          mutations: {
            // Retry mutations once on network error
            retry: (failureCount, error: any) => {
              if (error?.message?.includes('Failed to fetch') && failureCount < 1) {
                return true;
              }
              return false;
            },
            retryDelay: 1000,
          },
        },
      });
      
      // Expose query client globally for stores to use
      if (typeof window !== 'undefined') {
        (window as { queryClient?: QueryClient }).queryClient = client;
      }
      
      return client;
    }
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* Show devtools only in development */}
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false} 
          position="bottom"
        />
      )}
    </QueryClientProvider>
  );
}