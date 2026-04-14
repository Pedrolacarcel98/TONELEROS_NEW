#!/usr/bin/env python
"""
Entrypoint for backend container
- Initializes database and creates test users
- Starts uvicorn server
"""
import sys
import subprocess
from init_db import create_test_users

if __name__ == "__main__":
    print("=" * 60)
    print("🚀 TONELEROS BACKEND - INITIALIZING")
    print("=" * 60)
    
    # Initialize database
    print("\n📦 Initializing database...")
    try:
        create_test_users()
    except Exception as e:
        print(f"⚠️ Database initialization warning: {e}")
        print("Continuing anyway...\n")
    
    # Start server
    print("\n✅ Database ready!")
    print("🎯 Starting Uvicorn server on http://0.0.0.0:8000")
    print("📚 API Docs: http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    # Run uvicorn
    subprocess.call([
        sys.executable, "-m", "uvicorn",
        "app.main:app",
        "--host", "0.0.0.0",
        "--port", "8000",
        "--reload"
    ])
