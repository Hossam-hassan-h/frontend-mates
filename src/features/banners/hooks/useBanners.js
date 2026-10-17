import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { bannersApi } from '../services/bannersApi.js';
import { toast } from 'sonner';

export function useBanners(params = {}) {
  return useQuery({
    queryKey: ['banners', params],
    queryFn: () => bannersApi.getBanners(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersApi.createBanner,
    onSuccess: () => {
      toast.success('Hero banner updated successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update hero banner, please try again';
      toast.error(message);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersApi.updateBanner,
    onSuccess: () => {
      toast.success('Hero banner updated successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to update hero banner';
      toast.error(message);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersApi.deleteBanner,
    onSuccess: () => {
      toast.success('Default banner restored successfully');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to restore default banner';
      toast.error(message);
    },
  });
}
