#!/usr/bin/env python
import sys
import subprocess
from init_db import create_test_users

if __name__ == "__main__":
    print("🚀 TONELEROS BACKEND - PRODUCTION MODE")
    
    # Initialize database
    try:
        create_test_users()
    except Exception as e:
        print(f"Database initialization: {e}")
    
    # Run uvicorn without --reload
    subprocess.call([
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--workers", "4"  # 4 trabajadores para mayor rendimiento
    ])
