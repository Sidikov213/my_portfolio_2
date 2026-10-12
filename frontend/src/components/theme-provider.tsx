"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  DEFAULT_THEME,
  THEME_STORAGE_KEY,
  isTheme,
  type Theme,
} from "@/lib/theme";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.dataset.theme = theme;
}

let storeTheme: Theme = DEFAULT_THEME;
let didSync = false;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((listener) => listener());
}

function readTheme(): Theme {
  const fromDom = document.documentElement.dataset.theme;
  if (isTheme(fromDom)) return fromDom;
  const saved = window.localStorage.getItem(THEME_STORAGE_KEY);
  return isTheme(saved) ? saved : DEFAULT_THEME;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  if (!didSync) {
    didSync = true;
    const next = readTheme();
    if (next !== storeTheme) {
      storeTheme = next;
      applyTheme(next);
      queueMicrotask(emit);
    }
  }
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return storeTheme;
}

function getServerSnapshot() {
  return DEFAULT_THEME;
}

function commitTheme(theme: Theme) {
  storeTheme = theme;
  applyTheme(theme);
  window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  emit();
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const theme = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = useCallback((next: Theme) => {
    commitTheme(next);
  }, []);

  const toggleTheme = useCallback(() => {
    commitTheme(storeTheme === "light" ? "dark" : "light");
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({ theme, setTheme, toggleTheme }),
    [theme, setTheme, toggleTheme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
}
