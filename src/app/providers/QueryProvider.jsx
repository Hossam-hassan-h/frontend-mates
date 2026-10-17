import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/api/queryClient.js';

export function QueryProvider({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

export default QueryProvider;
