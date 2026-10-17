import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const bannersApi = {
  // Fetch all banners
  getBanners: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.BANNERS.LIST, { params });
    const data = response.data?.data || [];
    const heroBanner = response.data?.heroBanner || (Array.isArray(data) ? data[0] : data) || null;
    const total = response.data?.results || response.data?.total || data.length;
    return { banners: data, data, heroBanner, total };
  },

  // Get specific banner by ID
  getBanner: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.BANNERS.DETAILS(id));
    return response.data?.data;
  },

  // Create banner (FormData)
  createBanner: async (formData) => {
    const response = await apiClient.post(API_ENDPOINTS.BANNERS.LIST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  // Update banner (FormData or JSON object)
  updateBanner: async ({ id, data }) => {
    const headers = {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.put(API_ENDPOINTS.BANNERS.DETAILS(id), data, { headers });
    return response.data?.data;
  },

  // Delete banner
  deleteBanner: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.BANNERS.DETAILS(id));
    return response.data;
  },
};
