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
      toast.success('تم تحديث صورة الهيرو بنجاح');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'فشل تحديث صورة الهيرو، يرجى المحاولة مرة أخرى';
      toast.error(message);
    },
  });
}

export function useUpdateBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersApi.updateBanner,
    onSuccess: () => {
      toast.success('تم تحديث صورة الهيرو بنجاح');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'فشل تحديث صورة الهيرو';
      toast.error(message);
    },
  });
}

export function useDeleteBanner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: bannersApi.deleteBanner,
    onSuccess: () => {
      toast.success('تمت استعادة الصورة الافتراضية بنجاح');
      queryClient.invalidateQueries({ queryKey: ['banners'] });
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'فشل استعادة الصورة الافتراضية';
      toast.error(message);
    },
  });
}
