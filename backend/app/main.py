from contextlib import asynccontextmanager
import json

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import inspect, select, text

from app.api.router import api_router
from app.core.config import get_settings
from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Category, Lead, Profile, Project, Service, User  # noqa: F401
from app.core.security import hash_password


settings = get_settings()


async def ensure_project_columns() -> None:
    def _migrate(sync_conn) -> None:
        inspector = inspect(sync_conn)
        if "projects" not in inspector.get_table_names():
            return
        cols = {column["name"] for column in inspector.get_columns("projects")}
        statements: list[str] = []
        if "github_url" not in cols:
            statements.append("ALTER TABLE projects ADD COLUMN github_url VARCHAR(500)")
        if "live_url" not in cols:
            statements.append("ALTER TABLE projects ADD COLUMN live_url VARCHAR(500)")
        if "status" not in cols:
            statements.append(
                "ALTER TABLE projects ADD COLUMN status VARCHAR(80) DEFAULT 'production'"
            )
        if "category_label" not in cols:
            statements.append(
                "ALTER TABLE projects ADD COLUMN category_label VARCHAR(200) DEFAULT ''"
            )
        for statement in statements:
            sync_conn.execute(text(statement))

    async with engine.begin() as conn:
        await conn.run_sync(_migrate)


async def seed_admin_user() -> None:
    async with SessionLocal() as db:
        existing = (
            await db.execute(select(User).where(User.email == settings.admin_email))
        ).scalar_one_or_none()

        if existing:
            # Keep DB password as source of truth after first seed (admin can change it in UI).
            existing.is_active = True
            existing.is_superuser = True
            await db.commit()
            return

        db.add(
            User(
                email=settings.admin_email,
                hashed_password=hash_password(settings.admin_password),
                is_active=True,
                is_superuser=True,
            )
        )
        await db.commit()


