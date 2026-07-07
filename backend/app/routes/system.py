from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from app.core.config import settings
import os

router = APIRouter(prefix="/api/system", tags=["system"])

@router.get("/backup")
def download_backup():
    """Descargar una copia de seguridad de la base de datos (solo SQLite)"""
    db_url = settings.DATABASE_URL
    
    if db_url.startswith("sqlite:///"):
        # Remove the prefix to get the file path
        file_path = db_url.replace("sqlite:///", "")
        
        if os.path.exists(file_path):
            return FileResponse(
                path=file_path, 
                filename="toneleros_backup.db", 
                media_type="application/octet-stream"
            )
        else:
            raise HTTPException(status_code=404, detail="Database file not found.")
    else:
        raise HTTPException(status_code=400, detail="Only SQLite database backups are supported.")
