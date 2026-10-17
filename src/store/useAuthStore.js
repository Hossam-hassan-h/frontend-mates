import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  setUser: (user) =>
    set({
      user,
      isAuthenticated: Boolean(user),
      isInitialized: true,
    }),
  clearAuth: () =>
    set({
      user: null,
      isAuthenticated: false,
      isInitialized: true,
    }),
  setInitialized: (val) => set({ isInitialized: val }),
}));
