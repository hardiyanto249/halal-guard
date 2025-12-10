#!/bin/bash

echo "========================================"
echo "Starting HalalGuard AI Development Servers"
echo "========================================"
echo ""

# Start backend in background
echo "Starting Backend Server..."
cd backend
go run main.go &
BACKEND_PID=$!
cd ..

sleep 3

# Start frontend in background
echo "Starting Frontend Server..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "========================================"
echo "✅ Both servers are running!"
echo "========================================"
echo ""
echo "Backend:  http://localhost:8087"
echo "Frontend: http://localhost:5173"
echo ""
echo "Press Ctrl+C to stop all servers..."

# Wait for Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
