"""
Database initialization script
Creates tables and seed data (test users)
"""
import sys
import os

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.db.database import SessionLocal, engine, init_db
from app.db.base import Base
from app.models.user import User
from app.models.event import Event
from app.core.security import hash_password


def create_test_users():
    """Create test users for development"""
    try:
        # First, create all tables
        print("📊 Creating database tables...")
        init_db()
        print("✓ Database tables created successfully")
        
        # Create session
        db = SessionLocal()
        
        # Check if users already exist
        existing_users = db.query(User).count()
        if existing_users > 0:
            print(f"✓ Database already has {existing_users} user(s)")
            db.close()
            return
        
        # Create test users
        print("\n👤 Creating test users...")
        test_users = [
            {"email": "pedro@toneleros.com", "password": "Pedro123?"},
            {"email": "admin@toneleros.com", "password": "Admin123?"},
        ]
        
        for user_data in test_users:
            user = User(
                email=user_data["email"],
                password=hash_password(user_data["password"])
            )
            db.add(user)
            print(f"   Added: {user_data['email']}")
        
        db.commit()
        print("\n✅ Test users created successfully!")
        print("\n📝 Credentials for testing:")
        print("   - Email: pedro@toneleros.com")
        print("     Password: Pedro123?")
        print("   - Email: admin@toneleros.com")
        print("     Password: Admin123?")
        
        db.close()
        
    except Exception as e:
        print(f"\n⚠️  Note: {e}")
        print("   This may be normal during Docker build.")
        print("   Database will be initialized on first run.\n")
        sys.exit(0)  # Don't fail the build


if __name__ == "__main__":
    create_test_users()
