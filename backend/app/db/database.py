from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker
from app.core.config import settings
from app.db.base import Base

connect_args = {}
if "sqlite" in settings.DATABASE_URL:
    connect_args = {
        "check_same_thread": False,
        "timeout": 30, # Wait up to 30 seconds before timing out on locks
    }

engine = create_engine(
    settings.DATABASE_URL,
    connect_args=connect_args,
    pool_pre_ping=True,
)

# Enable WAL (Write-Ahead Logging), NORMAL synchronous, and foreign keys for SQLite
@event.listens_for(engine, "connect")
def set_sqlite_pragma(dbapi_connection, connection_record):
    if "sqlite" in settings.DATABASE_URL:
        cursor = dbapi_connection.cursor()
        cursor.execute("PRAGMA journal_mode=WAL;")
        cursor.execute("PRAGMA synchronous=NORMAL;")
        cursor.execute("PRAGMA foreign_keys=ON;")
        cursor.close()

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """Dependency to get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)
