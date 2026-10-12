# -*- coding: utf-8 -*-
"""Generate bilingual resume PDF (RU + EN)."""

from pathlib import Path

from fpdf import FPDF

ROOT = Path(__file__).resolve().parents[1]
FONT = Path(r"C:\Windows\Fonts\arial.ttf")
FONT_BOLD = Path(r"C:\Windows\Fonts\arialbd.ttf")
OUT_PUBLIC = ROOT / "frontend" / "public" / "resume.pdf"
OUT_CONTENT = ROOT / "content" / "resume" / "resume-sodirkhon-sidikov.pdf"


class ResumePDF(FPDF):
    def footer(self) -> None:
        self.set_y(-12)
        self.set_font("Resume", size=8)
        self.set_text_color(110, 103, 93)
        self.cell(0, 8, str(self.page_no()), align="C")


def reset_x(pdf: ResumePDF) -> None:
    pdf.set_x(pdf.l_margin)


def h1(pdf: ResumePDF, text: str) -> None:
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=18)
    pdf.set_text_color(27, 24, 20)
    pdf.multi_cell(0, 9, text)
    pdf.ln(1)


def h2(pdf: ResumePDF, text: str) -> None:
    pdf.ln(3)
    reset_x(pdf)
    pdf.set_draw_color(168, 54, 40)
    y = pdf.get_y()
    pdf.set_line_width(0.5)
    pdf.line(pdf.l_margin, y, pdf.l_margin + 18, y)
    pdf.ln(2)
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=11)
    pdf.set_text_color(27, 24, 20)
    pdf.multi_cell(0, 6, text.upper())
    pdf.ln(1)


def body(pdf: ResumePDF, text: str) -> None:
    reset_x(pdf)
    pdf.set_font("Resume", size=9.5)
    pdf.set_text_color(40, 36, 30)
    pdf.multi_cell(0, 5, text)
    pdf.ln(1)


def muted(pdf: ResumePDF, text: str) -> None:
    reset_x(pdf)
    pdf.set_font("Resume", size=9)
    pdf.set_text_color(111, 103, 93)
    pdf.multi_cell(0, 5, text)
    pdf.ln(0.5)


def bullet(pdf: ResumePDF, text: str) -> None:
    reset_x(pdf)
    pdf.set_font("Resume", size=9.5)
    pdf.set_text_color(40, 36, 30)
    pdf.multi_cell(0, 5, "- " + text)


def role(pdf: ResumePDF, title: str, meta: str) -> None:
    pdf.ln(1.5)
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=10)
    pdf.set_text_color(27, 24, 20)
    pdf.multi_cell(0, 5, title)
    muted(pdf, meta)


