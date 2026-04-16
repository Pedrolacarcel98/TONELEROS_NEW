from sqlalchemy import Column, Integer, String, DateTime, Text
from datetime import datetime
from app.db.base import Base
from sqlalchemy.orm import relationship

class Client(Base):
    __tablename__ = "clients"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(200), nullable=False)
    email = Column(String(200), nullable=True)
    telefono = Column(String(50), nullable=True)
    direccion = Column(String(500), nullable=True)
    notas = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Client(id={self.id}, nombre={self.nombre})>"
