#!/bin/bash
# Run Both Backend and Frontend
# © 2025 igotnowifi, LLC

set -e

echo "🚀 Starting Backend and Frontend..."
echo "===================================="

# Get the directory of this script
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$( cd "$SCRIPT_DIR/.." && pwd )"

cd "$PROJECT_ROOT"

# Make scripts executable
chmod +x scripts/run_backend.sh scripts/run_frontend.sh

# Function to cleanup on exit
cleanup() {
    echo ""
    echo "🛑 Shutting down servers..."
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true
    exit
}

trap cleanup SIGINT SIGTERM

# Start backend in background
echo "📡 Starting backend..."
./scripts/run_backend.sh &
BACKEND_PID=$!

# Wait a bit for backend to start
sleep 3

# Start frontend in background
echo "🎨 Starting frontend..."
./scripts/run_frontend.sh &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are running!"
echo "   Backend:  http://localhost:8080"
echo "   Frontend: http://localhost:5173"
echo "   API Docs: http://localhost:8080/api/docs"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for both processes
wait $BACKEND_PID $FRONTEND_PID

