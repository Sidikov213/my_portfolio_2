"use client";

import { useRef, useState, type MouseEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useLocale } from "@/i18n/locale-provider";

export function HeroMonogram() {
  const { t } = useLocale();
  const reduceMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  function onMove(event: MouseEvent<HTMLDivElement>) {
    if (reduceMotion || !rootRef.current) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;
    const rect = rootRef.current.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    setOffset({ x, y });
  }

  function onLeave() {
    setOffset({ x: 0, y: 0 });
  }

  return (
    <div
      ref={rootRef}
      aria-hidden
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      className="hero-monogram"
    >
      <p className="hero-monogram__caption hero-monogram__caption--top">
        <span className="block">{t.heroMonogram.top[0]}</span>
        <span className="block">{t.heroMonogram.top[1]}</span>
      </p>

      <p className="hero-monogram__caption hero-monogram__caption--bottom">
        <span className="block">{t.heroMonogram.bottom[0]}</span>
        <span className="block">{t.heroMonogram.bottom[1]}</span>
      </p>

      <div className="hero-monogram__stage">
        <svg
          className="hero-monogram__ellipse"
          viewBox="0 0 520 360"
          fill="none"
          style={
            reduceMotion
              ? undefined
              : {
                  transform: `translate(calc(-50% + ${offset.x * 2}px), calc(-50% + ${offset.y * 2}px)) rotate(-10deg)`,
                  transition: "transform 180ms ease-out",
                }
          }
        >
          <motion.ellipse
            cx="260"
            cy="180"
            rx="228"
            ry="118"
            stroke="var(--accent)"
            strokeWidth="1"
            opacity={0.55}
            initial={reduceMotion ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.55 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.45, delay: 0.45, ease: [0.4, 0, 0.2, 1] }
            }
          />
          {!reduceMotion ? (
            <circle r="3" fill="var(--accent)">
              <animate
                attributeName="opacity"
                values="0;1;1;0.9"
                keyTimes="0;0.15;0.7;1"
                dur="0.5s"
                begin="0.55s"
                fill="freeze"
              />
              <animateMotion
                dur="0.5s"
                begin="0.55s"
                fill="freeze"
                path="M80 180 A180 118 0 0 1 260 62"
              />
            </circle>
          ) : (
            <circle cx="260" cy="62" r="3" fill="var(--accent)" opacity="0.9" />
          )}
        </svg>

        <div className="hero-monogram__letters">
          <motion.span
            className="hero-monogram__s hero-monogram__s--outline"
            style={
              reduceMotion
                ? undefined
                : {
                    transform: `translate3d(${offset.x * 3}px, ${offset.y * 3}px, 0)`,
                    transition: "transform 180ms ease-out",
                  }
            }
            initial={reduceMotion ? false : { clipPath: "inset(0 100% 0 0)", opacity: 0.4 }}
            animate={{ clipPath: "inset(0 0% 0 0)", opacity: 1 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
            }
          >
            S
          </motion.span>

          <motion.span
            className="hero-monogram__s hero-monogram__s--fill"
            style={
              reduceMotion
                ? undefined
                : {
                    transform: `translate3d(${offset.x * 5}px, ${offset.y * 5}px, 0)`,
                    transition: "transform 180ms ease-out",
                  }
            }
            initial={reduceMotion ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={
              reduceMotion
                ? { duration: 0 }
                : { duration: 0.45, delay: 0.22, ease: [0.22, 1, 0.36, 1] }
            }
          >
            S
          </motion.span>
        </div>
      </div>
    </div>
  );
}
