"use client";

import { useLocale } from "@/i18n/locale-provider";
import { useTheme } from "@/components/theme-provider";

type ThemeSwitcherProps = {
  className?: string;
};

export function ThemeSwitcher({ className = "" }: ThemeSwitcherProps) {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLocale();
  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-orb ${isDark ? "is-dark" : ""} ${className}`}
      aria-label={isDark ? t.theme.toLight : t.theme.toDark}
      aria-pressed={isDark}
      title={isDark ? t.theme.toLight : t.theme.toDark}
    >
      <span className="theme-orb__core" aria-hidden>
        {isDark ? (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <circle cx="8" cy="8" r="3.1" stroke="currentColor" strokeWidth="1.2" />
            <path
              d="M8 1.8v1.2M8 13v1.2M1.8 8h1.2M13 8h1.2M3.5 3.5l.85.85M11.65 11.65l.85.85M12.5 3.5l-.85.85M4.35 11.65l-.85.85"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinecap="square"
            />
          </svg>
        ) : (
          <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" fill="none">
            <path
              d="M12.8 9.1A4.9 4.9 0 0 1 6.9 3.2 5 5 0 1 0 12.8 9.1Z"
              stroke="currentColor"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>
    </button>
  );
}
