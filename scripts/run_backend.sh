#!/bin/bash
# Run Backend API Server
# © 2025 igotnowifi, LLC

set -e

echo "🚀 Starting Backend API Server..."
echo "================================"

# Check if we're in the right directory
if [ ! -d "api" ]; then
    echo "❌ Error: 'api' directory not found. Please run from project root."
    exit 1
fi

# Check if Python is available
if ! command -v python3 &> /dev/null; then
    echo "❌ Error: Python 3 is not installed."
    exit 1
fi

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "📦 Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
echo "🔧 Activating virtual environment..."
source venv/bin/activate

# Install/update dependencies
echo "📥 Installing dependencies..."
pip install -q --upgrade pip
pip install -q -r api/requirements.txt

# Check for .env file
if [ ! -f "api/.env" ]; then
    echo "⚠️  Warning: api/.env file not found. Using defaults."
    echo "   Create api/.env with your configuration if needed."
fi

# Set default environment variables if not set
export ENV=${ENV:-development}
export DEBUG=${DEBUG:-true}
export FRONTEND_URL=${FRONTEND_URL:-http://localhost:5173}

# Run the server
echo ""
echo "✅ Starting FastAPI server on http://localhost:8080"
echo "   API docs available at http://localhost:8080/api/docs"
echo "   Press Ctrl+C to stop"
echo ""

cd api
python -m uvicorn main:app --host 0.0.0.0 --port 8080 --reload

