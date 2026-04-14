from sqlalchemy import Column, Integer, String, DateTime, Enum
from datetime import datetime
from app.db.base import Base
import enum


class MediaType(enum.Enum):
    PHOTO = "PHOTO"
    VIDEO = "VIDEO"


class Media(Base):
    __tablename__ = 'media'

    id = Column(Integer, primary_key=True, index=True)
    stored_name = Column(String(300), nullable=False)
    original_name = Column(String(300), nullable=False)
    mime_type = Column(String(100), nullable=True)
    media_type = Column(String(20), nullable=False)  # PHOTO, VIDEO
    size = Column(Integer, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def __repr__(self):
        return f"<Media(id={self.id}, type={self.media_type}, original_name={self.original_name})>"
