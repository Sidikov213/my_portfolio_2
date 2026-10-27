from __future__ import annotations

import html
import logging
from dataclasses import dataclass

import httpx

from app.core.config import get_settings

logger = logging.getLogger(__name__)


@dataclass
class LeadNotifyPayload:
    name: str
    contact: str
    company: str = ""
    project_type: str = ""
    description: str = ""
    budget: str = ""
    timeline: str = ""


def _esc(value: str) -> str:
    return html.escape(value or "", quote=False)


async def notify_new_lead(lead: LeadNotifyPayload) -> None:
    settings = get_settings()
    token = (settings.telegram_bot_token or "").strip()
    chat_id = (settings.telegram_chat_id or "").strip()
    if not token or not chat_id:
        logger.info("Telegram notify skipped: TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID not set")
        return

    text = (
        "<b>Новая заявка с сайта</b>\n\n"
        f"<b>Имя:</b> {_esc(lead.name)}\n"
        f"<b>Контакт:</b> {_esc(lead.contact)}\n"
        f"<b>Компания:</b> {_esc(lead.company) or '—'}\n"
        f"<b>Тип:</b> {_esc(lead.project_type) or '—'}\n"
        f"<b>Бюджет:</b> {_esc(lead.budget) or '—'}\n"
        f"<b>Сроки:</b> {_esc(lead.timeline) or '—'}\n\n"
        f"<b>Описание:</b>\n{_esc(lead.description) or '—'}"
    )

    url = f"https://api.telegram.org/bot{token}/sendMessage"
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                url,
                json={
                    "chat_id": chat_id,
                    "text": text,
                    "parse_mode": "HTML",
                    "disable_web_page_preview": True,
                },
            )
            if response.status_code >= 400:
                logger.warning("Telegram notify failed: %s %s", response.status_code, response.text)
    except Exception:
        logger.exception("Telegram notify error")
