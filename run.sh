#!/bin/bash

echo "========================================"
echo "Curry Pot - Start All Services"
echo "========================================"
echo
echo "Starting services..."
echo

# Function to start backend
start_backend() {
    echo "Starting Backend (Flask) on http://localhost:5000..."
    cd backend
    source venv/bin/activate
    python run.py &
    BACKEND_PID=$!
    cd ..
    echo "Backend started (PID: $BACKEND_PID)"
    echo
}

# Function to start frontend
start_frontend() {
    echo "Starting Frontend (React) on http://localhost:3000..."
    cd frontend
    npm run dev &
    FRONTEND_PID=$!
    cd ..
    echo "Frontend started (PID: $FRONTEND_PID)"
    echo
}

# Function to start AI service
start_ai_service() {
    if [ -d "ai-service/venv/bin" ]; then
        echo "Starting AI Service (FastAPI) on http://localhost:8001..."
        cd ai-service
        source venv/bin/activate
        python run.py &
        AI_PID=$!
        cd ..
        echo "AI Service started (PID: $AI_PID)"
        echo
    else
        echo "WARNING: AI Service not set up. Skipping..."
        echo
    fi
}

# Start all services
start_backend
sleep 2
start_frontend
sleep 2
start_ai_service

echo "========================================"
echo "All services are starting!"
echo
echo "Backend:    http://localhost:5000"
echo "Frontend:   http://localhost:3000"
echo "AI Service: http://localhost:8001"
echo
echo "Press Ctrl+C to stop all services"
echo "========================================"
echo

# Wait for user interrupt
trap "echo; echo 'Stopping all services...'; kill $BACKEND_PID $FRONTEND_PID $AI_PID 2>/dev/null; exit" INT
wait



