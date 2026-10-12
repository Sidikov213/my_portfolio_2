"use client";

import { ContactForm } from "@/components/contact-form";
import { useLocale } from "@/i18n/locale-provider";

export default function ContactPage() {
  const { content, t } = useLocale();
  const { contacts, profile } = content;

  return (
    <section className="pb-24 pt-28 md:pb-32 md:pt-32">
      <div className="page-container">
        <div className="grid items-start gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-14">
          <div>
            <p className="section-label">Contact</p>
            <h1 className="font-display mt-4 text-[clamp(2.8rem,7vw,5rem)] font-semibold tracking-[-0.04em]">
              {t.contact.title}
            </h1>
            <p className="mt-5 max-w-md text-base leading-relaxed text-mute md:text-lg">
              {t.contact.introPrefix} {contacts.preferred}. {profile.availabilityText}.
            </p>

            <div className="mt-10 space-y-3 text-lg">
              <a href={`mailto:${contacts.email}`} className="block hover:text-accent">
                {contacts.email}
              </a>
              <a
                href={contacts.telegram}
                className="block hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                Telegram · @sidikovsd
              </a>
              <a
                href={contacts.github}
                className="block hover:text-accent"
                target="_blank"
                rel="noreferrer"
              >
                GitHub · Sidikov213
              </a>
            </div>

            <p className="mt-8 text-mute">{profile.location}</p>
            <p className="text-mute">{profile.timezone}</p>

            <a href="/resume.pdf" className="btn-ghost mt-8 inline-flex" download>
              {t.contact.downloadResume}
            </a>
          </div>

          <ContactForm />
        </div>
      </div>
    </section>
  );
}
