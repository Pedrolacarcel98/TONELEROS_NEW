from pydantic import BaseModel
from datetime import datetime
from typing import Optional
from enum import Enum


class MediaType(str, Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class MediaResponse(BaseModel):
    id: int
    stored_name: str
    original_name: str
    mime_type: Optional[str]
    media_type: str
    size: Optional[int]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
