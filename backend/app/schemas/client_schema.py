from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

class ClientBase(BaseModel):
    nombre: str
    email: Optional[str] = None
    telefono: Optional[str] = None
    direccion: Optional[str] = None
    notas: Optional[str] = None

class ClientCreate(ClientBase):
    pass

class ClientResponse(ClientBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
