from sqlalchemy import Column, Integer, String, DateTime, Boolean, Float
from datetime import datetime
from app.db.base import Base

class Event(Base):
    __tablename__ = "agenda"
    
    id = Column(Integer, primary_key=True, index=True)
    tipo = Column(String(200), nullable=False)
    fecha = Column(DateTime, nullable=False)
    hora_comienzo = Column(String(5), default="00:00")
    hora_llegada = Column(String(5), default="00:00")
    direccion = Column(String(200), nullable=False)
    pContacto = Column(String(200), nullable=False)
    tlf = Column(Integer, nullable=False)
    presupuesto = Column(Integer, nullable=False)
    senal = Column(Integer, nullable=False)
    senal_repartida = Column(Boolean, default=False)
    cobrador = Column(String(50), nullable=True)
    observaciones = Column(String(500), nullable=False)
    equipo = Column(Boolean, default=False)
    archivado = Column(Boolean, default=False)
    estado = Column(String(50), default="NEGOCIACION") # "NEGOCIACION" or "CONFIRMADO"
    created_at = Column(DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f"<Event(id={self.id}, tipo={self.tipo}, fecha={self.fecha})>"
