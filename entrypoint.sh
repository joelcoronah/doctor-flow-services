#!/bin/sh
set -e

# Wait for PostgreSQL and create app database if it doesn't exist. Then start the app.
# Migrations and seed are not run here; run them manually (e.g. npm run migration:run, npm run seed).

echo "Waiting for PostgreSQL to be ready..."
until node scripts/create-database.js 2>/dev/null; do
  echo "PostgreSQL is unavailable - sleeping 2s"
  sleep 2
done

echo "Starting application..."
exec node dist/main.js
