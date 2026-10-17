import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const authApi = {
  login: async (credentials) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, credentials);
    return response.data;
  },

  signup: async (userData) => {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.SIGNUP, userData);
    return response.data;
  },


  getMe: async () => {
    const response = await apiClient.get(API_ENDPOINTS.USERS.ME);
    return response.data;
  },
};
