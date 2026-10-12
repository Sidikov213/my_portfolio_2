"use client";

import { ProjectCaseCard } from "@/components/project-case-card";
import { useLocale } from "@/i18n/locale-provider";
import type { LocalizedProject } from "@/i18n/content";

const DEVELOPMENT_STATUSES = new Set(["production", "hackathon-finalist"]);
const PORTFOLIO_STATUSES = new Set([
  "completed-educational",
  "completed-demo",
  "completed-portfolio",
]);

function shortCategory(category: string) {
  return category.split("/")[0]?.trim() || category;
}

export default function ProjectsPage() {
  const { content, t } = useLocale();

  const statusLabels = t.projects.statusLabels;
  const development = content.projects.filter((project) =>
    DEVELOPMENT_STATUSES.has(project.status),
  );
  const portfolio = content.projects.filter((project) =>
    PORTFOLIO_STATUSES.has(project.status),
  );

  const groups: { key: "development" | "portfolio"; items: LocalizedProject[] }[] = [
    { key: "development" as const, items: development },
    { key: "portfolio" as const, items: portfolio },
  ].filter((group) => group.items.length > 0);

  return (
    <section className="projects-page pb-24 pt-28 md:pb-32 md:pt-32">
      <div className="page-container">
        <div className="projects-page__intro">
          <p className="section-label">Work</p>
          <h1 className="font-display mt-4 text-[clamp(2.8rem,7vw,5.5rem)] font-semibold tracking-[-0.04em]">
            {t.projects.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-relaxed text-mute md:text-lg">
            {t.projects.intro}
          </p>
        </div>

        <div className="mt-14 space-y-16 md:mt-20 md:space-y-20">
          {groups.map((group) => (
            <div key={group.key}>
              <div className="projects-page__group-head">
                <p className="section-label">{t.projects.groups[group.key]}</p>
                <span className="about-rule" aria-hidden />
                <p className="font-mono text-[0.7rem] tracking-[0.18em] text-mute">
                  {String(group.items.length).padStart(2, "0")}
                </p>
              </div>

              <div className="projects-grid mt-7 md:mt-9">
                {group.items.map((project) => (
                  <ProjectCaseCard
                    key={project.slug}
                    project={project}
                    categoryLabel={shortCategory(project.category)}
                    statusLabel={
                      statusLabels[project.status as keyof typeof statusLabels] ??
                      project.status
                    }
                    ctaLabel={t.projects.open}
                    highlight={project.featured}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
