import httpx
import asyncio
from app.db.database import SessionLocal
from app.models.webhook import Webhook

async def send_webhook(url: str, payload: dict):
    """Sends a single webhook request asynchronously"""
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(url, json=payload, timeout=5.0)
            response.raise_for_status()
            print(f"Webhook sent successfully to {url}")
    except Exception as e:
        print(f"Failed to send webhook to {url}: {e}")

def dispatch_event(event_type: str, payload: dict):
    """
    Dispatches an event to all active webhooks registered for that event type.
    This is intended to be run in a FastAPI BackgroundTask.
    """
    db = SessionLocal()
    try:
        webhooks = db.query(Webhook).filter(
            Webhook.event_type == event_type,
            Webhook.is_active == True
        ).all()
        
        if not webhooks:
            return
            
        # Create an event loop if not running, or just use asyncio.run in a background thread.
        # FastAPI BackgroundTasks run in a separate thread, so we need to run the async functions.
        # However, it's safer to just run them synchronously in this thread or use asyncio.run
        
        async def run_all():
            tasks = [send_webhook(wh.url, payload) for wh in webhooks]
            await asyncio.gather(*tasks)
            
        # Since this runs in a threadpool (because FastAPI background tasks are sync functions),
        # we can use asyncio.run
        asyncio.run(run_all())
        
    finally:
        db.close()
