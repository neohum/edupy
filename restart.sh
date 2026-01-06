#!/bin/bash
# Script to restart EduPy with fresh database

echo "🛑 Stopping containers..."
docker-compose down

echo "🗑️  Removing old database artifacts..."
rm -rf ./backend/edupy.db
rm -rf ./data/edupy.db

echo "📁 Ensuring data directory exists..."
mkdir -p ./data
chmod 755 ./data

echo "🔨 Rebuilding containers..."
docker-compose build --no-cache backend

echo "🚀 Starting containers..."
docker-compose up -d

echo "📋 Checking logs..."
sleep 3
docker-compose logs backend | tail -20

echo ""
echo "✅ Done! Check the logs above for any errors."
echo "   If successful, the backend should be running on http://localhost:8000"