def build_ru(pdf: ResumePDF) -> None:
    h1(pdf, "Содирхон Сидиков")
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=11)
    pdf.set_text_color(168, 54, 40)
    pdf.multi_cell(0, 6, "Python Developer (AI + Integrations)")
    pdf.ln(1)
    muted(
        pdf,
        "Махачкала, Россия | открыт к удалённой работе\n"
        "Telegram: @sidikovsd | sodirhonsidikov512@gmail.com\n"
        "GitHub: github.com/Sidikov213 | sidikovsd.ru | linkedin.com/in/sidikov213",
    )

    h2(pdf, "О себе")
    body(
        pdf,
        "Python-разработчик с практическим опытом создания коммерческих систем в production. "
        "Специализируюсь на backend-разработке, AI-интеграциях, Telegram-ботах и автоматизации "
        "бизнес-процессов через Bitrix24 и внешние API. Беру задачи от анализа и архитектуры "
        "до деплоя и поддержки.",
    )

    h2(pdf, "Ключевые результаты")
    for item in [
        "Более 57 млн руб. оборота прошло через production-систему лояльности.",
        "190 активных клиентов зарегистрированы в системе.",
        "2-е место на отборочном этапе федерального Альфа Хакатона.",
        "Топ-10 федерального финала в Москве.",
        "Руководство командой из 4 человек.",
        "Красный диплом по специальности Информационные системы и программирование.",
    ]:
        bullet(pdf, item)

    h2(pdf, "Опыт")
    role(
        pdf,
        "Python Developer / Fullstack Developer - Фриланс",
        "2025 - настоящее время | удалённо",
    )
    for item in [
        "Разработал и поддерживаю production-систему лояльности с Bitrix24, бонусным балансом, кабинетом и админ-панелью.",
        "Через систему прошло более 57 млн руб. оборота; база достигла 190 активных клиентов.",
        "Автоматизировал процессы через Bitrix24, Telegram Bot API, webhooks и внешние REST API.",
        "Разворачивал приложения на Linux VPS: Nginx, Docker, Uvicorn, systemd и HTTPS.",
        "Создавал AI-ассистентов и Telegram-ботов на OpenAI-совместимых API.",
    ]:
        bullet(pdf, item)

    role(pdf, "Team Lead / Backend / AI - Альфа Хакатон", "2026 | финал в Москве")
    for item in [
        "2-е место на отборе и выход в топ-10 федерального финала.",
        "Руководство командой из 4 человек: координация, декомпозиция, презентация.",
        "Единый backend для сайта, мобильного приложения и Telegram-бота.",
        "AI-ассистент для малого бизнеса с синхронизацией диалогов.",
    ]:
        bullet(pdf, item)

    h2(pdf, "Избранные проекты")
    for item in [
        "Production-система лояльности - FastAPI, PostgreSQL, Bitrix24. github.com/Sidikov213/loyalty_system",
        "Карта монтажей - Bitrix24 + Яндекс.Карты. github.com/Sidikov213/karta_bitrix_integration",
        "Smile AI - AI-ассистент / Telegram-бот для Альфа Хакатона. github.com/Sidikov213/TG_bot_alfha",
        "Атлетика - дипломная система управления спортивным клубом (FastAPI + React).",
        "Hair Lab - fullstack онлайн-бронирование. github.com/Sidikov213/Barbershop_hairlab",
        "URL Shortener - FastAPI, PostgreSQL, Pytest, Docker. github.com/Sidikov213/url-shortener-service",
    ]:
        bullet(pdf, item)

    h2(pdf, "Стек")
    body(
        pdf,
        "Backend: Python, FastAPI, Django, Flask, REST API, Pydantic, SQLAlchemy, Alembic, JWT\n"
        "AI / LLM: OpenAI API, OpenRouter, AI-ассистенты, Telegram-боты, prompt design\n"
        "Databases: PostgreSQL, SQLite, схемы, миграции, ORM\n"
        "Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS\n"
        "DevOps: Docker, Compose, Linux VPS, Nginx, Uvicorn, systemd, HTTPS, Pytest\n"
        "Integrations: Bitrix24, Telegram Bot API, Yandex Maps API, SMS/OTP, REST API",
    )

    h2(pdf, "Образование")
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=10)
    pdf.set_text_color(27, 24, 20)
    pdf.multi_cell(0, 5, "Колледж Дагестанского государственного университета")
    muted(pdf, "Информационные системы и программирование | 2022-2026 | Красный диплом")
    body(pdf, "Дипломный проект: БД и информационная система спортивного клуба Атлетика.")

    h2(pdf, "Языки")
    bullet(pdf, "Русский - родной")
    bullet(pdf, "Английский - рабочий (документация, код, переписка)")


