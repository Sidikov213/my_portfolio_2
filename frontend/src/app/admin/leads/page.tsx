"use client";

import { useEffect, useState } from "react";
import {
  deleteLead,
  getAdminLeads,
  updateLeadStatus,
  type AdminLead,
} from "@/lib/admin-api";

const STATUSES = [
  { value: "", label: "Все" },
  { value: "new", label: "Новые" },
  { value: "in_progress", label: "В работе" },
  { value: "done", label: "Готово" },
  { value: "archived", label: "Архив" },
];

const STATUS_OPTIONS = ["new", "in_progress", "done", "archived"] as const;

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<AdminLead[]>([]);
  const [filter, setFilter] = useState("");
  const [expanded, setExpanded] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  async function load(status = filter) {
    setLoading(true);
    setError("");
    try {
      setLeads(await getAdminLeads(status || undefined));
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

  async function onStatus(id: number, status: string) {
    const updated = await updateLeadStatus(id, status);
    setLeads((prev) => prev.map((lead) => (lead.id === id ? updated : lead)));
  }

  async function onDelete(id: number) {
    if (!confirm("Удалить заявку?")) return;
    await deleteLead(id);
    setLeads((prev) => prev.filter((lead) => lead.id !== id));
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Inbox</p>
          <h1>Заявки</h1>
        </div>
        <div className="admin-filters">
          {STATUSES.map((item) => (
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

      <section className="admin-panel">
        {loading ? (
          <p className="admin-empty">Загрузка…</p>
        ) : leads.length === 0 ? (
          <p className="admin-empty">Заявок нет.</p>
        ) : (
          <div className="admin-lead-list">
            {leads.map((lead) => {
              const open = expanded === lead.id;
              return (
                <article key={lead.id} className={`admin-lead ${open ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="admin-lead__row"
                    onClick={() => setExpanded(open ? null : lead.id)}
                  >
                    <div>
                      <p className="admin-lead__name">{lead.name}</p>
                      <p className="admin-lead__meta">
                        {lead.contact}
                        {lead.company ? ` · ${lead.company}` : ""}
                      </p>
                    </div>
                    <div className="admin-lead__right">
                      <span className={`admin-badge status-${lead.status}`}>{lead.status}</span>
                      <span className="admin-lead__date">
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString("ru-RU")
                          : "—"}
                      </span>
                    </div>
                  </button>

                  {open ? (
                    <div className="admin-lead__body">
                      <p>
                        <strong>Тип:</strong> {lead.project_type || "—"}
                      </p>
                      <p>
                        <strong>Бюджет:</strong> {lead.budget || "—"}
                      </p>
                      <p>
                        <strong>Сроки:</strong> {lead.timeline || "—"}
                      </p>
                      <p className="admin-lead__desc">{lead.description || "Без описания"}</p>

                      <div className="admin-lead__actions">
                        <label>
                          Статус
                          <select
                            value={lead.status}
                            onChange={(e) => void onStatus(lead.id, e.target.value)}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <option key={status} value={status}>
                                {status}
                              </option>
                            ))}
                          </select>
                        </label>
                        <button
                          type="button"
                          className="admin-danger-btn"
                          onClick={() => void onDelete(lead.id)}
                        >
                          Удалить
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
