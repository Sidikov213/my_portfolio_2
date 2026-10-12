import base from "@/data/portfolio-content.json";
import type { Locale } from "@/i18n/locale";

const enOverlay = {
  profile: {
    fullName: "Sodirkhon Sidikov",
    profession: "Python Developer (AI + Integrations)",
    specialization: "Backend development, AI integrations, and business process automation",
    tagline: "I build backend systems, AI integrations, and automation that work in real businesses.",
    shortTagline: "From a business problem to a production-ready service.",
    location: "Makhachkala, Republic of Dagestan, Russia",
    availabilityText: "Open to remote work and interesting commercial projects",
    shortBio:
      "Python developer with hands-on experience shipping commercial systems to production. I specialize in backend development, AI integrations, Telegram bots, and business automation via Bitrix24 and external APIs.",
    philosophy:
      "First understand the real process and constraints, then choose the architecture, and only after that write code. A good system should be clear for users, predictable in production, and measurably useful for the business.",
  },
  contacts: {
    preferred: "Telegram or email",
  },
  stats: [
    { value: "57M+ RUB", label: "processed through the production loyalty system" },
    { value: "190", label: "active clients in the system" },
    { value: "Top 10", label: "federal Alfa Hackathon final" },
    { value: "4 people", label: "team led at the hackathon" },
  ],
  skillGroups: [
    {
      name: "Backend",
      items: ["Python", "FastAPI", "Django", "Flask", "REST API", "Pydantic", "SQLAlchemy", "Alembic", "JWT", "Jinja2"],
    },
    {
      name: "AI / LLM",
      items: ["OpenAI API", "OpenRouter", "AI assistants", "Telegram bots", "Prompt design", "Business automation"],
    },
    {
      name: "Databases",
      items: ["PostgreSQL", "SQLite", "Schema design", "Migrations", "ORM"],
    },
    {
      name: "Frontend",
      items: ["React", "Next.js", "TypeScript", "JavaScript", "Tailwind CSS", "Framer Motion"],
    },
    {
      name: "DevOps",
      items: ["Docker", "Docker Compose", "Linux VPS", "Nginx", "Uvicorn", "systemd", "HTTPS", "Pytest"],
    },
    {
      name: "Integrations",
      items: ["Bitrix24 API", "Bitrix24 webhooks", "Telegram Bot API", "Yandex Maps API", "SMS / OTP", "External REST APIs"],
    },
  ],
  experience: [
    {
      company: "Freelance",
      role: "Python Developer / Fullstack Developer",
      period: "2025 — present",
      location: "Remote",
      bullets: [
        "Built a production loyalty system with 57M+ RUB processed and 190 active clients.",
        "Integrated Bitrix24 CRM into client business workflows.",
        "Developed Telegram bots and AI features with OpenAI/OpenRouter.",
        "Deployed apps on Linux VPS with Nginx, Docker, Uvicorn, and systemd.",
      ],
    },
    {
      company: "Alfa Hackathon",
      role: "Team Lead / Backend / AI",
      period: "2026",
      location: "Final in Moscow",
      bullets: [
        "2nd place in the qualifying round and Top 10 in the federal final.",
        "Led a team of four people.",
        "Designed a shared backend for the website, mobile app, and Telegram bot.",
        "Presented the solution to the jury.",
      ],
    },
  ],
  education: [
    {
      institution: "College of Dagestan State University",
      program: "Information Systems and Programming",
      period: "2022-2026",
      result: "Honors diploma",
      project: "Design and development of a database for the Athletica sports club",
    },
  ],
  services: {
    "backend-api": {
      title: "Backend development & REST API",
      description: "Server-side web apps, business logic, databases, and secured APIs.",
      price: "On request",
      duration: "After task assessment",
    },
    "business-automation": {
      title: "Business automation & Bitrix24",
      description: "CRM integrations with external services, notifications, internal tools, and admin panels.",
      price: "On request",
      duration: "After process audit",
    },
    "ai-telegram": {
      title: "AI assistants & Telegram bots",
      description: "AI bots with context, scenarios, templates, backend, and integrations.",
      price: "On request",
      duration: "After scenario assessment",
    },
    "fullstack-mvp": {
      title: "Fullstack MVP & admin panels",
      description: "A web product from UI to backend, database, and deployment guidance.",
      price: "On request",
      duration: "After scope assessment",
    },
  },
  projects: {
    "loyalty-system": {
      title: "Production loyalty system",
      category: "Backend / business automation",
      role: "Backend Developer, integrations, deployment & support",
      summary:
        "A production loyalty system for B2B/B2C clients with Bitrix24 integration, bonus balances, a client cabinet, and an admin panel.",
      results: ["57M+ RUB processed", "190 active clients", "Full delivery and support cycle"],
    },
    "installation-map": {
      title: "Installation map with Bitrix24 & Yandex Maps",
      category: "Backend / CRM integration",
      role: "Full-cycle Developer",
      summary:
        "An internal service that shows installation sites on Yandex Maps with deal sync from Bitrix24.",
      results: ["Deployed on a production domain", "Protected access", "Handles addresses without coordinates"],
    },
    "smile-ai": {
      title: "Smile AI — business assistant",
      category: "AI / Telegram / hackathon",
      role: "Team Lead / Backend / AI",
      summary:
        "An AI assistant for small business: mobile app, Telegram bot, and website with a shared backend and synced chats.",
      results: ["2nd place in qualifying", "Top 10 federal final", "Team of 4 people"],
    },
    athletica: {
      title: "Athletica — sports club management system",
      category: "Fullstack / graduation project",
      role: "Fullstack Developer / Database Designer",
      summary:
        "An information system for clients, coaches, memberships, workouts, bookings, payments, and analytics.",
      results: ["Completed graduation project", "Honors diploma"],
    },
    "hair-lab": {
      title: "Hair Lab — barbershop online booking",
      category: "Fullstack / portfolio project",
      role: "Fullstack Developer",
      summary:
        "A fullstack booking app with auth, slot availability checks, a personal cabinet, and an admin panel.",
      results: ["Ready demo system", "Documented REST API"],
    },
    "url-shortener": {
      title: "URL Shortener",
      category: "Backend / microservice",
      role: "Backend Developer",
      summary:
        "A link-shortening microservice with redirects, click stats, migrations, tests, and Docker Compose.",
      results: ["Production-like architecture", "Automated tests", "Docker Compose"],
    },
  },
} as const;

export function getLocalizedContent(locale: Locale) {
  if (locale === "ru") {
    return {
      ...base,
      profile: {
        ...base.profile,
        fullName: base.profile.fullNameRu,
      },
    };
  }

  return {
    ...base,
    profile: {
      ...base.profile,
      ...enOverlay.profile,
      fullName: enOverlay.profile.fullName,
    },
    contacts: {
      ...base.contacts,
      ...enOverlay.contacts,
    },
    stats: enOverlay.stats,
    skillGroups: enOverlay.skillGroups,
    experience: enOverlay.experience,
    education: enOverlay.education,
    services: base.services.map((service) => ({
      ...service,
      ...enOverlay.services[service.slug as keyof typeof enOverlay.services],
    })),
    projects: base.projects.map((project) => ({
      ...project,
      ...enOverlay.projects[project.slug as keyof typeof enOverlay.projects],
    })),
  };
}

export type LocalizedContent = ReturnType<typeof getLocalizedContent>;
export type LocalizedProject = LocalizedContent["projects"][number];
