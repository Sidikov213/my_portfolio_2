"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { useLocale } from "@/i18n/locale-provider";
import { projectCoverSrc } from "@/lib/content";

export function ProjectDetail({ slug }: { slug: string }) {
  const { content, t } = useLocale();
  const project = content.projects.find((item) => item.slug === slug);
  if (!project) notFound();

  const cover = projectCoverSrc(project.cover);
  const currentIndex = content.projects.findIndex((item) => item.slug === slug);
  const nextProject = content.projects[(currentIndex + 1) % content.projects.length];

  return (
    <section className="px-5 pb-20 pt-28 md:px-8">
      <div className="mx-auto max-w-[1400px]">
        <Link href="/projects" className="text-sm uppercase tracking-[0.14em] text-mute hover:text-accent">
          ← {t.projects.back}
        </Link>

        <p className="mt-8 section-label">{project.category}</p>
        <h1 className="font-display mt-4 max-w-5xl text-4xl tracking-tight md:text-6xl">{project.title}</h1>
        <p className="mt-6 max-w-3xl text-lg text-mute">{project.summary}</p>

        {cover ? (
          <div className="relative mt-10 aspect-[16/8] overflow-hidden border border-line bg-surface">
            <Image src={cover} alt={project.title} fill className="object-cover" sizes="100vw" priority />
          </div>
        ) : (
          <div className="mt-10 flex min-h-[240px] items-end border border-line bg-surface p-8">
            <p className="font-mono text-sm uppercase tracking-[0.16em] text-mute">{t.projects.mediaTodo}</p>
          </div>
        )}

        <dl className="mt-12 grid gap-6 border-t border-line pt-8 text-sm uppercase tracking-[0.12em] md:grid-cols-4">
          <div>
            <dt className="text-mute">{t.projects.year}</dt>
            <dd className="mt-2 normal-case tracking-normal text-ink">{project.year}</dd>
          </div>
          <div>
            <dt className="text-mute">{t.projects.status}</dt>
            <dd className="mt-2 normal-case tracking-normal text-ink">{project.status}</dd>
          </div>
          <div>
            <dt className="text-mute">{t.projects.role}</dt>
            <dd className="mt-2 normal-case tracking-normal text-ink">{project.role}</dd>
          </div>
          <div>
            <dt className="text-mute">{t.projects.stack}</dt>
            <dd className="mt-2 normal-case tracking-normal text-ink">{project.stack.join(", ")}</dd>
          </div>
        </dl>

        <div className="mt-12">
          <h2 className="font-display text-2xl">{t.projects.results}</h2>
          <ul className="mt-5 space-y-2 text-mute">
            {project.results.map((result) => (
              <li key={result}>— {result}</li>
            ))}
          </ul>
        </div>

        <div className="mt-10 flex flex-wrap gap-4">
          {project.live ? (
            <a href={project.live} target="_blank" rel="noreferrer" className="btn-primary">
              {t.projects.open}
            </a>
          ) : null}
          {project.github ? (
            <a href={project.github} target="_blank" rel="noreferrer" className="btn-ghost">
              GitHub
            </a>
          ) : null}
        </div>

        <div className="mt-20 border-t border-line pt-8">
          <p className="section-label">{t.projects.next}</p>
          <Link
            href={`/projects/${nextProject.slug}`}
            className="mt-3 block font-display text-3xl hover:text-accent"
          >
            {nextProject.title} →
          </Link>
        </div>
      </div>
    </section>
  );
}
