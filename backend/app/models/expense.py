from sqlalchemy import Column, Integer, String, DateTime, Float
from datetime import datetime
from app.db.base import Base


class Expense(Base):
    __tablename__ = "gastos"

    id = Column(Integer, primary_key=True, index=True)
    concepto = Column(String(200), nullable=False)
    cantidad = Column(Float, nullable=False)
    observaciones = Column(String(500), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Expense(id={self.id}, concepto={self.concepto}, cantidad={self.cantidad})>"
