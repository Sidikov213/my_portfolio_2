from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.deps import get_current_admin
from app.core.config import get_settings
from app.core.security import create_access_token, hash_password, verify_password
from app.db.session import get_db
from app.models.user import User
from app.schemas.auth import AdminUserOut, LoginRequest, PasswordChangeRequest, TokenOut

router = APIRouter()
settings = get_settings()


@router.post("/login", response_model=TokenOut)
async def login(payload: LoginRequest, db: AsyncSession = Depends(get_db)) -> TokenOut:
    user = (await db.execute(select(User).where(User.email == payload.email))).scalar_one_or_none()

    if not user or not verify_password(payload.password, user.hashed_password):
        if (
            payload.email.lower() == settings.admin_email.lower()
            and payload.password == settings.admin_password
            and user is None
        ):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Admin user not seeded. Restart the API.",
            )
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if not user.is_active or not user.is_superuser:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")

    token = create_access_token(user.email, {"uid": user.id})
    return TokenOut(access_token=token)


@router.get("/me", response_model=AdminUserOut)
async def me(admin: User = Depends(get_current_admin)) -> AdminUserOut:
    return AdminUserOut(id=admin.id, email=admin.email, is_superuser=admin.is_superuser)


@router.post("/change-password")
async def change_password(
    payload: PasswordChangeRequest,
    admin: User = Depends(get_current_admin),
    db: AsyncSession = Depends(get_db),
) -> dict[str, str]:
    if not verify_password(payload.current_password, admin.hashed_password):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Current password is wrong")

    if payload.current_password == payload.new_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must differ from the current one",
        )

    admin.hashed_password = hash_password(payload.new_password)
    await db.commit()
    return {"status": "ok"}
