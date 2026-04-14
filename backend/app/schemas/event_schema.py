from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class EventBase(BaseModel):
    tipo: str
    fecha: datetime
    direccion: str
    pContacto: str
    tlf: int
    presupuesto: int
    senal: int
    observaciones: str
    equipo: bool = False
    estado: str = "NEGOCIACION"

class EventCreate(EventBase):
    pass

class EventResponse(EventBase):
    id: int
    archivado: bool
    created_at: datetime
    
    class Config:
        from_attributes = True
