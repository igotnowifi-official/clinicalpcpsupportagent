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

# Check if port 8080 is in use
if lsof -ti :8080 > /dev/null 2>&1; then
    echo "⚠️  Warning: Port 8080 is already in use"
    echo "   Run './scripts/kill_port.sh 8080' to free it, or use a different port"
    read -p "   Kill process on port 8080? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        ./scripts/kill_port.sh 8080
        sleep 1
    else
        echo "   Exiting. Please free port 8080 or change backend port."
        exit 1
    fi
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
pip install -q --upgrade pip setuptools wheel
echo "   Installing PyYAML (may take a moment on Python 3.13)..."
pip install -q "pyyaml>=6.0.1" || echo "   Warning: PyYAML installation had issues, continuing..."
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

