"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { useLocale } from "@/i18n/locale-provider";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { content, t } = useLocale();

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/about", label: t.nav.about },
    { href: "/projects", label: t.nav.projects },
    { href: "/services", label: t.nav.services },
    { href: "/contact", label: t.nav.contact },
  ];

  return (
    <header className="site-header sticky top-0 z-50">
      <div className="site-header__bar page-container flex items-center justify-between">
        <Link href="/" className="brand-mark group">
          <span className="brand-mark__sigil" aria-hidden>
            SS
          </span>
          <span className="brand-mark__name">{content.profile.fullName}</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex" aria-label={t.nav.mainMenu}>
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`site-nav__link ${active ? "is-active" : ""}`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="site-header__controls hidden lg:flex">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <Link href="/contact" className="site-cta">
            {t.nav.contactCta}
          </Link>
        </div>

        <div className="site-header__controls flex lg:hidden">
          <ThemeSwitcher />
          <LanguageSwitcher />
          <button
            type="button"
            className="site-menu-btn"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">Menu</span>
            <span className={`site-menu-btn__line ${open ? "is-open" : ""}`} />
            <span className={`site-menu-btn__line ${open ? "is-open" : ""}`} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.nav
            id="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 flex flex-col bg-paper px-6 pb-10 pt-28 lg:hidden"
            aria-label={t.nav.mobileMenu}
          >
            <div className="flex flex-1 flex-col justify-center gap-2">
              {links.map((link, index) => {
                const active = pathname === link.href;
                return (
                  <motion.div
                    key={link.href}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.04 * index, duration: 0.35 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={`block font-display text-[clamp(2.4rem,10vw,3.4rem)] leading-[1.05] tracking-[-0.03em] ${
                        active ? "italic text-accent" : "text-ink"
                      }`}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                );
              })}
            </div>
            <Link
              href="/contact"
              onClick={() => setOpen(false)}
              className="site-cta mt-auto w-fit"
            >
              {t.nav.contactCta}
            </Link>
          </motion.nav>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
