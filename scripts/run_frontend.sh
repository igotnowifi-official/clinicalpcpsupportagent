#!/bin/bash
# Run Frontend Development Server
# © 2025 igotnowifi, LLC

set -e

echo "🚀 Starting Frontend Development Server..."
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run from project root."
    exit 1
fi

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    exit 1
fi

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ Error: npm is not installed."
    exit 1
fi

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Set API URL if not set
export VITE_API_BASE_URL=${VITE_API_BASE_URL:-http://localhost:8080}

echo ""
echo "✅ Starting Vite dev server on http://localhost:5173"
echo "   Backend API: $VITE_API_BASE_URL"
echo "   Press Ctrl+C to stop"
echo ""

npm run dev

