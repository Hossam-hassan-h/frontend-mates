import { create } from 'zustand';

export const useUiStore = create((set) => ({
  isAdminSidebarOpen: true,
  isMobileMenuOpen: false,
  toggleAdminSidebar: () => set((state) => ({ isAdminSidebarOpen: !state.isAdminSidebarOpen })),
  setAdminSidebarOpen: (isOpen) => set({ isAdminSidebarOpen: isOpen }),
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),
}));
