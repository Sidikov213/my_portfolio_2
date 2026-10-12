"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createAdminService,
  deleteAdminService,
  getAdminServices,
  updateAdminService,
  updateServiceFlags,
  type AdminService,
  type ServiceWritePayload,
} from "@/lib/admin-api";

type FormState = {
  title: string;
  slug: string;
  short_description: string;
  scope: string;
  stages: string;
  timeline: string;
  price_from: string;
  sort_order: string;
  is_published: boolean;
};

const emptyForm = (): FormState => ({
  title: "",
  slug: "",
  short_description: "",
  scope: "",
  stages: "",
  timeline: "",
  price_from: "",
  sort_order: "0",
  is_published: true,
});

function serviceToForm(service: AdminService): FormState {
  return {
    title: service.title,
    slug: service.slug,
    short_description: service.short_description,
    scope: service.scope,
    stages: service.stages,
    timeline: service.timeline,
    price_from: service.price_from,
    sort_order: String(service.sort_order ?? 0),
    is_published: service.is_published,
  };
}

function formToPayload(form: FormState): ServiceWritePayload {
  return {
    title: form.title.trim(),
    slug: form.slug.trim() || null,
    short_description: form.short_description.trim(),
    scope: form.scope.trim(),
    stages: form.stages.trim(),
    timeline: form.timeline.trim(),
    price_from: form.price_from.trim(),
    sort_order: Number(form.sort_order || 0),
    is_published: form.is_published,
  };
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mode, setMode] = useState<"list" | "create" | "edit">("list");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);

  async function load() {
    setLoading(true);
    setError("");
    try {
      setServices(await getAdminServices());
    } catch {
      setError("Не удалось загрузить услуги");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const heading = useMemo(() => {
    if (mode === "create") return "Новая услуга";
    if (mode === "edit") return "Редактирование";
    return "Услуги";
  }, [mode]);

  function openCreate() {
    setMode("create");
    setEditingId(null);
    setForm(emptyForm());
    setError("");
  }

  function openEdit(service: AdminService) {
    setMode("edit");
    setEditingId(service.id);
    setForm(serviceToForm(service));
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

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form.title.trim()) {
      setError("Укажите название услуги");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = formToPayload(form);
      if (mode === "create") {
        await createAdminService(payload);
      } else if (editingId != null) {
        await updateAdminService(editingId, payload);
      }
      await load();
      closeForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  async function togglePublished(service: AdminService) {
    const updated = await updateServiceFlags(service.id, {
      is_published: !service.is_published,
    });
    setServices((prev) => prev.map((item) => (item.id === service.id ? updated : item)));
  }

  async function onDelete(service: AdminService) {
    if (!confirm(`Удалить услугу «${service.title}»?`)) return;
    await deleteAdminService(service.id);
    setServices((prev) => prev.filter((item) => item.id !== service.id));
    if (editingId === service.id) closeForm();
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Offer</p>
          <h1>{heading}</h1>
        </div>
        {mode === "list" ? (
          <button type="button" className="admin-primary-btn" onClick={openCreate}>
            + Новая услуга
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
                <span>Порядок</span>
                <input
                  type="number"
                  value={form.sort_order}
                  onChange={(e) => patchForm("sort_order", e.target.value)}
                />
              </label>

              <label className="admin-form__full">
                <span>Краткое описание</span>
                <textarea
                  rows={3}
                  value={form.short_description}
                  onChange={(e) => patchForm("short_description", e.target.value)}
                />
              </label>

              <label>
                <span>Цена от</span>
                <input
                  value={form.price_from}
                  onChange={(e) => patchForm("price_from", e.target.value)}
                  placeholder="По запросу"
                />
              </label>

              <label>
                <span>Сроки</span>
                <input
                  value={form.timeline}
                  onChange={(e) => patchForm("timeline", e.target.value)}
                  placeholder="После оценки задачи"
                />
              </label>

              <label className="admin-form__full">
                <span>Scope</span>
                <textarea
                  rows={3}
                  value={form.scope}
                  onChange={(e) => patchForm("scope", e.target.value)}
                />
              </label>

              <label className="admin-form__full">
                <span>Этапы</span>
                <textarea
                  rows={3}
                  value={form.stages}
                  onChange={(e) => patchForm("stages", e.target.value)}
                />
              </label>

              <div className="admin-form__checks">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_published}
                    onChange={(e) => patchForm("is_published", e.target.checked)}
                  />
                  Опубликовано на сайте
                </label>
              </div>
            </div>

            <div className="admin-form__actions">
              <button type="submit" className="admin-primary-btn" disabled={saving}>
                {saving ? "Сохраняю…" : "Сохранить"}
              </button>
            </div>
          </form>
        </section>
      ) : loading ? (
        <p className="admin-muted">Загрузка…</p>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Услуга</th>
                <th>Цена</th>
                <th>Сроки</th>
                <th>Статус</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {services.map((service) => (
                <tr key={service.id}>
                  <td>
                    <strong>{service.title}</strong>
                    <div className="admin-muted">{service.short_description}</div>
                  </td>
                  <td>{service.price_from || "—"}</td>
                  <td>{service.timeline || "—"}</td>
                  <td>
                    <button
                      type="button"
                      className={`admin-chip ${service.is_published ? "is-on" : ""}`}
                      onClick={() => void togglePublished(service)}
                    >
                      {service.is_published ? "Опубликовано" : "Скрыто"}
                    </button>
                  </td>
                  <td className="admin-table__actions">
                    <button type="button" className="admin-ghost-btn" onClick={() => openEdit(service)}>
                      Править
                    </button>
                    <button
                      type="button"
                      className="admin-ghost-btn"
                      onClick={() => void onDelete(service)}
                    >
                      Удалить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {services.length === 0 ? <p className="admin-muted">Пока нет услуг</p> : null}
        </div>
      )}
    </div>
  );
}