async def seed_database() -> None:
    async with SessionLocal() as db:
        existing_profile = (await db.execute(select(Profile).limit(1))).scalar_one_or_none()
        if existing_profile:
            return

        profile = Profile(
            full_name="Содирхон Сидиков",
            profession="Python Developer (AI + Integrations)",
            specialization="Backend-разработка, AI-интеграции и автоматизация бизнес-процессов",
            slogan="Создаю backend-системы, AI-интеграции и автоматизацию, которые работают в реальном бизнесе.",
            bio=(
                "Python-разработчик с практическим опытом создания коммерческих систем в production. "
                "Специализируюсь на backend-разработке, AI-интеграциях, Telegram-ботах и автоматизации "
                "бизнес-процессов через Bitrix24 и внешние API."
            ),
            city="Махачкала",
            timezone="Europe/Moscow",
            email="sodirhonsidikov512@gmail.com",
            telegram="@sidikovsd",
            github="https://github.com/Sidikov213",
            linkedin="https://linkedin.com/in/sidikov213",
            availability_status="Открыт к удалённой работе и интересным коммерческим проектам",
            is_available=True,
            resume_url="/resume.pdf",
        )

        categories = [
            Category(name="Backend", slug="backend", sort_order=1),
            Category(name="AI", slug="ai", sort_order=2),
            Category(name="Fullstack", slug="fullstack", sort_order=3),
            Category(name="Автоматизация", slug="automation", sort_order=4),
        ]

        projects = [
            Project(
                title="Production-система лояльности",
                slug="loyalty-system",
                summary="Production-система лояльности с Bitrix24, бонусным балансом, кабинетом и админкой.",
                year=2026,
                role="Backend Developer, интеграции, deployment и поддержка",
                technologies="Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Bitrix24 API",
                client_name="",
                content_blocks=json.dumps(
                    [
                        "57+ млн ₽ оборота",
                        "190 активных клиентов",
                        "Полный цикл разработки и поддержки",
                    ],
                    ensure_ascii=False,
                ),
                sort_order=1,
                is_featured=True,
                is_published=True,
                is_draft=False,
                category=categories[0],
            ),
            Project(
                title="Карта монтажей с Bitrix24 и Яндекс.Картами",
                slug="installation-map",
                summary="Внутренний сервис карты монтажей с синхронизацией сделок из Bitrix24.",
                year=2026,
                role="Full-cycle Developer",
                technologies="Python, FastAPI, PostgreSQL, Bitrix24 API, Yandex Maps API",
                client_name="",
                content_blocks=json.dumps(
                    ["Развёрнут на production-домене", "Защищённый доступ", "Обработка адресов без координат"],
                    ensure_ascii=False,
                ),
                sort_order=2,
                is_featured=True,
                is_published=True,
                is_draft=False,
                category=categories[3],
            ),
            Project(
                title="Smile AI - бизнес-ассистент",
                slug="smile-ai",
                summary="AI-ассистент для малого бизнеса: Telegram-бот, сайт и единый backend.",
                year=2026,
                role="Team Lead / Backend / AI",
                technologies="Python, aiogram, FastAPI, OpenAI, OpenRouter, Groq, Docker",
                client_name="Альфа Хакатон",
                content_blocks=json.dumps(
                    ["2-е место на отборе", "Топ-10 федерального финала", "Команда из 4 человек"],
                    ensure_ascii=False,
                ),
                sort_order=3,
                is_featured=True,
                is_published=True,
                is_draft=False,
                category=categories[1],
            ),
            Project(
                title="Атлетика - система управления спортивным клубом",
                slug="athletica",
                summary="Информационная система для клиентов, тренеров, абонементов и аналитики.",
                year=2026,
                role="Fullstack Developer / Database Designer",
                technologies="FastAPI, React, TypeScript, SQLAlchemy, SQLite, JWT",
                client_name="Дипломный проект",
                content_blocks=json.dumps(["Завершённый дипломный проект", "Красный диплом"], ensure_ascii=False),
                sort_order=4,
                is_featured=False,
                is_published=True,
                is_draft=False,
                category=categories[2],
            ),
            Project(
                title="Hair Lab - онлайн-бронирование барбершопа",
                slug="hair-lab",
                summary="Fullstack-приложение для онлайн-записи с кабинетом и админкой.",
                cover_url="/projects/hair-lab/portfolio-card.png",
                year=2026,
                role="Fullstack Developer",
                technologies="Next.js, React, TypeScript, FastAPI, SQLAlchemy, JWT, SQLite",
                client_name="",
                content_blocks=json.dumps(["Готовая демонстрационная система", "Документированный REST API"], ensure_ascii=False),
                sort_order=5,
                is_featured=False,
                is_published=True,
                is_draft=False,
                category=categories[2],
            ),
            Project(
                title="URL Shortener",
                slug="url-shortener",
                summary="Микросервис сокращения ссылок с редиректами, статистикой, тестами и Docker Compose.",
                year=2026,
                role="Backend Developer",
                technologies="Python, FastAPI, PostgreSQL, SQLAlchemy, Alembic, Pytest, Docker",
                client_name="",
                content_blocks=json.dumps(
                    ["Production-подобная архитектура", "Автоматизированные тесты", "Docker Compose"],
                    ensure_ascii=False,
                ),
                sort_order=6,
                is_featured=False,
                is_published=True,
                is_draft=False,
                category=categories[0],
            ),
        ]

        services = [
            Service(
                title="Backend-разработка и REST API",
                slug="backend-api",
                short_description="Серверная часть веб-приложений, бизнес-логика, базы данных и защищённые API.",
                scope="Анализ, архитектура, модели, REST API, авторизация, тесты, подготовка к production",
                stages="Бриф → архитектура → разработка → тесты → деплой",
                timeline="После оценки задачи",
                price_from="По запросу",
                sort_order=1,
            ),
            Service(
                title="Автоматизация бизнеса и Bitrix24",
                slug="business-automation",
                short_description="Интеграция CRM с внешними сервисами, уведомления и внутренние инструменты.",
                scope="Аудит процесса, Bitrix24 API/webhooks, Telegram, админки, отчёты",
                stages="Аудит → схема → интеграции → запуск → сопровождение",
                timeline="После аудита процесса",
                price_from="По запросу",
                sort_order=2,
            ),
            Service(
                title="AI-ассистенты и Telegram-боты",
                slug="ai-telegram",
                short_description="AI-боты с контекстом, сценариями, шаблонами и backend-интеграциями.",
                scope="Telegram Bot API, OpenAI/OpenRouter, память диалога, rate limiting, Docker",
                stages="Сценарии → промпты → backend → деплой",
                timeline="После оценки сценариев",
                price_from="По запросу",
                sort_order=3,
            ),
            Service(
                title="Fullstack MVP и административные панели",
                slug="fullstack-mvp",
                short_description="Веб-продукт от интерфейса до backend, базы данных и deployment-инструкции.",
                scope="Next.js/React, FastAPI, авторизация, админка, формы, уведомления",
                stages="ТЗ → UI → API → админка → деплой",
                timeline="После оценки объёма",
                price_from="По запросу",
                sort_order=4,
            ),
        ]

        db.add_all([profile, *categories, *projects, *services])
        await db.commit()


@asynccontextmanager
async def lifespan(_: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    await ensure_project_columns()
    await seed_database()
    await seed_admin_user()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(api_router, prefix="/api")


@app.get("/")
async def root() -> dict[str, str]:
    return {"message": "Portfolio API", "docs": "/docs"}
