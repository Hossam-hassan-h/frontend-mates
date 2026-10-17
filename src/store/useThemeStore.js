import { create } from 'zustand';

function getInitialTheme() {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('mates-theme');
  if (saved === 'light' || saved === 'dark' || saved === 'system') {
    return saved;
  }
  return 'system';
}

function applyTheme(theme) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  const isDark =
    theme === 'dark' ||
    (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);

  if (isDark) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }
}

export const useThemeStore = create((set) => {
  const initial = getInitialTheme();
  applyTheme(initial);

  if (typeof window !== 'undefined') {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    mediaQuery.addEventListener('change', () => {
      const current = useThemeStore.getState().theme;
      if (current === 'system') {
        applyTheme('system');
      }
    });
  }

  return {
    theme: initial,
    setTheme: (newTheme) => {
      localStorage.setItem('mates-theme', newTheme);
      applyTheme(newTheme);
      set({ theme: newTheme });
    },
  };
});

export default useThemeStore;
