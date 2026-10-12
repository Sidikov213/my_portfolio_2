"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";

export default function NotFound() {
  const { t } = useLocale();

  return (
    <section className="flex min-h-[100svh] flex-col justify-center px-5 md:px-8">
      <div className="mx-auto w-full max-w-[1400px]">
        <p className="font-mono text-accent">404</p>
        <h1 className="font-display mt-4 text-5xl tracking-tight md:text-7xl">{t.notFound.title}</h1>
        <Link href="/" className="btn-primary mt-10 w-fit">
          {t.notFound.home}
        </Link>
      </div>
    </section>
  );
}
