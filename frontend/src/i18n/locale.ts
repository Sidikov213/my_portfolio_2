export type Locale = "ru" | "en";

export const LOCALES: Locale[] = ["ru", "en"];
export const DEFAULT_LOCALE: Locale = "ru";
export const LOCALE_STORAGE_KEY = "portfolio-locale";

export function isLocale(value: string | null | undefined): value is Locale {
  return value === "ru" || value === "en";
}
