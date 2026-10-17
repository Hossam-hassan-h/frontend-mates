import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const cartApi = {
  getCart: async (phone) => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.CART.GET, {
        params: phone ? { phone } : {},
      });
      return response.data?.data || response.data || null;
    } catch (error) {
      if (error.response?.status === 404) {
        return {
          cartItems: [],
          totalQuantity: 0,
          totalCartPrice: 0,
        };
      }
      throw error;
    }
  },

  addToCart: async ({ variantId, setId, quantity = 1, phone }) => {
    const response = await apiClient.post(API_ENDPOINTS.CART.ADD, {
      variantId,
      setId,
      quantity,
      phone,
    });
    return response.data;
  },

  updateCartItem: async (itemId, quantity, phone) => {
    const response = await apiClient.put(API_ENDPOINTS.CART.UPDATE(itemId), {
      quantity,
      phone,
    });
    return response.data;
  },

  removeFromCart: async (itemId, phone) => {
    const response = await apiClient.delete(API_ENDPOINTS.CART.REMOVE(itemId), {
      params: phone ? { phone } : {},
    });
    return response.data;
  },

  clearCart: async (phone) => {
    const response = await apiClient.delete(API_ENDPOINTS.CART.CLEAR, {
      params: phone ? { phone } : {},
    });
    return response.data;
  },
};