def build_en(pdf: ResumePDF) -> None:
    h1(pdf, "Sodirkhon Sidikov")
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=11)
    pdf.set_text_color(168, 54, 40)
    pdf.multi_cell(0, 6, "Python Developer (AI + Integrations)")
    pdf.ln(1)
    muted(
        pdf,
        "Makhachkala, Russia | open to remote work\n"
        "Telegram: @sidikovsd | sodirhonsidikov512@gmail.com\n"
        "GitHub: github.com/Sidikov213 | sidikovsd.ru | linkedin.com/in/sidikov213",
    )

    h2(pdf, "Summary")
    body(
        pdf,
        "Python developer with hands-on experience shipping commercial systems to production. "
        "Focused on backend development, AI integrations, Telegram bots, and business process "
        "automation via Bitrix24 and external APIs. I take projects from requirements and "
        "architecture through deployment and ongoing support.",
    )

    h2(pdf, "Key results")
    for item in [
        "57M+ RUB processed through a production loyalty system.",
        "190 active clients registered in the system.",
        "2nd place in the qualifying round of the federal Alfa Hackathon.",
        "Top 10 in the federal final in Moscow.",
        "Led a team of 4 people.",
        "Graduated with honors in Information Systems and Programming.",
    ]:
        bullet(pdf, item)

    h2(pdf, "Experience")
    role(pdf, "Python Developer / Fullstack Developer - Freelance", "2025 - present | Remote")
    for item in [
        "Built and maintain a production loyalty system with Bitrix24, bonus balances, client cabinet, and admin panel.",
        "Processed 57M+ RUB through the system; reached 190 active clients.",
        "Automated workflows via Bitrix24, Telegram Bot API, webhooks, and external REST APIs.",
        "Deployed apps on Linux VPS with Nginx, Docker, Uvicorn, systemd, and HTTPS.",
        "Built AI assistants and Telegram bots using OpenAI-compatible APIs.",
    ]:
        bullet(pdf, item)

    role(pdf, "Team Lead / Backend / AI - Alfa Hackathon", "2026 | Final in Moscow")
    for item in [
        "2nd place in qualifying and Top 10 in the federal final.",
        "Led a team of 4: coordination, task breakdown, jury presentation.",
        "Designed a shared backend for website, mobile app, and Telegram bot.",
        "Delivered an AI assistant for small business with synchronized conversations.",
    ]:
        bullet(pdf, item)

    h2(pdf, "Selected projects")
    for item in [
        "Production loyalty system - FastAPI, PostgreSQL, Bitrix24. github.com/Sidikov213/loyalty_system",
        "Installation map - Bitrix24 + Yandex Maps. github.com/Sidikov213/karta_bitrix_integration",
        "Smile AI - AI assistant / Telegram bot for Alfa Hackathon. github.com/Sidikov213/TG_bot_alfha",
        "Athletica - graduation sports club management system (FastAPI + React).",
        "Hair Lab - fullstack booking app. github.com/Sidikov213/Barbershop_hairlab",
        "URL Shortener - FastAPI, PostgreSQL, Pytest, Docker. github.com/Sidikov213/url-shortener-service",
    ]:
        bullet(pdf, item)

    h2(pdf, "Tech stack")
    body(
        pdf,
        "Backend: Python, FastAPI, Django, Flask, REST API, Pydantic, SQLAlchemy, Alembic, JWT\n"
        "AI / LLM: OpenAI API, OpenRouter, AI assistants, Telegram bots, prompt design\n"
        "Databases: PostgreSQL, SQLite, schema design, migrations, ORM\n"
        "Frontend: React, Next.js, TypeScript, JavaScript, Tailwind CSS\n"
        "DevOps: Docker, Compose, Linux VPS, Nginx, Uvicorn, systemd, HTTPS, Pytest\n"
        "Integrations: Bitrix24, Telegram Bot API, Yandex Maps API, SMS/OTP, REST APIs",
    )

    h2(pdf, "Education")
    reset_x(pdf)
    pdf.set_font("ResumeBold", size=10)
    pdf.set_text_color(27, 24, 20)
    pdf.multi_cell(0, 5, "College of Dagestan State University")
    muted(pdf, "Information Systems and Programming | 2022-2026 | Graduated with honors")
    body(pdf, "Graduation project: database and information system for the Athletica sports club.")

    h2(pdf, "Languages")
    bullet(pdf, "Russian - native")
    bullet(pdf, "English - working proficiency (docs, code, written communication)")


def main() -> None:
    if not FONT.exists() or not FONT_BOLD.exists():
        raise SystemExit(f"Fonts not found: {FONT} / {FONT_BOLD}")

    pdf = ResumePDF(format="A4")
    pdf.set_auto_page_break(auto=True, margin=14)
    pdf.set_margins(16, 14, 16)
    pdf.add_font("Resume", fname=str(FONT))
    pdf.add_font("ResumeBold", fname=str(FONT_BOLD))

    pdf.add_page()
    build_ru(pdf)
    pdf.add_page()
    build_en(pdf)

    OUT_PUBLIC.parent.mkdir(parents=True, exist_ok=True)
    OUT_CONTENT.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(OUT_PUBLIC))
    pdf.output(str(OUT_CONTENT))
    print(f"Wrote {OUT_PUBLIC}")
    print(f"Wrote {OUT_CONTENT}")


if __name__ == "__main__":
    main()
