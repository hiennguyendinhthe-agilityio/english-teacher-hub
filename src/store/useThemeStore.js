import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const getInitialDarkMode = () => {
  if (typeof window === 'undefined') return false;
  const stored = localStorage.getItem('app-theme');
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      if (typeof parsed?.state?.isDarkMode === 'boolean') {
        return parsed.state.isDarkMode;
      }
    } catch {
      // fallback
    }
  }
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
};

export const useThemeStore = create(
  persist(
    (set, get) => ({
      isDarkMode: getInitialDarkMode(),
      toggleTheme: () => {
        const next = !get().isDarkMode;
        set({ isDarkMode: next });
        if (typeof document !== 'undefined') {
          if (next) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      setTheme: (isDark) => {
        set({ isDarkMode: isDark });
        if (typeof document !== 'undefined') {
          if (isDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }),
    {
      name: 'app-theme',
      onRehydrateStorage: () => (state) => {
        if (typeof document !== 'undefined' && state) {
          if (state.isDarkMode) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
    }
  )
);
