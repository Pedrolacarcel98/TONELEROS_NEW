from sqlalchemy import Column, Integer, String, DateTime
from datetime import datetime
from app.db.base import Base


class Document(Base):
    __tablename__ = 'documents'

    id = Column(Integer, primary_key=True, index=True)
    stored_name = Column(String(300), nullable=False)  # filename on disk
    original_name = Column(String(300), nullable=False)
    mime_type = Column(String(100), nullable=True)
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Document(id={self.id}, original_name={self.original_name})>"
