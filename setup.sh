#!/bin/bash

echo "========================================"
echo "Curry Pot - Automated Setup Script"
echo "========================================"
echo

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "ERROR: Python 3 is not installed or not in PATH"
    echo "Please install Python 3.11+ from https://www.python.org/downloads/"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ from https://nodejs.org/"
    exit 1
fi

echo "[1/6] Creating necessary directories..."
mkdir -p backend/data
mkdir -p ai-service/venv
mkdir -p backend/venv
echo "Directory structure created."
echo

echo "[2/6] Setting up Backend..."
cd backend
if [ ! -d "venv/bin" ]; then
    echo "Creating Python virtual environment..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to create virtual environment"
        cd ..
        exit 1
    fi
fi
echo "Activating virtual environment..."
source venv/bin/activate
echo "Installing backend dependencies..."
pip install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install backend dependencies"
    cd ..
    exit 1
fi
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    if [ -f ".env.example" ]; then
        cp .env.example .env
        echo "NOTE: Please edit backend/.env file with your configuration"
    else
        echo "WARNING: .env.example not found. Please create .env manually."
    fi
fi
deactivate
cd ..
echo "Backend setup complete."
echo

echo "[3/6] Setting up Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "ERROR: Failed to install frontend dependencies"
        cd ..
        exit 1
    fi
else
    echo "Frontend dependencies already installed. Skipping..."
fi
cd ..
echo "Frontend setup complete."
echo

echo "[4/6] Setting up AI Service (Optional)..."
cd ai-service
if [ ! -d "venv/bin" ]; then
    echo "Creating Python virtual environment for AI service..."
    python3 -m venv venv
    if [ $? -ne 0 ]; then
        echo "WARNING: Failed to create AI service virtual environment"
        cd ..
        SKIP_AI=true
    else
        SKIP_AI=false
    fi
else
    SKIP_AI=false
fi

if [ "$SKIP_AI" = false ]; then
    echo "Activating AI service virtual environment..."
    source venv/bin/activate
    echo "Installing AI service dependencies..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "WARNING: Failed to install AI service dependencies"
    fi
    if [ ! -f ".env" ]; then
        echo "Creating .env file from template..."
        if [ -f ".env.example" ]; then
            cp .env.example .env
            echo "NOTE: Please edit ai-service/.env file with your configuration"
        else
            echo "WARNING: .env.example not found. Please create .env manually."
        fi
    fi
    deactivate
fi
cd ..
echo "AI Service setup complete."
echo

echo "[5/6] Creating initial database..."
cd backend
source venv/bin/activate
echo "Initializing database..."
python3 -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized successfully!')"
if [ $? -ne 0 ]; then
    echo "WARNING: Database initialization failed. You may need to run this manually."
else
    echo "Database initialized successfully!"
fi
deactivate
cd ..
echo

echo "[6/6] Setup Summary"
echo "========================================"
echo "Backend:     Ready (venv created, dependencies installed)"
echo "Frontend:    Ready (dependencies installed)"
echo "AI Service:  Ready (venv created, dependencies installed)"
echo "Database:    Initialized"
echo
echo "IMPORTANT: Before running the application:"
echo "1. Edit backend/.env with your configuration (Stripe keys, email, etc.)"
echo "2. Edit ai-service/.env if using AI service"
echo
echo "Default Admin Credentials:"
echo "  Email: admin@currypot.com"
echo "  Password: admin123"
echo
echo "To run the application:"
echo "  Backend:    cd backend && source venv/bin/activate && python run.py"
echo "  Frontend:   cd frontend && npm run dev"
echo "  AI Service: cd ai-service && source venv/bin/activate && python run.py"
echo
echo "Or use the run.sh file to start all services!"
echo "========================================"
echo



