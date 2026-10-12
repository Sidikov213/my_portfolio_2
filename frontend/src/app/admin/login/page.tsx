"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { adminLogin } from "@/lib/admin-api";
import { useAdminAuth } from "@/components/admin-shell";

export default function AdminLoginPage() {
  const router = useRouter();
  const { refresh } = useAdminAuth();
  const [email, setEmail] = useState("admin@example.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");
    try {
      await adminLogin(email, password);
      await refresh();
      router.replace("/admin");
    } catch {
      setError("Неверный email или пароль");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="admin-login">
      <div className="admin-login__panel">
        <div className="admin-login__brand">
          <span className="admin-login__sigil" aria-hidden>
            SS
          </span>
          <div>
            <p className="admin-login__eyebrow">Studio Desk</p>
            <h1>Вход в админку</h1>
            <p className="admin-login__lead">Заявки, проекты и обложки — в одном месте.</p>
          </div>
        </div>

        <form onSubmit={onSubmit} className="admin-login__form">
          <label>
            <span>Email</span>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              required
            />
          </label>
          <label>
            <span>Пароль</span>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </label>
          {error ? <p className="admin-login__error">{error}</p> : null}
          <button type="submit" disabled={loading}>
            {loading ? "Вход…" : "Войти"}
          </button>
        </form>

        <div className="admin-login__footer">
          <p>
            Логин из <code>backend/.env</code>
          </p>
          <Link href="/">← На сайт</Link>
        </div>
      </div>
    </div>
  );
}
