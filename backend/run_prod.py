#!/usr/bin/env python
import sys
import subprocess
from init_db import init_db

if __name__ == "__main__":
    print("🚀 TONELEROS BACKEND - PRODUCTION MODE")
    
    # Initialize database (creates tables, users and imports legacy JSON if present)
    try:
        init_db()
    except Exception as e:
        print(f"⚠️ Error during DB initialization: {e}")
    
    # Run uvicorn without --reload
    # En producción usamos 4 workers para mayor estabilidad
    subprocess.call([
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--workers", "4"
    ])
