"use client";

import { FormEvent, useState } from "react";
import { changeAdminPassword } from "@/lib/admin-api";

export default function AdminPasswordPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");
    setOk("");

    if (newPassword.length < 6) {
      setError("Новый пароль — минимум 6 символов");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Подтверждение не совпадает");
      return;
    }

    setSaving(true);
    try {
      await changeAdminPassword(currentPassword, newPassword);
      setOk("Пароль обновлён. В .env он больше не перезаписывается при старте API.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Не удалось сменить пароль");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="admin-page">
      <div className="admin-page__head">
        <div>
          <p className="admin-kicker">Security</p>
          <h1>Смена пароля</h1>
        </div>
      </div>

      {error ? <p className="admin-error">{error}</p> : null}
      {ok ? <p className="admin-ok">{ok}</p> : null}

      <section className="admin-panel admin-form-panel" style={{ maxWidth: 480 }}>
        <form className="admin-form" onSubmit={onSubmit}>
          <div className="admin-form__grid">
            <label className="admin-form__full">
              <span>Текущий пароль</span>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </label>
            <label className="admin-form__full">
              <span>Новый пароль</span>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
            <label className="admin-form__full">
              <span>Повторите новый пароль</span>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
            </label>
          </div>
          <div className="admin-form__actions">
            <button type="submit" className="admin-primary-btn" disabled={saving}>
              {saving ? "Сохраняю…" : "Сменить пароль"}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
