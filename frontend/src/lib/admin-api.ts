const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";
const TOKEN_KEY = "ss_admin_token";

export function getAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setAdminToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearAdminToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getAdminToken();
  const response = await fetch(`${API_URL}/api${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });

  if (response.status === 401) {
    clearAdminToken();
    if (typeof window !== "undefined" && !window.location.pathname.endsWith("/login")) {
      window.location.href = "/admin/login";
    }
    throw new Error("Unauthorized");
  }

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `API error ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export type AdminUser = {
  id: number;
  email: string;
  is_superuser: boolean;
};

export type AdminStats = {
  leads_total: number;
  leads_new: number;
  leads_in_progress: number;
  projects_total: number;
  projects_published: number;
  projects_featured: number;
};

export type AdminLead = {
  id: number;
  name: string;
  contact: string;
  company: string;
  project_type: string;
  description: string;
  budget: string;
  timeline: string;
  status: string;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminCategory = {
  id: number;
  name: string;
  slug: string;
};

export type AdminProject = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_url: string | null;
  year: number | null;
  role: string;
  technologies: string;
  stack: string[];
  results: string[];
  client_name: string;
  github_url: string | null;
  live_url: string | null;
  status: string;
  category_id: number | null;
  category_name: string | null;
  category_label: string;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  is_draft: boolean;
};

export type ProjectWritePayload = {
  title: string;
  slug?: string | null;
  summary: string;
  cover_url?: string | null;
  year?: number | null;
  role: string;
  stack: string[];
  results: string[];
  client_name: string;
  github_url?: string | null;
  live_url?: string | null;
  status: string;
  category_id?: number | null;
  category_label?: string;
  sort_order: number;
  is_featured: boolean;
  is_published: boolean;
  is_draft: boolean;
};

export async function adminLogin(email: string, password: string) {
  const data = await adminFetch<{ access_token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setAdminToken(data.access_token);
  return data;
}

export const getAdminMe = () => adminFetch<AdminUser>("/auth/me");
export const getAdminStats = () => adminFetch<AdminStats>("/admin/stats");
export const getAdminLeads = (status?: string) =>
  adminFetch<AdminLead[]>(`/admin/leads${status ? `?status=${status}` : ""}`);
export const updateLeadStatus = (id: number, status: string) =>
  adminFetch<AdminLead>(`/admin/leads/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
export const deleteLead = (id: number) =>
  adminFetch<void>(`/admin/leads/${id}`, { method: "DELETE" });

export const getAdminCategories = () => adminFetch<AdminCategory[]>("/admin/categories");
export const getAdminProjects = () => adminFetch<AdminProject[]>("/admin/projects");
export const getAdminProject = (id: number) => adminFetch<AdminProject>(`/admin/projects/${id}`);
export const createAdminProject = (payload: ProjectWritePayload) =>
  adminFetch<AdminProject>("/admin/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAdminProject = (id: number, payload: ProjectWritePayload) =>
  adminFetch<AdminProject>(`/admin/projects/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const updateProjectFlags = (
  id: number,
  flags: Partial<Pick<AdminProject, "is_featured" | "is_published" | "is_draft">>,
) =>
  adminFetch<AdminProject>(`/admin/projects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(flags),
  });
export const deleteAdminProject = (id: number) =>
  adminFetch<void>(`/admin/projects/${id}`, { method: "DELETE" });

export async function uploadAdminImage(file: File): Promise<{ url: string; filename: string }> {
  const token = getAdminToken();
  const body = new FormData();
  body.append("file", file);

  const response = await fetch(`${API_URL}/api/admin/upload`, {
    method: "POST",
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body,
  });

  if (response.status === 401) {
    clearAdminToken();
    if (typeof window !== "undefined") window.location.href = "/admin/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const detail = await response.text();
    throw new Error(detail || `Upload failed (${response.status})`);
  }

  return response.json() as Promise<{ url: string; filename: string }>;
}

export type AdminProfile = {
  id: number;
  full_name: string;
  profession: string;
  specialization: string;
  slogan: string;
  bio: string;
  city: string;
  timezone: string;
  email: string;
  phone: string;
  telegram: string;
  github: string;
  linkedin: string;
  behance: string;
  dribbble: string;
  availability_status: string;
  is_available: boolean;
  resume_url: string | null;
};

export type ProfileWritePayload = Omit<AdminProfile, "id">;

export type AdminService = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  scope: string;
  stages: string;
  timeline: string;
  price_from: string;
  sort_order: number;
  is_published: boolean;
};

export type ServiceWritePayload = {
  title: string;
  slug?: string | null;
  short_description: string;
  scope: string;
  stages: string;
  timeline: string;
  price_from: string;
  sort_order: number;
  is_published: boolean;
};

export const getAdminProfile = () => adminFetch<AdminProfile>("/admin/profile");
export const updateAdminProfile = (payload: ProfileWritePayload) =>
  adminFetch<AdminProfile>("/admin/profile", {
    method: "PUT",
    body: JSON.stringify(payload),
  });

export const getAdminServices = () => adminFetch<AdminService[]>("/admin/services");
export const createAdminService = (payload: ServiceWritePayload) =>
  adminFetch<AdminService>("/admin/services", {
    method: "POST",
    body: JSON.stringify(payload),
  });
export const updateAdminService = (id: number, payload: ServiceWritePayload) =>
  adminFetch<AdminService>(`/admin/services/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
export const updateServiceFlags = (
  id: number,
  flags: Partial<Pick<AdminService, "is_published" | "sort_order">>,
) =>
  adminFetch<AdminService>(`/admin/services/${id}`, {
    method: "PATCH",
    body: JSON.stringify(flags),
  });
export const deleteAdminService = (id: number) =>
  adminFetch<void>(`/admin/services/${id}`, { method: "DELETE" });

export const changeAdminPassword = (current_password: string, new_password: string) =>
  adminFetch<{ status: string }>("/auth/change-password", {
    method: "POST",
    body: JSON.stringify({ current_password, new_password }),
  });

export type HeroVisual = "monogram" | "snakes";

export type SiteSettings = {
  hero_visual: HeroVisual;
};

export const getAdminSiteSettings = () => adminFetch<SiteSettings>("/admin/site");
export const updateAdminSiteSettings = (hero_visual: HeroVisual) =>
  adminFetch<SiteSettings>("/admin/site", {
    method: "PUT",
    body: JSON.stringify({ hero_visual }),
  });

