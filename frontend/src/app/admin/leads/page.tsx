"use client";

import { useEffect, useMemo, useState } from "react";
import {
  deleteLead,
  getAdminLeads,
  updateAdminLead,
  type AdminLead,
} from "@/lib/admin-api";

const FILTERS = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Готово" },
  { value: "archived", label: "Архив" },
];

const STATUS_OPTIONS = [
  { value: "new", label: "Новая" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Готово" },
  { value: "archived", label: "Архив" },
] as const;

const PRIORITY_OPTIONS = [
  { value: "hot", label: "Hot" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Low" },
] as const;

function contactHref(contact: string): string | null {
  const value = contact.trim();
  if (!value) return null;
  if (value.includes("@") && !value.startsWith("@") && value.includes(".")) {
    return `mailto:${value}`;
  }
  const tg = value.replace(/^https?:\/\/t\.me\//i, "").replace(/^@/, "");
  if (value.startsWith("@") || value.toLowerCase().includes("t.me/") || /^[a-zA-Z0-9_]{4,}$/.test(tg)) {
    return `https://t.me/${tg}`;
  }
  if (/^\+?\d[\d\s()-]{6,}$/.test(value)) {
    return `tel:${value.replace(/[^\d+]/g, "")}`;
  }
  return null;
}

function formatWhen(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("ru-RU", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [filter, setFilter] = useState("");
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [notesDraft, setNotesDraft] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  async function load(status = filter) {
    setLoading(true);
    setError("");
    try {
      const items = await getAdminLeads(status || undefined);
      setLeads(items);
      setSelectedId((prev) => {
        if (prev && items.some((item) => item.id === prev)) return prev;
        return items[0]?.id ?? null;
      });
    } catch {
      setError("Не удалось загрузить заявки");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const timer = window.setInterval(() => {
      void getAdminLeads(filter || undefined)
        .then((items) => setLeads(items))
        .catch(() => undefined);
    }, 20000);
    return () => window.clearInterval(timer);
  }, [filter]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return leads;
    return leads.filter((lead) =>
      [lead.name, lead.contact, lead.company, lead.project_type, lead.description, lead.notes]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [leads, query]);

  const selected = filtered.find((lead) => lead.id === selectedId) ?? null;

  useEffect(() => {
    setNotesDraft(selected?.notes ?? "");
  }, [selected?.id, selected?.notes]);

  useEffect(() => {
    if (!selected || selected.is_seen) return;
    void updateAdminLead(selected.id, { is_seen: true })
      .then((updated) => {
        setLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
      })
      .catch(() => undefined);
  }, [selected?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function patchSelected(
    payload: Partial<Pick<AdminLead, "status" | "notes" | "priority" | "is_seen">>,
  ) {
    if (!selected) return;
    setSaving(true);
    try {
      const updated = await updateAdminLead(selected.id, payload);
      setLeads((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
    } catch {
      setError("Не удалось сохранить изменения");
    } finally {
      setSaving(false);
    }
  }

  async function onDeleteSelected() {
    if (!selected) return;
    if (!confirm(`Удалить заявку от «${selected.name}»?`)) return;
    await deleteLead(selected.id);
    setLeads((prev) => {
      const next = prev.filter((item) => item.id !== selected.id);
      setSelectedId(next[0]?.id ?? null);
      return next;
    });
  }

  async function copyContact() {
    if (!selected) return;
    await navigator.clipboard.writeText(selected.contact);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  }

  const href = selected ? contactHref(selected.contact) : null;
  const unread = leads.filter((lead) => !lead.is_seen || lead.status === "new").length;

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Command Center</p>
          <h1>Заявки</h1>
          <p className="admin-muted" style={{ marginTop: "0.35rem" }}>
            {unread ? `${unread} требуют внимания` : "Inbox чистый"}
            {saving ? " · сохраняю…" : ""}
          </p>
        </div>
        <div className="admin-filters">
          {FILTERS.map((item) => (
            <button
              key={item.value || "all"}
              type="button"
              className={`admin-chip ${filter === item.value ? "is-active" : ""}`}
              onClick={() => setFilter(item.value)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <div className="admin-inbox">
        <aside className="admin-inbox__list">
          <label className="admin-inbox__search">
            <span className="sr-only">Поиск</span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Поиск по имени, контакту, заметкам…"
            />
          </label>

          {loading ? (
            <p className="admin-empty">Загрузка…</p>
          ) : filtered.length === 0 ? (
            <p className="admin-empty">Заявок нет.</p>
          ) : (
            <div className="admin-inbox__items">
              {filtered.map((lead) => {
                const active = lead.id === selectedId;
                return (
                  <button
                    key={lead.id}
                    type="button"
                    className={`admin-inbox__item ${active ? "is-active" : ""} ${
                      !lead.is_seen ? "is-unseen" : ""
                    }`}
                    onClick={() => setSelectedId(lead.id)}
                  >
                    <span className={`admin-inbox__prio is-${lead.priority || "normal"}`} />
                    <span className="admin-inbox__item-main">
                      <span className="admin-inbox__item-top">
                        <strong>{lead.name}</strong>
                        <span>{formatWhen(lead.created_at)}</span>
                      </span>
                      <span className="admin-inbox__item-meta">
                        {lead.contact}
                        {lead.company ? ` · ${lead.company}` : ""}
                      </span>
                      <span className="admin-inbox__item-bottom">
                        <span className={`admin-badge status-${lead.status}`}>{lead.status}</span>
                        <span>{lead.project_type || "Без типа"}</span>
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </aside>

        <section className="admin-inbox__detail admin-panel">
          {!selected ? (
            <p className="admin-empty">Выберите заявку слева.</p>
          ) : (
            <>
              <div className="admin-inbox__detail-head">
                <div>
                  <p className="admin-kicker">Lead #{selected.id}</p>
                  <h2>{selected.name}</h2>
                  <p className="admin-muted">{formatWhen(selected.created_at)}</p>
                </div>
                <div className="admin-inbox__detail-actions">
                  <button type="button" className="admin-ghost-btn" onClick={() => void copyContact()}>
                    {copied ? "Скопировано" : "Копировать контакт"}
                  </button>
                  {href ? (
                    <a className="admin-primary-btn" href={href} target="_blank" rel="noreferrer">
                      Написать
                    </a>
                  ) : null}
                  <button
                    type="button"
                    className="admin-danger-btn"
                    onClick={() => void onDeleteSelected()}
                  >
                    Удалить
                  </button>
                </div>
              </div>

              <div className="admin-inbox__grid">
                <article>
                  <p className="admin-inbox__label">Контакт</p>
                  <p>{selected.contact}</p>
                </article>
                <article>
                  <p className="admin-inbox__label">Компания</p>
                  <p>{selected.company || "—"}</p>
                </article>
                <article>
                  <p className="admin-inbox__label">Тип</p>
                  <p>{selected.project_type || "—"}</p>
                </article>
                <article>
                  <p className="admin-inbox__label">Бюджет</p>
                  <p>{selected.budget || "—"}</p>
                </article>
                <article>
                  <p className="admin-inbox__label">Сроки</p>
                  <p>{selected.timeline || "—"}</p>
                </article>
                <article className="admin-inbox__full">
                  <p className="admin-inbox__label">Описание</p>
                  <p className="admin-inbox__desc">{selected.description || "Без описания"}</p>
                </article>
              </div>

              <div className="admin-inbox__controls">
                <label>
                  <span>Статус</span>
                  <select
                    value={selected.status}
                    onChange={(e) => void patchSelected({ status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>
                        {status.label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <span>Приоритет</span>
                  <select
                    value={selected.priority || "normal"}
                    onChange={(e) =>
                      void patchSelected({
                        priority: e.target.value as AdminLead["priority"],
                      })
                    }
                  >
                    {PRIORITY_OPTIONS.map((priority) => (
                      <option key={priority.value} value={priority.value}>
                        {priority.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              <label className="admin-inbox__notes">
                <span>Заметки по заявке</span>
                <textarea
                  rows={7}
                  value={notesDraft}
                  onChange={(e) => setNotesDraft(e.target.value)}
                  onBlur={() => {
                    if (notesDraft !== (selected.notes || "")) {
                      void patchSelected({ notes: notesDraft });
                    }
                  }}
                  placeholder="Договорились созвониться в пятницу, бюджет гибкий…"
                />
              </label>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
