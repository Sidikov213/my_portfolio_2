"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { HeroMonogram } from "@/components/hero-monogram";
import { RealisticSnakes } from "@/components/realistic-snakes";
import { useLocale } from "@/i18n/locale-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

type HeroVisual = "monogram" | "snakes";

function resolveHeroVisual(raw: unknown): HeroVisual {
  return raw === "snakes" ? "snakes" : "monogram";
}

export function Hero() {
  const reduceMotion = useReducedMotion();
  const { content, t } = useLocale();
  const { profile } = content;
  const [firstName, ...rest] = profile.fullName.split(" ");
  const lastName = rest.join(" ");

  const initialVisual = resolveHeroVisual(
    (content as { site?: { heroVisual?: string } }).site?.heroVisual,
  );
  const [heroVisual, setHeroVisual] = useState<HeroVisual>(initialVisual);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const response = await fetch(`${API_URL}/api/site`, { cache: "no-store" });
        if (!response.ok) return;
        const data = (await response.json()) as { hero_visual?: string };
        if (!cancelled) setHeroVisual(resolveHeroVisual(data.hero_visual));
      } catch {
        // Keep JSON/default visual if API is offline.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const fade = (delay = 0) =>
    reduceMotion
      ? undefined
      : {
          initial: { opacity: 0, y: 12 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] as const },
        };

  return (
    <section className="hero">
      <div className="page-container hero-grid relative z-[1]">
        <div className="hero-copy">
          <motion.div {...fade(0)} className="hero-eyebrow">
            <span className="h-px w-7 shrink-0 bg-accent" />
            <p className="text-sm tracking-[0.02em] text-ink/65 md:text-[0.95rem]">
              {profile.profession}
            </p>
          </motion.div>

          <motion.h1
            {...fade(0.05)}
            className="hero-title font-display text-[clamp(3.1rem,11vw,6.8rem)] leading-[0.92] tracking-[-0.03em] text-ink"
          >
            <span className="block">{firstName}</span>
            <span className="block italic text-accent">{lastName}</span>
          </motion.h1>

          <motion.p
            {...fade(0.1)}
            className="hero-tagline max-w-[36rem] text-[1.05rem] leading-relaxed text-ink/68 md:text-lg"
          >
            {profile.tagline}
          </motion.p>

          <motion.div {...fade(0.15)} className="hero-actions">
            <Link href="/projects" className="btn-primary">
              {t.hero.viewProjects}
            </Link>
            <Link href="/contact" className="btn-ghost">
              {t.hero.contact}
            </Link>
          </motion.div>
        </div>

        <div className="hero-visual">
          {heroVisual === "snakes" ? <RealisticSnakes /> : <HeroMonogram />}
        </div>

        <motion.div {...fade(0.2)} className="hero-status">
          <p className="hero-status__availability">
            <span
              className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${
                profile.availability === "open" ? "bg-accent" : "bg-ink/25"
              }`}
            />
            <span>{profile.availabilityText}</span>
          </p>
          <p className="hero-status__stack font-mono text-[11px] uppercase tracking-[0.16em] text-ink/40">
            FastAPI · Bitrix24 · AI · Postgres
          </p>
        </motion.div>
      </div>
    </section>
  );
}
