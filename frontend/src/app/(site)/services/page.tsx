"use client";

import Link from "next/link";
import { useLocale } from "@/i18n/locale-provider";

export default function ServicesPage() {
  const { content, t } = useLocale();

  return (
    <section className="px-5 pb-20 pt-28 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <p className="section-label">Services</p>
        <h1 className="font-display mt-4 text-5xl tracking-tight md:text-7xl">{t.services.title}</h1>
        <p className="mt-6 max-w-2xl text-lg text-mute">{t.services.intro}</p>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {content.services.map((service) => (
            <article key={service.slug} className="border border-line p-8">
              <h2 className="font-display text-3xl">{service.title}</h2>
              <p className="mt-4 text-mute">{service.description}</p>
              <p className="mt-6 text-sm text-mute">
                {t.services.duration}: {service.duration}
              </p>
              <p className="mt-2 font-mono text-accent">{service.price}</p>
              <Link href="/contact" className="btn-ghost mt-8">
                {t.services.requestQuote}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
