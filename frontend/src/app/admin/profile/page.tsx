"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  getAdminProfile,
  updateAdminProfile,
  type AdminProfile,
  type ProfileWritePayload,
} from "@/lib/admin-api";

type FormState = {
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
  resume_url: string;
};

function toForm(profile: AdminProfile): FormState {
  return {
    full_name: profile.full_name ?? "",
    profession: profile.profession ?? "",
    specialization: profile.specialization ?? "",
    slogan: profile.slogan ?? "",
    bio: profile.bio ?? "",
    city: profile.city ?? "",
    timezone: profile.timezone ?? "",
    email: profile.email ?? "",
    phone: profile.phone ?? "",
    telegram: profile.telegram ?? "",
    github: profile.github ?? "",
    linkedin: profile.linkedin ?? "",
    behance: profile.behance ?? "",
    dribbble: profile.dribbble ?? "",
    availability_status: profile.availability_status ?? "",
    is_available: profile.is_available,
    resume_url: profile.resume_url ?? "",
  };
}

function toPayload(form: FormState): ProfileWritePayload {
  return {
    full_name: form.full_name.trim(),
    profession: form.profession.trim(),
    specialization: form.specialization.trim(),
    slogan: form.slogan.trim(),
    bio: form.bio.trim(),
    city: form.city.trim(),
    timezone: form.timezone.trim(),
    email: form.email.trim(),
    phone: form.phone.trim(),
    telegram: form.telegram.trim(),
    github: form.github.trim(),
    linkedin: form.linkedin.trim(),
    behance: form.behance.trim(),
    dribbble: form.dribbble.trim(),
    availability_status: form.availability_status.trim(),
    is_available: form.is_available,
    resume_url: form.resume_url.trim() || null,
  };
}

export default function AdminProfilePage() {
  const [form, setForm] = useState<FormState | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  useEffect(() => {
    void (async () => {
      setLoading(true);
      try {
        const profile = await getAdminProfile();
        setForm(toForm(profile));
      } catch {
        setError("Не удалось загрузить профиль");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function patch<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => (prev ? { ...prev, [key]: value } : prev));
  }

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    if (!form) return;
    if (!form.full_name.trim()) {
      setError("Укажите имя");
      return;
    }
    setSaving(true);
    setError("");
    setOk("");
    try {
      const updated = await updateAdminProfile(toPayload(form));
      setForm(toForm(updated));
      setOk("Профиль сохранён и синхронизирован с сайтом");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сохранить");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Identity</p>
          <h1>Профиль</h1>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {ok ? <p className="admin-ok">{ok}</p> : null}

      {loading ? (
        <p className="admin-muted">Загрузка…</p>
      ) : !form ? (
        <p className="admin-muted">Профиль недоступен. Проверьте, что API запущен.</p>
      ) : (
        <section className="admin-panel admin-form-panel">
          <form className="admin-form" onSubmit={onSubmit}>
            <div className="admin-form__grid">
              <label className="admin-form__full">
                <span>Имя *</span>
                <input
                  value={form.full_name}
                  onChange={(e) => patch("full_name", e.target.value)}
                  required
                />
              </label>

              <label>
                <span>Профессия</span>
                <input
                  value={form.profession}
                  onChange={(e) => patch("profession", e.target.value)}
                />
              </label>

              <label>
                <span>Специализация</span>
                <input
                  value={form.specialization}
                  onChange={(e) => patch("specialization", e.target.value)}
                />
              </label>

              <label className="admin-form__full">
                <span>Слоган</span>
                <input value={form.slogan} onChange={(e) => patch("slogan", e.target.value)} />
              </label>

              <label className="admin-form__full">
                <span>Короткое био</span>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) => patch("bio", e.target.value)}
                />
              </label>

              <label>
                <span>Город</span>
                <input value={form.city} onChange={(e) => patch("city", e.target.value)} />
              </label>

              <label>
                <span>Timezone</span>
                <input
                  value={form.timezone}
                  onChange={(e) => patch("timezone", e.target.value)}
                  placeholder="Europe/Moscow"
                />
              </label>

              <label>
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => patch("email", e.target.value)}
                />
              </label>

              <label>
                <span>Телефон</span>
                <input value={form.phone} onChange={(e) => patch("phone", e.target.value)} />
              </label>

              <label>
                <span>Telegram</span>
                <input
                  value={form.telegram}
                  onChange={(e) => patch("telegram", e.target.value)}
                  placeholder="@username или https://t.me/..."
                />
              </label>

              <label>
                <span>GitHub</span>
                <input value={form.github} onChange={(e) => patch("github", e.target.value)} />
              </label>

              <label>
                <span>LinkedIn</span>
                <input
                  value={form.linkedin}
                  onChange={(e) => patch("linkedin", e.target.value)}
                />
              </label>

              <label>
                <span>Behance</span>
                <input value={form.behance} onChange={(e) => patch("behance", e.target.value)} />
              </label>

              <label>
                <span>Dribbble</span>
                <input
                  value={form.dribbble}
                  onChange={(e) => patch("dribbble", e.target.value)}
                />
              </label>

              <label className="admin-form__full">
                <span>Статус доступности</span>
                <input
                  value={form.availability_status}
                  onChange={(e) => patch("availability_status", e.target.value)}
                />
              </label>

              <label>
                <span>Resume URL</span>
                <input
                  value={form.resume_url}
                  onChange={(e) => patch("resume_url", e.target.value)}
                  placeholder="/resume.pdf"
                />
              </label>

              <div className="admin-form__checks">
                <label>
                  <input
                    type="checkbox"
                    checked={form.is_available}
                    onChange={(e) => patch("is_available", e.target.checked)}
                  />
                  Открыт к проектам
                </label>
              </div>
            </div>

            <div className="admin-form__actions">
              <button type="submit" className="admin-primary-btn" disabled={saving}>
                {saving ? "Сохраняю…" : "Сохранить профиль"}
              </button>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
