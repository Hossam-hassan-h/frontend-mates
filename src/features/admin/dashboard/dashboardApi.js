import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const dashboardApi = {
  getStats: async (dateRange = 'last7Days') => {
    const response = await apiClient.get(API_ENDPOINTS.ADMIN.DASHBOARD_STATS, {
      params: { range: dateRange },
    });
    return response.data;
  },
};
