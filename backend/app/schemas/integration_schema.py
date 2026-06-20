from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class WebhookCreate(BaseModel):
    name: str
    url: str
    event_type: str
    is_active: bool = True

class WebhookResponse(WebhookCreate):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApiKeyCreate(BaseModel):
    name: str

class ApiKeyResponse(BaseModel):
    id: int
    name: str
    created_at: datetime
    
    class Config:
        from_attributes = True

class ApiKeyCreatedResponse(ApiKeyResponse):
    key: str # The plain text key, only shown once
