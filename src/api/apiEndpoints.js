export const API_ENDPOINTS = {
  AUTH: {
    SIGNUP: '/auth/signup',
    LOGIN: '/auth/login',
  },
  USERS: {
    ME: '/users/getMe',
    UPDATE_ME: '/users/updateMe',
    CHANGE_PASSWORD: '/users/changeMyPassword',
    LIST: '/users',
    DETAILS: (id) => `/users/${id}`,
  },
  PRODUCTS: {
    LIST: '/products',
    DISCOUNTED: '/products/discounted',
    DETAILS: (id) => `/products/${id}`,
    BY_CATEGORY: (categoryId) => `/products?category=${categoryId}`,
  },
  VARIANTS: {
    LIST: '/variants',
    DETAILS: (id) => `/variants/${id}`,
    BY_PRODUCT: (productId) => `/products/${productId}/variants`,
  },
  SETS: {
    LIST: '/sets',
    DETAILS: (id) => `/sets/${id}`,
  },
  SIZES: {
    LIST: '/sizes',
  },
  COLORS: {
    LIST: '/colors',
  },
  CUSTOMERS: {
    LOOKUP: (phone) => `/customers/lookup?phone=${encodeURIComponent(phone)}`,
    LOYALTY_HISTORY: (id) => `/customers/${id}/loyalty-history`,
  },
  CATEGORIES: {
    LIST: '/categories',
    DETAILS: (id) => `/categories/${id}`,
  },
  SUBCATEGORIES: {
    LIST: '/subcategories',
  },
  CART: {
    GET: '/cart',
    ADD: '/cart',
    UPDATE: (itemId) => `/cart/${itemId}`,
    REMOVE: (itemId) => `/cart/${itemId}`,
    CLEAR: '/cart',
    APPLY_COUPON: '/cart/applyCoupon',
  },
  ORDERS: {
    LIST: '/orders',
    DETAILS: (id) => `/orders/${id}`,
    CREATE: '/orders',
    CHECK_PURCHASED: (productId) => `/orders/check-purchased/${productId}`,
  },
  WISHLIST: {
    GET: '/wishlist',
    ADD: '/wishlist',
    REMOVE: (productId) => `/wishlist/${productId}`,
  },
  ADDRESSES: {
    LIST: '/addresses',
    ADD: '/addresses',
    REMOVE: (addressId) => `/addresses/${addressId}`,
  },
  COUPONS: {
    LIST: '/coupons',
    DETAILS: (id) => `/coupons/${id}`,
  },
  REVIEWS: {
    ALL: '/reviews',
    LIST: '/reviews',
    DETAILS: (id) => `/reviews/${id}`,
    PRODUCT_REVIEWS: (productId) => `/products/${productId}/reviews`,
    DELETE_PRODUCT_REVIEW: (productId, reviewId) => `/products/${productId}/reviews/${reviewId}`,
  },
  SETTINGS: {
    GET: '/settings',
    UPDATE: '/settings',
  },
  BANNERS: {
    LIST: '/banners',
    DETAILS: (id) => `/banners/${id}`,
  },
  ADMIN: {
    DASHBOARD_STATS: '/admin/dashboard/stats',
    CUSTOMER_DELETE: (customerId) => `/admin/customers/${customerId}`,
  },
  ADMIN_CUSTOMER_DELETE: (customerId) => `/admin/customers/${customerId}`,
};
