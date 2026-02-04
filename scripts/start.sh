#!/bin/sh
set -e

# Run migrations to ensure DB is up to date
echo "Deploying migrations..."
npx prisma migrate deploy

# Start the application
echo "Starting server..."
exec node server.js
