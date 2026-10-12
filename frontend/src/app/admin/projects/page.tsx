"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAdminProject,
  deleteAdminProject,
  getAdminCategories,
  getAdminProjects,
  updateAdminProject,
  updateProjectFlags,
  uploadAdminImage,
  type AdminCategory,
  type AdminProject,
  type ProjectWritePayload,
} from "@/lib/admin-api";

const STATUS_OPTIONS = [
  "production",
  "hackathon-finalist",
  "completed-educational",
  "completed-demo",
  "completed-portfolio",
  "in-progress",
];

type FormState = {
  title: string;
  slug: string;
  summary: string;
  cover_url: string;
  year: string;
  role: string;
  stackText: string;
  resultsText: string;
  client_name: string;
  github_url: string;
  live_url: string;
  status: string;
  category_id: string;
  category_label: string;
  sort_order: string;
  is_featured: boolean;
  is_published: boolean;
  is_draft: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  summary: "",
  cover_url: "",
  year: String(new Date().getFullYear()),
  role: "",
  stackText: "",
  resultsText: "",
  client_name: "",
  github_url: "",
  live_url: "",
  status: "production",
  category_id: "",
  category_label: "",
  sort_order: "0",
  is_featured: false,
  is_published: true,
  is_draft: false,
});

function projectToForm(project: AdminProject): FormState {
  return {
    title: project.title,
    slug: project.slug,
    summary: project.summary,
    cover_url: project.cover_url ?? "",
    year: project.year != null ? String(project.year) : "",
    role: project.role,
    stackText: project.stack.join(", "),
    resultsText: project.results.join("\n"),
    client_name: project.client_name,
    github_url: project.github_url ?? "",
    live_url: project.live_url ?? "",
    status: project.status || "production",
    category_id: project.category_id != null ? String(project.category_id) : "",
    category_label: project.category_label || project.category_name || "",
    sort_order: String(project.sort_order ?? 0),
    is_featured: project.is_featured,
    is_published: project.is_published,
    is_draft: project.is_draft,
  };
}

