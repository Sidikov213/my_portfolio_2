# Portfolio Platform

Персональный сайт-портфолио + FastAPI backend (контент, заявки, задел под парсеры).

## Стек

- **Frontend:** Next.js, TypeScript, Tailwind CSS, Framer Motion
- **Backend:** FastAPI, SQLAlchemy, SQLite (локально) / PostgreSQL (позже)
- **Дальше:** Redis + worker для парсеров (Kwork и др.)

## Быстрый старт

### Backend

```bash
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### Frontend

```bash
cd frontend
npm install
npm run dev
```

Сайт: http://localhost:3000

### Админка

1. Запусти backend и frontend
2. Открой http://localhost:3000/admin
3. Логин из `backend/.env`:
   - `ADMIN_EMAIL` (по умолчанию `admin@example.com`)
   - `ADMIN_PASSWORD` (по умолчанию `changeme`)

В админке: обзор, заявки (статусы/удаление), флаги проектов (featured / published / draft).

## Структура

```
portfolio/
  frontend/   # публичный сайт
  backend/    # API, модели, заявки
```

## Публичные endpoints

- `GET /api/health`
- `GET /api/profile`
- `GET /api/projects`
- `GET /api/projects/categories`
- `GET /api/projects/{slug}`
- `GET /api/services`
- `POST /api/leads`
