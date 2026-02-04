#!/bin/bash
set -e

echo "🚀 Starting NanoLoc Deployment..."

# 1. Environment Setup
if [ ! -f .env ]; then
    echo "⚠️ .env not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
    else
        echo "❌ .env.example not found! Please create .env manually."
        exit 1
    fi
fi

# 2. Secret Generation
# Check if AUTH_SECRET is set or explicitely "change-me..."
if grep -q 'AUTH_SECRET="change-me-to-a-secure-random-string"' .env || ! grep -q "AUTH_SECRET" .env; then
    echo "🔑 Generating new AUTH_SECRET..."
    # Generate random secret
    SECRET=$(openssl rand -base64 32)
    # Escape special characters for sed if necessary, but base64 is usually safe for simple replacement
    # Using perl or a more robust sed pattern if available, but here basic sed:
    if grep -q "AUTH_SECRET" .env; then
        # Replace existing placeholder
        # Use simple delimiter assuming no pipes in base64 (which is true)
        sed -i.bak "s|AUTH_SECRET=\"change-me-to-a-secure-random-string\"|AUTH_SECRET=\"$SECRET\"|g" .env
        rm .env.bak
    else
        # Append if missing
        echo "" >> .env
        echo "AUTH_SECRET=\"$SECRET\"" >> .env
    fi
    echo "✅ AUTH_SECRET updated."
else
    echo "✅ AUTH_SECRET already configured."
fi

# 3. Create Data Directory
if [ ! -d "./data" ]; then
    echo "Cc Creating ./data directory for SQLite persistence..."
    mkdir -p ./data
fi

# 4. Launch Docker
echo "🐳 Building and Starting Containers..."
docker-compose up -d --build

echo "✅ Deployment Complete! App should be running on http://localhost:3000"