function formToPayload(form: FormState): ProjectWritePayload {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || null,
    summary: form.summary.trim(),
    cover_url: form.cover_url.trim() || null,
    year: form.year ? Number(form.year) : null,
    role: form.role.trim(),
    stack: form.stackText
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean),
    results: form.resultsText
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean),
    client_name: form.client_name.trim(),
    github_url: form.github_url.trim() || null,
    live_url: form.live_url.trim() || null,
    status: form.status,
    category_id: form.category_id ? Number(form.category_id) : null,
    category_label: form.category_label.trim(),
    sort_order: Number(form.sort_order || 0),
    is_featured: form.is_featured,
    is_published: form.is_published,
    is_draft: form.is_draft,
  };
}

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    setError("");
    try {
      const [items, cats] = await Promise.all([getAdminProjects(), getAdminCategories()]);
      setProjects(items);
      setCategories(cats);
    } catch {
      setError("Не удалось загрузить проекты");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const heading = useMemo(() => {
    if (mode === "create") return "Новый проект";
    if (mode === "edit") return "Редактирование";
    return "Проекты";
  }, [mode]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  }

  function openEdit(project: AdminProject) {
    setMode("edit");
    setEditingId(project.id);
    setForm(projectToForm(project));
    setError("");
  }

  function closeForm() {
    setMode("list");
    setEditingId(null);
    setForm(emptyForm());
  }

  function patchForm<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onUploadCover(fileList: FileList | null) {
    const file = fileList?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const uploaded = await uploadAdminImage(file);
      patchForm("cover_url", uploaded.url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось загрузить фото");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Укажите название проекта");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = formToPayload(form);
      if (mode === "create") {
        await createAdminProject(payload);
      } else if (editingId != null) {
        await updateAdminProject(editingId, payload);
      }
      await load();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function toggle(
    project: AdminProject,
    key: "is_featured" | "is_published" | "is_draft",
  ) {
    const updated = await updateProjectFlags(project.id, { [key]: !project[key] });
    setProjects((prev) => prev.map((item) => (item.id === project.id ? updated : item)));
  }

  async function onDelete(project: AdminProject) {
    if (!confirm(`Удалить проект «${project.title}»?`)) return;
    await deleteAdminProject(project.id);
    setProjects((prev) => prev.filter((item) => item.id !== project.id));
    if (editingId === project.id) closeForm();
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Catalog</p>
          <h1>{heading}</h1>
        </div>
        {mode === "list" ? (
          <button type="button" className="admin-primary-btn" onClick={openCreate}>
            + Новый проект
          </button>
        ) : (
          <button type="button" className="admin-ghost-btn" onClick={closeForm}>
            ← К списку
          </button>
        )}
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      {mode !== "list" ? (
        <section className="admin-panel admin-form-panel">
          <form className="admin-form" onSubmit={onSubmit}>
            <div className="admin-form__grid">
              <label className="admin-form__full">
                <span>Название *</span>
                <input
                  value={form.title}
                  onChange={(e) => patchForm("title", e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Slug</span>
                <input
                  value={form.slug}
                  onChange={(e) => patchForm("slug", e.target.value)}
                  placeholder="auto from title"
                />
              </label>

              <label>
                <span>Год</span>
                <input
                  type="number"
                  value={form.year}
                  onChange={(e) => patchForm("year", e.target.value)}
                />
              </label>

              <label>
                <span>Категория (список)</span>
                <select
                  value={form.category_id}
                  onChange={(e) => patchForm("category_id", e.target.value)}
                >
                  <option value="">Без категории</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span>Подпись категории на сайте</span>
                <input
                  value={form.category_label}
                  onChange={(e) => patchForm("category_label", e.target.value)}
                  placeholder="Backend / CRM integration"
                />
              </label>

              <label>
                <span>Статус</span>
                <select value={form.status} onChange={(e) => patchForm("status", e.target.value)}>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
              </label>

              <label className="admin-form__full">
                <span>Роль</span>
                <input value={form.role} onChange={(e) => patchForm("role", e.target.value)} />
              </label>

              <label className="admin-form__full">
                <span>Краткое описание</span>
                <textarea
                  rows={3}
                  value={form.summary}
                  onChange={(e) => patchForm("summary", e.target.value)}
                />
              </label>

              <label className="admin-form__full">
                <span>Стек (через запятую)</span>
                <input
                  value={form.stackText}
                  onChange={(e) => patchForm("stackText", e.target.value)}
                  placeholder="Python, FastAPI, PostgreSQL"
                />
              </label>

              <label className="admin-form__full">
                <span>Результаты (по одному на строку)</span>
                <textarea
                  rows={4}
                  value={form.resultsText}
                  onChange={(e) => patchForm("resultsText", e.target.value)}
                  placeholder={"57+ млн ₽ оборота\n190 активных клиентов"}
                />
              </label>

              <label>
                <span>GitHub</span>
                <input
                  value={form.github_url}
                  onChange={(e) => patchForm("github_url", e.target.value)}
                  placeholder="https://github.com/..."
                />
              </label>

              <label>
                <span>Live URL</span>
                <input
                  value={form.live_url}
                  onChange={(e) => patchForm("live_url", e.target.value)}
                  placeholder="https://..."
                />
              </label>

              <div className="admin-form__full admin-cover">
                <span className="admin-cover__label">Обложка проекта</span>
                <div className="admin-cover__row">
                  <div className="admin-cover__preview">
                    {form.cover_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={form.cover_url} alt="Cover preview" />
                    ) : (
                      <span>Нет фото</span>
                    )}
                  </div>
                  <div className="admin-cover__controls">
                    <label className="admin-primary-btn admin-cover__upload">
                      {uploading ? "Загрузка…" : "Загрузить фото"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        hidden
                        disabled={uploading || saving}
                        onChange={(e) => {
                          void onUploadCover(e.target.files);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                    {form.cover_url ? (
                      <button
                        type="button"
                        className="admin-danger-btn"
                        onClick={() => patchForm("cover_url", "")}
                      >
                        Убрать
                      </button>
                    ) : null}
                    <p className="admin-cover__hint">JPG / PNG / WEBP / GIF · до 8 МБ</p>
                    <label className="admin-cover__path">
                      <span>Или путь вручную</span>
                      <input
                        value={form.cover_url}
                        onChange={(e) => patchForm("cover_url", e.target.value)}
                        placeholder="/uploads/projects/cover.jpg"
                      />
                    </label>
                  </div>
                </div>
              </div>

              <label>
                <span>Клиент</span>
                <input
                  value={form.client_name}
                  onChange={(e) => patchForm("client_name", e.target.value)}
                />
              </label>

              <label>
                <span>Sort order</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => patchForm("sort_order", e.target.value)}
                />
              </label>
            </div>

            <div className="admin-form__checks">
              <label>
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => patchForm("is_featured", e.target.checked)}
                />
                Featured
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.is_published}
                  onChange={(e) => patchForm("is_published", e.target.checked)}
                />
                Published
              </label>
              <label>
                <input
                  type="checkbox"
                  checked={form.is_draft}
                  onChange={(e) => patchForm("is_draft", e.target.checked)}
                />
                Draft
              </label>
            </div>

            <div className="admin-form__actions">
              <button type="submit" className="admin-primary-btn" disabled={saving}>
                {saving ? "Сохранение…" : mode === "create" ? "Создать" : "Сохранить"}
              </button>
              <button type="button" className="admin-ghost-btn" onClick={closeForm}>
                Отмена
              </button>
            </div>
          </form>
        </section>
      ) : (
        <section className="admin-panel">
          {loading ? (
            <p className="admin-empty">Загрузка…</p>
          ) : projects.length === 0 ? (
            <p className="admin-empty">Проектов пока нет. Создайте первый.</p>
          ) : (
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Проект</th>
                    <th>Категория</th>
                    <th>Год</th>
                    <th>Featured</th>
                    <th>Published</th>
                    <th>Draft</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {projects.map((project) => (
                    <tr key={project.id}>
                      <td>
                        <p className="admin-project-title">{project.title}</p>
                        <p className="admin-project-slug">{project.slug}</p>
                      </td>
                      <td>{project.category_name || "—"}</td>
                      <td>{project.year ?? "—"}</td>
                      <td>
                        <button
                          type="button"
                          className={`admin-toggle ${project.is_featured ? "is-on" : ""}`}
                          onClick={() => void toggle(project, "is_featured")}
                        >
                          {project.is_featured ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`admin-toggle ${project.is_published ? "is-on" : ""}`}
                          onClick={() => void toggle(project, "is_published")}
                        >
                          {project.is_published ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <button
                          type="button"
                          className={`admin-toggle ${project.is_draft ? "is-on" : ""}`}
                          onClick={() => void toggle(project, "is_draft")}
                        >
                          {project.is_draft ? "On" : "Off"}
                        </button>
                      </td>
                      <td>
                        <div className="admin-row-actions">
                          <button
                            type="button"
                            className="admin-ghost-btn"
                            onClick={() => openEdit(project)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="admin-danger-btn"
                            onClick={() => void onDelete(project)}
                          >
                            Del
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
