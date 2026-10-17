import {
  useQuery,
  useMutation,
  useQueryClient,
} from '@tanstack/react-query';

import { queryKeys } from '@/utils/queryKeys.js';
import { useOrderFilters, type OrderFilters } from './useOrderFilters';

import {
  fetchOrders,
  updateOrderStatus,
  type OrdersResponse,
  type FetchOrdersParams,
} from '../services/adminOrdersApi';

import type { Order, OrderStatus } from '@/types/order';

const DEFAULT_ORDER_FILTERS: OrderFilters = {
  search: '',
  status: 'all',
  dateFrom: null,
  dateTo: null,
  sort: '-createdAt',
  page: 1,
};

export function useOrders(customFilters?: OrderFilters) {
  const filters = customFilters ?? DEFAULT_ORDER_FILTERS;

  const queryParams: FetchOrdersParams = {
    search: filters.search || undefined,
    status: filters.status !== 'all' ? filters.status : undefined,
    dateFrom: filters.dateFrom || undefined,
    dateTo: filters.dateTo || undefined,
    sort: filters.sort,
    page: filters.page,
    limit: 10,
  };

  return useQuery<OrdersResponse>({
    queryKey: queryKeys.adminOrders.list(queryParams),
    queryFn: () => fetchOrders(queryParams),
    placeholderData: undefined,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: false,
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<Order, Error, { id: string; status: OrderStatus }>({
    mutationFn: ({ id, status }) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.adminOrders.all,
      });

      queryClient.invalidateQueries({
        queryKey: ['adminOrders'],
      });

      queryClient.invalidateQueries({
        queryKey: ['adminDashboardStats'],
      });
    },
  });
}

export default useOrders;
