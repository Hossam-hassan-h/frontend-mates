import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';
import type { Order, OrderStatus } from '@/types/order';
import type { OrderSort } from '../hooks/useOrderFilters';

export interface FetchOrdersParams {
  search?: string;
  status?: string;
  dateFrom?: string | null;
  dateTo?: string | null;
  sort?: OrderSort;
  page?: number;
  limit?: number;
}

export interface OrdersResponse {
  orders: Order[];
  total: number;
  page: number;
  pages: number;
  limit: number;
  statusCounts?: Record<string, number>;
}

/**
 * Fetch orders from the backend API.
 * Uses exact query parameters and response structure confirmed from backend code inspection.
 */
export async function fetchOrders(params: FetchOrdersParams = {}): Promise<OrdersResponse> {
  const endpoint = API_ENDPOINTS.ORDERS?.LIST || '/orders';

  // Build params that the backend actually supports:
  const queryParams: Record<string, string | number> = {};

  // Status filtering: backend Order model uses 'orderStatus' in Mongoose filter
  if (params.status && params.status !== 'all') {
    queryParams.orderStatus = params.status;
  }

  // Date range filtering: backend apiFeatures.js directly reads 'from' and 'to' on createdAt
  if (params.dateFrom) {
    queryParams.from = params.dateFrom;
  }
  if (params.dateTo) {
    queryParams.to = params.dateTo;
  }

  // Sorting: backend apiFeatures.js directly reads 'sort' (e.g. -createdAt, createdAt, -finalTotal)
  if (params.sort) {
    queryParams.sort = params.sort;
  }

  // Pagination: backend apiFeatures.js reads 'page' and 'limit'
  queryParams.page = params.page || 1;
  queryParams.limit = params.limit || 10;

  // Search parameter:
  // Note: Backend factory.getAll(Order) currently searches on 'name' by default in apiFeatures.js,
  // whereas the Order model uses 'customerName'. We pass search/keyword if provided.
  if (params.search && params.search.trim()) {
    queryParams.keyword = params.search.trim();
  }

  const { data } = await apiClient.get(endpoint, { params: queryParams });

  // Map exact backend response: { results, total, paginationResult, data }
  const orders: Order[] = Array.isArray(data?.data)
    ? data.data
    : Array.isArray(data?.orders)
    ? data.orders
    : Array.isArray(data)
    ? data
    : [];

  const total =
    typeof data?.total === 'number'
      ? data.total
      : typeof data?.totalDocuments === 'number'
      ? data.totalDocuments
      : typeof data?.count === 'number'
      ? data.count
      : orders.length;

  const page =
    typeof data?.paginationResult?.currentPage === 'number'
      ? data.paginationResult.currentPage
      : params.page || 1;

  const pages =
    typeof data?.paginationResult?.numberOfPages === 'number'
      ? data.paginationResult.numberOfPages
      : Math.max(1, Math.ceil(total / (params.limit || 10)));

  const limit =
    typeof data?.paginationResult?.limit === 'number'
      ? data.paginationResult.limit
      : params.limit || 10;

  return {
    orders,
    total,
    page,
    pages,
    limit,
    statusCounts: data?.statusCounts, // will be undefined as backend does not return it yet
  };
}

/**
 * Update an order's fulfillment status via PUT /api/v1/orders/:id/status.
 * Allowed statuses in backend: pending, preparing, out_for_delivery, completed, cancelled.
 */
export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order> {
  const { data } = await apiClient.put(`/orders/${id}/status`, { status });
  return data?.data || data;
}

/**
 * Fetch single order details via GET /api/v1/orders/:id.
 */
export async function getOrderDetails(id: string): Promise<Order> {
  const { data } = await apiClient.get(API_ENDPOINTS.ORDERS.DETAILS(id));
  return data?.data || data;
}

export const adminOrdersApi = {
  fetchOrders,
  updateOrderStatus,
  getOrderDetails,
};

export default adminOrdersApi;
