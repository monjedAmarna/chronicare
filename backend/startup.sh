#!/bin/sh

# Startup script for Chronicare backend
# This ensures the database is ready before starting the application

echo "🚀 Starting Chronicare backend..."

# Wait for database to be ready (if using Docker)
if [ "$DB_HOST" = "db" ]; then
  echo "⏳ Waiting for database to be ready..."
  while ! nc -z $DB_HOST $DB_PORT; do
    echo "Database not ready yet, waiting..."
    sleep 2
  done
  echo "✅ Database is ready!"
fi

# Start the application
echo "🌐 Starting Node.js application..."
exec npm run dev 