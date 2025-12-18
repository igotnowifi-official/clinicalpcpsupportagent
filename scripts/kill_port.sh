#!/bin/bash
# Kill process on a specific port
# Usage: ./scripts/kill_port.sh <port>

PORT=${1:-8080}

if [ -z "$1" ]; then
    echo "Usage: $0 <port>"
    echo "Example: $0 8080"
    exit 1
fi

PID=$(lsof -ti :$PORT)

if [ -z "$PID" ]; then
    echo "No process found on port $PORT"
    exit 0
fi

echo "Killing process $PID on port $PORT..."
kill $PID

# Wait a moment and check
sleep 1
if lsof -ti :$PORT > /dev/null 2>&1; then
    echo "Process still running, force killing..."
    kill -9 $PID
fi

echo "Port $PORT is now free"

