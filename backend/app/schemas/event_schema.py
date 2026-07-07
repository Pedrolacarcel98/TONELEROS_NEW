from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional

class EventBase(BaseModel):
    tipo: str
    fecha: date
    hora_comienzo: str = "00:00"
    hora_llegada: str = "00:00"
    direccion: str
    pContacto: str
    tlf: int
    presupuesto: int
    senal: int
    senal_repartida: bool = False
    cobrador: Optional[str] = None
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
