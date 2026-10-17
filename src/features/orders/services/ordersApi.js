import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const ordersApi = {
  // Fetch all orders (returns all for admin/manager, user orders for user)
  getAllOrders: async () => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.LIST);
    return response.data?.data || [];
  },

  // Fetch detailed information for a single order
  getOrderDetails: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.ORDERS.DETAILS(id));
    return response.data?.data;
  },

  // Update order status
  updateOrderStatus: async ({ id, status }) => {
    const response = await apiClient.put(`/orders/${id}/status`, { status });
    return response.data?.data;
  },
};
