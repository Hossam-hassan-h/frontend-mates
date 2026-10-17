import { apiClient } from './apiClient.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { cookieStorage } from '@/utils/cookies.js';

export function setupInterceptors() {
  // Request Interceptor: Inject JWT token from cookies
  apiClient.interceptors.request.use(
    (config) => {
      const token = cookieStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response Interceptor: Handle 401 Unauthorized errors
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        // Remove token and clear store auth state on session expiration
        cookieStorage.removeItem('token');
        useAuthStore.getState().clearAuth();
      }
      return Promise.reject(error);
    }
  );
}

// Automatically setup interceptors immediately when module loads
setupInterceptors();

