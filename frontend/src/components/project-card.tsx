import Image from "next/image";
import Link from "next/link";
import type { LocalizedProject } from "@/i18n/content";
import { projectCoverSrc } from "@/lib/content";

type ProjectCardProps = {
  project: LocalizedProject;
  index: number;
  featuredLabel: string;
};

export function ProjectCard({ project, index, featuredLabel }: ProjectCardProps) {
  const cover = projectCoverSrc(project.cover);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group grid gap-5 border-t border-line py-8 transition-colors hover:border-accent md:grid-cols-[72px_1.3fr_0.9fr_100px] md:items-end"
    >
      <span className="font-mono text-sm text-mute">0{index + 1}</span>
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-3xl tracking-tight text-ink transition-colors group-hover:text-accent md:text-4xl">
            {project.title}
          </h3>
          {project.featured ? (
            <span className="ink-stamp px-2 py-1 text-[10px] tracking-[0.12em]">
              {featuredLabel}
            </span>
          ) : null}
        </div>
        <p className="mt-3 max-w-xl text-mute">{project.summary}</p>
        {cover ? (
          <div className="relative mt-5 aspect-[16/10] max-w-md overflow-hidden border border-line bg-surface">
            <Image
              src={cover}
              alt={project.title}
              fill
              className="object-cover transition duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 768px) 100vw, 420px"
            />
          </div>
        ) : null}
      </div>
      <div className="text-sm uppercase tracking-[0.12em] text-mute">
        <p>{project.category}</p>
        <p className="mt-2 normal-case tracking-normal">{project.role}</p>
      </div>
      <div className="font-mono text-sm text-ink md:text-right">{project.year}</div>
    </Link>
  );
}
