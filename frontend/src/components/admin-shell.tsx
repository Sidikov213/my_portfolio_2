"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import {
  clearAdminToken,
  getAdminMe,
  getAdminToken,
  type AdminUser,
} from "@/lib/admin-api";

type AdminAuthContextValue = {
  user: AdminUser | null;
  loading: boolean;
  logout: () => void;
  refresh: () => Promise<void>;
};

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null);

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used within AdminAuthProvider");
  return ctx;
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();
  const isLogin = pathname === "/admin/login";

  async function refresh() {
    if (!getAdminToken()) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const me = await getAdminMe();
      setUser(me);
    } catch {
      setUser(null);
      clearAdminToken();
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (loading) return;
    if (!user && !isLogin) router.replace("/admin/login");
    if (user && isLogin) router.replace("/admin");
  }, [user, loading, isLogin, router]);

  function logout() {
    clearAdminToken();
    setUser(null);
    router.replace("/admin/login");
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, logout, refresh }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

const NAV = [
  { href: "/admin", label: "Обзор", exact: true },
  { href: "/admin/leads", label: "Заявки" },
  { href: "/admin/projects", label: "Проекты" },
  { href: "/admin/services", label: "Услуги" },
  { href: "/admin/profile", label: "Профиль" },
  { href: "/admin/password", label: "Пароль" },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const { user, loading, logout } = useAdminAuth();
  const pathname = usePathname();
  const isLogin = pathname === "/admin/login";

  if (isLogin) {
    return <>{children}</>;
  }

  if (loading || !user) {
    return (
      <div className="admin-boot">
        <div className="admin-boot__mark">SS</div>
        <p>Открываю панель…</p>
      </div>
    );
  }

  const section =
    NAV.find((item) => (item.exact ? pathname === item.href : pathname.startsWith(item.href)))
      ?.label ?? "Admin";

  return (
    <div className="admin-shell">
      <aside className="admin-side">
        <div className="admin-side__brand">
          <span className="admin-side__sigil" aria-hidden>
            SS
          </span>
          <div>
            <p className="admin-side__title">Studio Desk</p>
            <p className="admin-side__sub">Sodirkhon Sidikov</p>
          </div>
        </div>

        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item, index) => {
            const active = item.exact ? pathname === item.href : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`admin-nav__link ${active ? "is-active" : ""}`}
              >
                <span className="admin-nav__index">0{index + 1}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="admin-side__foot">
          <p className="admin-side__email">{user.email}</p>
          <div className="admin-side__actions">
            <Link href="/" className="admin-ghost-btn">
              На сайт
            </Link>
            <button type="button" className="admin-ghost-btn" onClick={logout}>
              Выйти
            </button>
          </div>
        </div>
      </aside>

      <div className="admin-main">
        <header className="admin-top">
          <div>
            <p className="admin-top__label">Админка</p>
            <p className="admin-top__section">{section}</p>
          </div>
          <Link href="/" className="admin-top__site">
            Открыть портфолио →
          </Link>
        </header>
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
