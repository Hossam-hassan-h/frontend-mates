import { useMutation, useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { authApi } from '../services/authApi.js';
import { useAuthStore } from '@/store/useAuthStore.js';
import { ROUTE_PATHS } from '@/app/router/routePaths.js';
import { cookieStorage } from '@/utils/cookies.js';

export function useAuth() {
  const navigate = useNavigate();
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const loginMutation = useMutation({
    mutationFn: authApi.login,
    onSuccess: (data) => {
      if (data.token) {
        cookieStorage.setItem('token', data.token);
      }
      setUser(data.data);
      toast.success('Signed in successfully');
      if (data.data?.role === 'admin') {
        navigate(ROUTE_PATHS.ADMIN.DASHBOARD);
      } else if (data.data?.role === 'manager') {
        navigate(ROUTE_PATHS.MANAGER.ORDERS);
      } else {
        navigate(ROUTE_PATHS.HOME);
      }
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to sign in. Please verify your credentials.';
      toast.error(message);
    },
  });

  const registerMutation = useMutation({
    mutationFn: authApi.signup,
    onSuccess: (data) => {
      if (data.token) {
        cookieStorage.setItem('token', data.token);
      }
      setUser(data.data);
      toast.success('Account created successfully');
      navigate(ROUTE_PATHS.HOME);
    },
    onError: (error) => {
      const message = error.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(message);
    },
  });

  const logout = () => {
    cookieStorage.removeItem('token');
    clearAuth();
    toast.info('Signed out successfully');
    navigate(ROUTE_PATHS.AUTH.LOGIN);
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    register: registerMutation.mutate,
    isRegistering: registerMutation.isPending,
    logout,
  };
}

export function useCurrentUser() {
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useQuery({
    queryKey: ['currentUser'],
    queryFn: async () => {
      const token = cookieStorage.getItem('token');
      if (!token) {
        clearAuth();
        return null;
      }
      try {
        const data = await authApi.getMe();
        setUser(data.data);
        return data.data;
      } catch (err) {
        cookieStorage.removeItem('token');
        clearAuth();
        throw err;
      }
    },
    retry: false,
    staleTime: 1000 * 60 * 15,
  });
}
