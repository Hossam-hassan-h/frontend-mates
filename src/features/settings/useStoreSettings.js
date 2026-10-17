import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export function useStoreSettings() {
  return useQuery({
    queryKey: ['storeSettings'],
    queryFn: async () => {
      const response = await apiClient.get(API_ENDPOINTS.SETTINGS.GET);
      return response.data?.data || response.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateStoreSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (settings) => {
      const response = await apiClient.put(API_ENDPOINTS.SETTINGS.UPDATE || '/settings', settings);
      return response.data?.data || response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['storeSettings'] });
    },
  });
}
