"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  getAdminLeads,
  getAdminSiteSettings,
  getAdminStats,
  updateAdminSiteSettings,
  type AdminLead,
  type AdminStats,
  type HeroVisual,
} from "@/lib/admin-api";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recent, setRecent] = useState<AdminLead[]>([]);
  const [error, setError] = useState("");
  const [heroVisual, setHeroVisual] = useState<HeroVisual>("monogram");
  const [heroSaving, setHeroSaving] = useState(false);
  const [heroMsg, setHeroMsg] = useState("");

  useEffect(() => {
    Promise.all([getAdminStats(), getAdminLeads(), getAdminSiteSettings()])
      .then(([s, leads, site]) => {
        setStats(s);
        setRecent(leads.slice(0, 5));
        setHeroVisual(site.hero_visual === "snakes" ? "snakes" : "monogram");
      })
      .catch(() => setError("Не удалось загрузить данные. Запущен ли backend?"));
  }, []);

  async function setVisual(next: HeroVisual) {
    if (next === heroVisual || heroSaving) return;
    setHeroSaving(true);
    setHeroMsg("");
    try {
      const updated = await updateAdminSiteSettings(next);
      setHeroVisual(updated.hero_visual);
      setHeroMsg(
        next === "snakes"
          ? "На главной теперь S-змеи. Обновите вкладку сайта."
          : "На главной снова монограмма SS. Обновите вкладку сайта.",
      );
    } catch {
      setHeroMsg("Не удалось сохранить вариант Hero");
    } finally {
      setHeroSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Dashboard</p>
          <h1>Обзор</h1>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}

      <section className="admin-panel">
        <div className="admin-panel__head">
          <h2>Hero на главной</h2>
        </div>
        <p className="admin-muted" style={{ padding: "0 1.15rem 0.75rem" }}>
          Переключите правую графику Hero: классические буквы SS или фотореалистичные S-змеи.
        </p>
        <div className="admin-hero-switch" role="group" aria-label="Вариант Hero">
          <button
            type="button"
            className={`admin-hero-switch__btn ${heroVisual === "monogram" ? "is-active" : ""}`}
            disabled={heroSaving}
            onClick={() => void setVisual("monogram")}
          >
            <span className="admin-hero-switch__mark">SS</span>
            <span>Монограмма</span>
          </button>
          <button
            type="button"
            className={`admin-hero-switch__btn ${heroVisual === "snakes" ? "is-active" : ""}`}
            disabled={heroSaving}
            onClick={() => void setVisual("snakes")}
          >
            <span className="admin-hero-switch__mark">S·S</span>
            <span>Змеи</span>
          </button>
        </div>
        {heroMsg ? <p className="admin-ok">{heroMsg}</p> : null}
      </section>

      <div className="admin-stats">
        <article className="admin-stat">
          <p className="admin-stat__label">Новые заявки</p>
          <p className="admin-stat__value">{stats?.leads_new ?? "—"}</p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">В работе</p>
          <p className="admin-stat__value">{stats?.leads_in_progress ?? "—"}</p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">Всего заявок</p>
          <p className="admin-stat__value">{stats?.leads_total ?? "—"}</p>
        </article>
        <article className="admin-stat">
          <p className="admin-stat__label">Проекты live</p>
          <p className="admin-stat__value">{stats?.projects_published ?? "—"}</p>
        </article>
      </div>

      <section className="admin-panel">
        <div className="admin-panel__head">
          <h2>Последние заявки</h2>
          <Link href="/admin/leads" className="admin-text-link">
            Все заявки →
          </Link>
        </div>

        {recent.length === 0 ? (
          <p className="admin-empty">Пока нет заявок — они появятся из формы контактов.</p>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Имя</th>
                  <th>Контакт</th>
                  <th>Тип</th>
                  <th>Статус</th>
                </tr>
              </thead>
              <tbody>
                {recent.map((lead) => (
                  <tr key={lead.id}>
                    <td>{lead.name}</td>
                    <td>{lead.contact}</td>
                    <td>{lead.project_type || "—"}</td>
                    <td>
                      <span className={`admin-badge status-${lead.status}`}>{lead.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
