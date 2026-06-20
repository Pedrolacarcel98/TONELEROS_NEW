from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
import secrets
import hashlib
from app.db.database import get_db
from app.models.webhook import Webhook
from app.models.api_key import ApiKey
from app.schemas.integration_schema import (
    WebhookCreate, WebhookResponse,
    ApiKeyCreate, ApiKeyResponse, ApiKeyCreatedResponse
)

router = APIRouter(prefix="/api/integrations", tags=["integrations"])

# --- Webhooks ---

@router.get("/webhooks", response_model=List[WebhookResponse])
def list_webhooks(db: Session = Depends(get_db)):
    return db.query(Webhook).all()

@router.post("/webhooks", response_model=WebhookResponse, status_code=status.HTTP_201_CREATED)
def create_webhook(payload: WebhookCreate, db: Session = Depends(get_db)):
    wh = Webhook(
        name=payload.name,
        url=payload.url,
        event_type=payload.event_type,
        is_active=payload.is_active
    )
    db.add(wh)
    db.commit()
    db.refresh(wh)
    return wh

@router.delete("/webhooks/{webhook_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_webhook(webhook_id: int, db: Session = Depends(get_db)):
    wh = db.query(Webhook).filter(Webhook.id == webhook_id).first()
    if not wh:
        raise HTTPException(status_code=404, detail="Webhook no encontrado")
    db.delete(wh)
    db.commit()
    return

# --- API Keys ---

def generate_api_key():
    return secrets.token_urlsafe(32)

def hash_api_key(key: str) -> str:
    return hashlib.sha256(key.encode()).hexdigest()

@router.get("/apikeys", response_model=List[ApiKeyResponse])
def list_api_keys(db: Session = Depends(get_db)):
    return db.query(ApiKey).all()

@router.post("/apikeys", response_model=ApiKeyCreatedResponse, status_code=status.HTTP_201_CREATED)
def create_api_key(payload: ApiKeyCreate, db: Session = Depends(get_db)):
    raw_key = generate_api_key()
    hashed_key = hash_api_key(raw_key)
    
    ak = ApiKey(
        name=payload.name,
        key_hash=hashed_key
    )
    db.add(ak)
    db.commit()
    db.refresh(ak)
    
    # Return the raw key just this once
    return {
        "id": ak.id,
        "name": ak.name,
        "created_at": ak.created_at,
        "key": raw_key
    }

@router.delete("/apikeys/{apikey_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_api_key(apikey_id: int, db: Session = Depends(get_db)):
    ak = db.query(ApiKey).filter(ApiKey.id == apikey_id).first()
    if not ak:
        raise HTTPException(status_code=404, detail="API Key no encontrada")
    db.delete(ak)
    db.commit()
    return
