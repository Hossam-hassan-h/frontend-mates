import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const wishlistApi = {
  getWishlist: async () => {
    const response = await apiClient.get(API_ENDPOINTS.WISHLIST.GET);
    return response.data?.data || [];
  },

  addToWishlist: async (productId) => {
    const response = await apiClient.post(API_ENDPOINTS.WISHLIST.ADD, { productId });
    return response.data;
  },

  removeFromWishlist: async (productId) => {
    const response = await apiClient.delete(API_ENDPOINTS.WISHLIST.REMOVE(productId));
    return response.data;
  },
};
