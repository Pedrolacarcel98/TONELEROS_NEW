from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class DocumentResponse(BaseModel):
    id: int
    stored_name: str
    original_name: str
    mime_type: Optional[str]
    size: Optional[int]
    created_at: Optional[datetime]

    class Config:
        orm_mode = True
