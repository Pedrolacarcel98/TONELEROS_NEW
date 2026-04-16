from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os
from app.core.config import settings
from app.db.database import init_db
from app.routes import auth
from app.routes import events
from app.routes import finance
from app.routes import documents
from app.routes import media
from app.routes import clients
from app.models.client import Client # Ensure model is loaded for init_db()

# Initialize database
init_db()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    debug=settings.DEBUG
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routes
app.include_router(auth.router)
app.include_router(events.router)
app.include_router(finance.router)
app.include_router(documents.router)
app.include_router(media.router)
app.include_router(clients.router)

# mount uploads directory to serve files
UPLOAD_DIR = os.path.join(os.path.dirname(__file__), '..', 'uploads')
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount('/uploads', StaticFiles(directory=UPLOAD_DIR), name='uploads')

@app.get("/api/health")
def health_check():
    """Health check endpoint"""
    return {"status": "OK", "app": settings.APP_NAME}

@app.get("/")
def root():
    """Root endpoint"""
    return {
        "message": "Toneleros API - MVP v1.0",
        "docs": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
