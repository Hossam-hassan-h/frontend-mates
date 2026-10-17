import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const categoriesApi = {
  fetchCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data?.data || response.data || [];
  },
};
