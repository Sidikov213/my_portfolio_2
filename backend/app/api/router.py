from fastapi import APIRouter

from app.api.routes import admin, auth, health, leads, profile, projects, services, site, uploads

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(admin.router, prefix="/admin", tags=["admin"])
api_router.include_router(uploads.router, prefix="/admin", tags=["admin"])
api_router.include_router(site.router, tags=["site"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(leads.router, prefix="/leads", tags=["leads"])
