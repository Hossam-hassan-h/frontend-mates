import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';
import { useAuthStore } from '@/store/useAuthStore.js';

export function useHasPurchased(productId) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: ['hasPurchased', productId],
    queryFn: async () => {
      const response = await apiClient.get(
        API_ENDPOINTS.ORDERS.CHECK_PURCHASED(productId)
      );
      return response.data?.hasPurchased ?? false;
    },
    enabled: Boolean(productId && isAuthenticated),
    staleTime: 1000 * 60 * 5,
  });
}

export default useHasPurchased;
