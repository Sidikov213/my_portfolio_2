"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useLocale } from "@/i18n/locale-provider";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-40px" },
  transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const },
};

export default function AboutPage() {
  const { content, t } = useLocale();
  const { profile, experience, education, skillGroups } = content;

  return (
    <div className="about-page pb-24 pt-28 md:pb-32 md:pt-32">
      {/* Intro */}
      <section className="page-container">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-4">
            <p className="section-label">About</p>
            <span className="about-rule" aria-hidden />
            <p className="font-mono text-[0.7rem] tracking-[0.18em] text-mute">01</p>
          </div>

          <div className="mt-8 grid items-end gap-8 lg:grid-cols-[minmax(0,1.35fr)_minmax(280px,0.65fr)] lg:gap-14">
            <div>
              <h1 className="font-display text-[clamp(2.6rem,7vw,5.2rem)] font-semibold leading-[0.98] tracking-[-0.04em] text-ink">
                {profile.fullName}
              </h1>
              <p className="mt-5 max-w-xl text-base text-mute md:text-lg">{profile.specialization}</p>
            </div>

            <div className="about-meta">
              <div className="about-meta__row">
                <p className="about-meta__label">{t.about.location}</p>
                <p className="about-meta__value">{profile.location}</p>
              </div>
              <div className="about-meta__row">
                <p className="about-meta__label">{t.about.status}</p>
                <p className="about-meta__value">{profile.availabilityText}</p>
              </div>
              <div className="about-meta__row">
                <p className="about-meta__label">{t.about.visual}</p>
                <p className="about-meta__value">{t.about.visualValue}</p>
              </div>
              <a href="/resume.pdf" className="btn-primary mt-6 w-fit" download>
                {t.about.downloadResume}
              </a>
            </div>
          </div>
        </motion.div>

        <motion.blockquote
          className="about-pullquote mt-14 md:mt-20"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.06 }}
        >
          <p>{profile.philosophy}</p>
        </motion.blockquote>

        <motion.div
          className="mt-12 grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16"
          {...fadeUp}
          transition={{ ...fadeUp.transition, delay: 0.1 }}
        >
          <div className="space-y-5 text-base leading-[1.75] text-mute md:text-lg">
            <p>{t.about.bio1}</p>
            <p>{t.about.bio2}</p>
          </div>

          <div>
            <p className="section-label">{t.home.aboutTitle}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {t.home.focus.map((item) => (
                <span key={item} className="about-chip">
                  {item}
                </span>
              ))}
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/projects" className="btn-ghost">
                {t.home.selectedWork}
              </Link>
              <Link href="/contact" className="btn-primary">
                {t.nav.contactCta}
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Experience */}
      <section className="page-container mt-24 md:mt-32">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-4">
            <p className="section-label">{t.about.experience}</p>
            <span className="about-rule" aria-hidden />
            <p className="font-mono text-[0.7rem] tracking-[0.18em] text-mute">02</p>
          </div>
        </motion.div>

        <div className="about-timeline mt-10 md:mt-14">
          {experience.map((item, index) => (
            <motion.article
              key={`${item.company}-${item.role}`}
              className="about-timeline__item"
              {...fadeUp}
              transition={{ ...fadeUp.transition, delay: index * 0.05 }}
            >
              <div className="about-timeline__period">
                <p className="font-mono text-sm tracking-wide text-accent md:text-base">{item.period}</p>
              </div>
              <div className="about-timeline__body">
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{item.role}</h2>
                <p className="mt-2 text-mute">
                  {item.company}
                  <span className="mx-2 text-line">·</span>
                  {item.location}
                </p>
                <ul className="mt-6 space-y-3">
                  {item.bullets.map((bullet) => (
                    <li key={bullet} className="about-bullet text-mute">
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      {/* Education */}
      <section className="page-container mt-24 md:mt-32">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-4">
            <p className="section-label">{t.about.education}</p>
            <span className="about-rule" aria-hidden />
            <p className="font-mono text-[0.7rem] tracking-[0.18em] text-mute">03</p>
          </div>

          {education.map((item) => (
            <article key={item.institution} className="about-edu mt-10 md:mt-12">
              <div className="about-edu__main">
                <h2 className="font-display text-2xl font-semibold tracking-tight md:text-4xl">
                  {item.institution}
                </h2>
                <p className="mt-3 text-mute md:text-lg">
                  {item.program}
                  <span className="mx-2 text-line">·</span>
                  {item.period}
                </p>
                <p className="mt-6 max-w-2xl leading-relaxed text-mute">
                  <span className="text-ink">{t.about.diplomaProject}:</span> {item.project}
                </p>
              </div>
              <p className="about-edu__result">{item.result}</p>
            </article>
          ))}
        </motion.div>
      </section>

      {/* Skills */}
      <section className="page-container mt-24 md:mt-32">
        <motion.div {...fadeUp}>
          <div className="flex items-center gap-4">
            <p className="section-label">{t.about.skills}</p>
            <span className="about-rule" aria-hidden />
            <p className="font-mono text-[0.7rem] tracking-[0.18em] text-mute">04</p>
          </div>

          <div className="mt-10 space-y-10 md:mt-14">
            {skillGroups.map((group) => (
              <div key={group.name} className="about-skill">
                <h3 className="font-display text-lg font-semibold tracking-tight md:w-44 md:shrink-0 md:text-xl">
                  {group.name}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {group.items.map((skill) => (
                    <span key={skill} className="about-chip">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Close */}
      <section className="page-container mt-24 md:mt-32">
        <motion.div className="about-close" {...fadeUp}>
          <h2 className="font-display max-w-2xl text-3xl font-semibold tracking-tight md:text-5xl">
            {t.home.contactTitle}
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/contact" className="btn-primary">
              {t.nav.contactCta}
            </Link>
            <a href="/resume.pdf" className="btn-ghost" download>
              {t.about.downloadResume}
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
