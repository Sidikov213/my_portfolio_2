export type Theme = "light" | "dark";

export const THEME_STORAGE_KEY = "ss-portfolio-theme";
export const DEFAULT_THEME: Theme = "light";

export function isTheme(value: string | null | undefined): value is Theme {
  return value === "light" || value === "dark";
}
