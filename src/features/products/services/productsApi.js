import { apiClient } from '@/api/apiClient.js';
import { API_ENDPOINTS } from '@/api/apiEndpoints.js';

export const productsApi = {
  // Fetch all products (supports category, keyword, sort, page, limit, price filters)
  getProducts: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== '' && params[key] !== null) {
        cleanParams[key] = params[key];
      }
    });

    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, { params: cleanParams });
    const data = response.data?.data || [];
    const paginationResult = response.data?.paginationResult || {};
    const total =
      response.data?.total ??
      response.data?.totalDocuments ??
      paginationResult?.total ??
      paginationResult?.totalDocuments ??
      paginationResult?.totalCount ??
      response.data?.results ??
      data.length;

    return {
      products: data,
      data,
      total,
      results: response.data?.results ?? data.length,
      paginationResult,
    };
  },

  // Fetch featured products (limit to 8)
  getFeaturedProducts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { limit: 8 },
    });
    return response.data?.data || [];
  },

  // Fetch best selling products (sorted by sold count)
  getBestSellers: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.LIST, {
      params: { sort: '-sold', limit: 4 },
    });
    return response.data?.data || [];
  },

  // Fetch discounted products
  getDiscountedProducts: async () => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DISCOUNTED);
    return response.data?.data || [];
  },

  // Get specific product details by ID
  getProductDetails: async (id) => {
    const response = await apiClient.get(API_ENDPOINTS.PRODUCTS.DETAILS(id));
    return response.data?.data;
  },

  // Get categories
  getCategories: async () => {
    const response = await apiClient.get(API_ENDPOINTS.CATEGORIES.LIST);
    return response.data?.data || [];
  },

  // Get product reviews
  getProductReviews: async (productId) => {
    const response = await apiClient.get(API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId));
    return response.data?.data || [];
  },

  // Get all store reviews (Admin)
  getAllReviews: async (params = {}) => {
    const response = await apiClient.get(API_ENDPOINTS.REVIEWS.ALL, { params });
    const data = response.data?.data || [];
    const total = response.data?.results || response.data?.total || data.length;
    return { reviews: data, data, total };
  },

  // Create a review
  createProductReview: async ({ productId, title, ratings }) => {
    const response = await apiClient.post(API_ENDPOINTS.REVIEWS.PRODUCT_REVIEWS(productId), { title, ratings });
    return response.data?.data;
  },

  // Delete a review (Customer or Admin)
  deleteProductReview: async ({ productId, reviewId }) => {
    if (productId) {
      const response = await apiClient.delete(API_ENDPOINTS.REVIEWS.DELETE_PRODUCT_REVIEW(productId, reviewId));
      return response.data;
    }
    const response = await apiClient.delete(API_ENDPOINTS.REVIEWS.DETAILS(reviewId));
    return response.data;
  },

  // Delete review by ID (Admin)
  deleteReview: async (reviewId) => {
    const response = await apiClient.delete(API_ENDPOINTS.REVIEWS.DETAILS(reviewId));
    return response.data;
  },
  // Create a product (FormData)
  createProduct: async (formData) => {
    const response = await apiClient.post(API_ENDPOINTS.PRODUCTS.LIST, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data?.data;
  },

  // Update a product (supports FormData or JSON object)
  updateProduct: async ({ id, data }) => {
    const headers = {};
    if (data instanceof FormData) {
      headers['Content-Type'] = 'multipart/form-data';
    }
    const response = await apiClient.put(API_ENDPOINTS.PRODUCTS.DETAILS(id), data, { headers });
    return response.data?.data;
  },

  // Delete a product
  deleteProduct: async (id) => {
    const response = await apiClient.delete(API_ENDPOINTS.PRODUCTS.DETAILS(id));
    return response.data;
  },

  // Delete multiple products
  deleteBulkProducts: async (ids) => {
    const response = await apiClient.delete('/products/bulk', { data: { ids } });
    return response.data;
  },

  // Update status for multiple products (e.g. archived, active, hidden)
  updateBulkStatus: async ({ ids, status }) => {
    const response = await apiClient.put('/products/bulk/status', { ids, status });
    return response.data;
  },
};
