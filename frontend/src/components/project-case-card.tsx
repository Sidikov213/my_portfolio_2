import Link from "next/link";
import type { LocalizedProject } from "@/i18n/content";

type ProjectCaseCardProps = {
  project: LocalizedProject;
  statusLabel: string;
  categoryLabel: string;
  ctaLabel: string;
  highlight?: boolean;
};

function initials(title: string) {
  const parts = title
    .replace(/[-—–]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2);
  return parts.map((part) => part[0]?.toUpperCase() ?? "").join("") || "SS";
}

export function ProjectCaseCard({
  project,
  statusLabel,
  categoryLabel,
  ctaLabel,
  highlight = false,
}: ProjectCaseCardProps) {
  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`project-case ${highlight ? "is-highlight" : ""}`}
    >
      <div className="project-case__tags">
        <span className="project-case__tag">{categoryLabel}</span>
        <span className="project-case__tag">{statusLabel}</span>
      </div>

      <div className="project-case__head">
        <span className="project-case__mark" aria-hidden>
          {initials(project.title)}
        </span>
        <div className="min-w-0">
          <h3 className="project-case__title">{project.title}</h3>
          <p className="project-case__lead">{project.role}</p>
        </div>
      </div>

      <p className="project-case__summary">{project.summary}</p>

      <ul className="project-case__features">
        {project.results.slice(0, 4).map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <div className="project-case__meta">
        <p>{project.year}</p>
        <p>{project.stack.join(" · ")}</p>
      </div>

      <span className="project-case__cta">
        {ctaLabel}
        <span aria-hidden> →</span>
      </span>
    </Link>
  );
}
