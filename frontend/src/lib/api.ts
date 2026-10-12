const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${API_URL}/api${path}`, {
    next: { revalidate: 30 },
  });

  if (!response.ok) {
    throw new Error(`API error ${response.status}: ${path}`);
  }

  return response.json() as Promise<T>;
}

export type Profile = {
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

export type Category = {
  id: number;
  name: string;
  slug: string;
};

export type Project = {
  id: number;
  title: string;
  slug: string;
  summary: string;
  cover_url: string | null;
  year: number | null;
  role: string;
  technologies: string;
  is_featured: boolean;
  category: Category | null;
};

export type Service = {
  id: number;
  title: string;
  slug: string;
  short_description: string;
  scope: string;
  stages: string;
  timeline: string;
  price_from: string;
};

export const getProfile = () => apiGet<Profile>("/profile");
export const getProjects = (params?: { featured?: boolean; category?: string }) => {
  const search = new URLSearchParams();
  if (params?.featured !== undefined) search.set("featured", String(params.featured));
  if (params?.category) search.set("category", params.category);
  const query = search.toString();
  return apiGet<Project[]>(`/projects${query ? `?${query}` : ""}`);
};
export const getServices = () => apiGet<Service[]>("/services");
