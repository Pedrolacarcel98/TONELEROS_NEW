#!/bin/bash
set -e

echo "Starting Toneleros Backend..."

# Create database and test users
echo "Initializing database..."
python -c "from init_db import create_test_users; create_test_users()"

# Start the application
echo "Starting Uvicorn server..."
exec uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
