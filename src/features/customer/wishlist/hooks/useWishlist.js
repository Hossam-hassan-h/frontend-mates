import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { wishlistApi } from '../services/wishlistApi.js';
import { useAuthStore } from '@/store/useAuthStore.js';

export function useWishlist() {
  const isCustomer = useAuthStore((state) => state.user?.role === 'user');

  return useQuery({
    queryKey: ['wishlist'],
    queryFn: wishlistApi.getWishlist,
    enabled: isCustomer,
    staleTime: 1000 * 60 * 5,
  });
}

export function useToggleWishlist() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useMutation({
    mutationFn: async ({ productId, isFavorite }) => {
      if (!isAuthenticated) {
        throw new Error('AUTH_REQUIRED');
      }
      if (isFavorite) {
        return wishlistApi.removeFromWishlist(productId);
      } else {
        return wishlistApi.addToWishlist(productId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['wishlist'] });
      toast.success(variables.isFavorite ? 'Removed from wishlist' : 'Added to wishlist');
    },
    onError: (error) => {
      if (error.message === 'AUTH_REQUIRED') {
        toast.error('Please log in first to add products to your wishlist');
      } else {
        toast.error(error.response?.data?.message || 'Failed to update wishlist');
      }
    },
  });
}
