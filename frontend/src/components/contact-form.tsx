"use client";

import { useState, type FormEvent } from "react";
import { useLocale } from "@/i18n/locale-provider";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function ContactForm() {
  const { t } = useLocale();
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    const form = event.currentTarget;
    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") ?? ""),
      contact: String(formData.get("contact") ?? ""),
      company: String(formData.get("company") ?? ""),
      project_type: String(formData.get("project_type") ?? ""),
      description: String(formData.get("description") ?? ""),
      budget: String(formData.get("budget") ?? ""),
      timeline: String(formData.get("timeline") ?? ""),
    };

    try {
      const response = await fetch(`${API_URL}/api/leads`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      setStatus("success");
      setMessage(t.contact.success);
      form.reset();
    } catch {
      setStatus("error");
      setMessage(t.contact.error);
    }
  }

  return (
    <form onSubmit={onSubmit} className="border border-line bg-bg/50 p-6 md:p-8 dark:bg-surface/40">
      <div className="grid gap-5">
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.12em] text-mute">{t.contact.name} *</span>
          <input
            required
            name="name"
            className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.12em] text-mute">{t.contact.contactField} *</span>
          <input
            required
            name="contact"
            placeholder={t.contact.contactPlaceholder}
            className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.12em] text-mute">{t.contact.company}</span>
          <input
            name="company"
            className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.12em] text-mute">{t.contact.projectType}</span>
          <input
            name="project_type"
            placeholder={t.contact.projectTypePlaceholder}
            className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
          />
        </label>
        <label className="grid gap-2 text-sm">
          <span className="uppercase tracking-[0.12em] text-mute">{t.contact.description} *</span>
          <textarea
            required
            name="description"
            rows={5}
            className="border border-line bg-transparent px-3 py-3 outline-none focus:border-accent"
          />
        </label>
        <div className="grid gap-5 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="uppercase tracking-[0.12em] text-mute">{t.contact.budget}</span>
            <input
              name="budget"
              placeholder={t.contact.budgetPlaceholder}
              className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
            />
          </label>
          <label className="grid gap-2 text-sm">
            <span className="uppercase tracking-[0.12em] text-mute">{t.contact.timeline}</span>
            <input
              name="timeline"
              className="min-h-12 border border-line bg-transparent px-3 outline-none focus:border-accent"
            />
          </label>
        </div>
      </div>

      <button type="submit" className="btn-primary mt-8" disabled={status === "loading"}>
        {status === "loading" ? t.contact.submitting : t.contact.submit}
      </button>

      {message ? (
        <p className={`mt-4 text-sm ${status === "error" ? "text-accent" : "text-mute"}`}>{message}</p>
      ) : null}
    </form>
  );
}
