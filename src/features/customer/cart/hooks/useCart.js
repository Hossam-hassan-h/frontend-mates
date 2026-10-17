import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { cartApi } from '../services/cartApi.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { useCartStore } from '@/store/useCartStore.js';

export function useCart() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isCustomer = useAuthStore((state) => state.user?.role === 'user');
  const guestItems = useCartStore((state) => state.guestItems);
  const setCartData = useCartStore((state) => state.setCartData);

  const cartQuery = useQuery({
    queryKey: ['cart'],
    queryFn: async () => {
      const data = await cartApi.getCart();
      setCartData(data);
      return data;
    },
    enabled: isCustomer,
    staleTime: 1000 * 60 * 2,
  });

  // Calculate total badge quantity
  let totalQuantity = 0;
  if (isCustomer && cartQuery.data) {
    const items = cartQuery.data.cartItems || cartQuery.data.items || [];
    totalQuantity = items.reduce((acc, item) => acc + (item.quantity || 1), 0);
  } else {
    totalQuantity = guestItems.reduce((acc, item) => acc + (item.quantity || 1), 0);
  }

  return {
    cart: isCustomer ? cartQuery.data : null,
    guestItems,
    totalQuantity,
    isLoading: isCustomer ? cartQuery.isLoading : false,
    isError: isCustomer ? cartQuery.isError : false,
    refetch: cartQuery.refetch,
  };
}

export function useAddToCart() {
  const queryClient = useQueryClient();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const addGuestItem = useCartStore((state) => state.addGuestItem);

  return useMutation({
    mutationFn: async ({ product, variant, quantity = 1, setId = null }) => {
      if (!isAuthenticated) {
        addGuestItem({ product, variant, quantity, setId });
        return { guest: true, quantity };
      }

      const variantId = variant?._id || variant?.id;
      return cartApi.addToCart({
        variantId,
        setId,
        quantity,
      });
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`Added ${variables.quantity} item(s) to bag`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add item to bag');
    },
  });
}
