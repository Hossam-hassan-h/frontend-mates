import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../services/ordersApi.js';

// Hook to load all orders
export function useOrders() {
  return useQuery({
    queryKey: ['adminOrders'],
    queryFn: ordersApi.getAllOrders,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to update the status of an order
export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ordersApi.updateOrderStatus,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      queryClient.invalidateQueries({ queryKey: ['adminDashboardStats'] });
    },
  });
}
