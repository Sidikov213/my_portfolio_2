"use client";

import Link from "next/link";
import { Hero } from "@/components/hero";
import { ProjectCard } from "@/components/project-card";
import { useLocale } from "@/i18n/locale-provider";

export default function HomePage() {
  const { content, t } = useLocale();
  const { profile, stats, services, contacts } = content;
  const featuredProjects = content.projects.filter((project) => project.featured);

  return (
    <>
      <Hero />

      <section className="py-16 md:py-20">
        <div className="page-container grid gap-4 md:grid-cols-4">
          {stats.map((stat) => (
            <article key={stat.label} className="paper-sheet p-5 transition-transform hover:-translate-y-0.5">
              <p className="font-display text-3xl tracking-tight text-ink md:text-4xl">{stat.value}</p>
              <p className="mt-3 text-sm leading-relaxed text-mute">{stat.label}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="pb-16 md:pb-20">
        <div className="page-container">
          <div className="paper-sheet p-6 md:p-10">
            <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <p className="section-label">{t.home.aboutTitle}</p>
                <h2 className="font-display mt-3 text-3xl tracking-tight md:text-4xl">
                  {t.home.aboutHeadline}
                </h2>
                <p className="mt-4 text-base leading-relaxed text-mute md:text-lg">
                  {profile.shortBio}
                </p>
                <div className="mt-6 flex flex-wrap gap-2">
                  {t.home.focus.map((item) => (
                    <span
                      key={item}
                      className="border border-line bg-paper px-3 py-1.5 text-xs uppercase tracking-[0.14em] text-ink/70"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3 md:items-end">
                <p className="text-sm text-mute">{profile.location}</p>
                <div className="flex flex-wrap gap-3">
                  <Link href="/about" className="btn-ghost">
                    {t.home.aboutMore}
                  </Link>
                  <a href="/resume.pdf" className="btn-primary" download>
                    {t.about.downloadResume}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-container">
          <div className="mb-10 flex items-end justify-between gap-6">
            <div>
              <p className="section-label">Selected work</p>
              <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">
                {t.home.selectedWork}
              </h2>
            </div>
            <Link
              href="/projects"
              className="hidden text-sm uppercase tracking-[0.14em] text-accent md:inline"
            >
              {t.home.allProjects}
            </Link>
          </div>
          <div className="paper-sheet px-4 md:px-8">
            {featuredProjects.map((project, index) => (
              <ProjectCard
                key={project.slug}
                project={project}
                index={index}
                featuredLabel={t.projects.featured}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="pb-20">
        <div className="page-container">
          <p className="section-label">Services</p>
          <h2 className="font-display mt-3 text-4xl tracking-tight md:text-5xl">{t.home.services}</h2>
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {services.map((service) => (
              <article
                key={service.slug}
                className="paper-sheet p-6 transition-transform hover:-translate-y-0.5"
              >
                <h3 className="font-display text-2xl">{service.title}</h3>
                <p className="mt-3 text-mute">{service.description}</p>
                <p className="mt-6 font-mono text-sm text-accent">{service.price}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-24">
        <div className="page-container">
          <div className="paper-sheet flex flex-col items-start gap-8 p-8 md:flex-row md:items-end md:justify-between md:p-12">
            <div>
              <p className="section-label">Contact</p>
              <h2 className="font-display mt-3 max-w-2xl text-4xl tracking-tight md:text-6xl">
                {t.home.contactTitle}
              </h2>
            </div>
            <div className="flex flex-col gap-3 text-mute">
              <a href={`mailto:${contacts.email}`} className="hover:text-accent">
                {contacts.email}
              </a>
              <a href={contacts.telegram} className="hover:text-accent" target="_blank" rel="noreferrer">
                Telegram
              </a>
              <a href={contacts.github} className="hover:text-accent" target="_blank" rel="noreferrer">
                GitHub
              </a>
              <Link href="/contact" className="btn-primary mt-2 w-fit">
                {t.home.write}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
