import portfolioContent from "@/data/portfolio-content.json";

export const content = portfolioContent;

export type SiteContent = typeof portfolioContent;
export type Project = SiteContent["projects"][number];
export type Service = SiteContent["services"][number];

export function getProjectBySlug(slug: string): Project | undefined {
  return content.projects.find((project) => project.slug === slug);
}

export function projectCoverSrc(cover: string | null): string | null {
  if (!cover) return null;
  return cover.replace(/^\/content/, "");
}
