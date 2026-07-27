import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router';
import { Toaster } from 'react-hot-toast';
import type { ReactNode } from 'react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: 5 * 60 * 1000, // 5 minutes cache
      gcTime: 10 * 60 * 1000, // 10 minutes garbage collection
      retry: 1,
    },
  },
});

export const AppProviders = ({ children }: { children: ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        {children}
        <Toaster position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
};
