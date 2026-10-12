"use client";

import { useLocale } from "@/i18n/locale-provider";

type LanguageSwitcherProps = {
  className?: string;
};

export function LanguageSwitcher({ className = "" }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useLocale();

  return (
    <div className={`lang-pair ${className}`} role="group" aria-label={t.lang.label}>
      <button
        type="button"
        onClick={() => setLocale("ru")}
        className={`lang-pair__item ${locale === "ru" ? "is-active" : ""}`}
        aria-pressed={locale === "ru"}
      >
        RU
      </button>
      <span aria-hidden className="lang-pair__sep">
        /
      </span>
      <button
        type="button"
        onClick={() => setLocale("en")}
        className={`lang-pair__item ${locale === "en" ? "is-active" : ""}`}
        aria-pressed={locale === "en"}
      >
        EN
      </button>
    </div>
  );
}
