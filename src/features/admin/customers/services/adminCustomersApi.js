import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export async function getCustomers(params = {}) {
  const response = await apiClient.get(API_ENDPOINTS.USERS.LIST, { params });
  return {
    data: response.data?.data || [],
    results: response.data?.results || 0,
    total: response.data?.total ?? response.data?.totalDocuments ?? 0,
    paginationResult: response.data?.paginationResult || {},
  };
}

export async function deleteCustomer(customerId) {
  const endpoint = API_ENDPOINTS.USERS?.DETAILS
    ? API_ENDPOINTS.USERS.DETAILS(customerId)
    : `/users/${customerId}`;
  try {
    const response = await apiClient.delete(endpoint);
    return response.data;
  } catch (err) {
    if (err.response?.status === 404 || err.response?.status === 400) {
      const fallback = `/admin/customers/${customerId}`;
      const fallbackResponse = await apiClient.delete(fallback);
      return fallbackResponse.data;
    }
    throw err;
  }
}

export const adminCustomersApi = {
  getCustomers,
  deleteCustomer,
};

export default adminCustomersApi;
