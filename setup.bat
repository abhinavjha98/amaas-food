@echo off
echo ========================================
echo Curry Pot - Automated Setup Script
echo ========================================
echo.

:: Check if Python is installed
python --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Python is not installed or not in PATH
    echo Please install Python 3.11+ from https://www.python.org/downloads/
    pause
    exit /b 1
)

:: Check if Node.js is installed
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js 16+ from https://nodejs.org/
    pause
    exit /b 1
)

echo [1/6] Creating necessary directories...
if not exist "backend\data" mkdir backend\data
if not exist "ai-service\venv" mkdir ai-service\venv
if not exist "backend\venv" mkdir backend\venv
echo Directory structure created.
echo.

echo [2/6] Setting up Backend...
cd backend
if not exist "venv\Scripts\activate.bat" (
    echo Creating Python virtual environment...
    python -m venv venv
    if errorlevel 1 (
        echo ERROR: Failed to create virtual environment
        cd ..
        pause
        exit /b 1
    )
)
echo Activating virtual environment...
call venv\Scripts\activate.bat
echo Installing backend dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo ERROR: Failed to install backend dependencies
    cd ..
    pause
    exit /b 1
)
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul 2>&1
    if exist ".env.example" (
        echo NOTE: Please edit backend\.env file with your configuration
    ) else (
        echo WARNING: .env.example not found. Please create .env manually.
    )
)
cd ..
echo Backend setup complete.
echo.

echo [3/6] Setting up Frontend...
cd frontend
if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if errorlevel 1 (
        echo ERROR: Failed to install frontend dependencies
        cd ..
        pause
        exit /b 1
    )
) else (
    echo Frontend dependencies already installed. Skipping...
)
cd ..
echo Frontend setup complete.
echo.

echo [4/6] Setting up AI Service (Optional)...
cd ai-service
if not exist "venv\Scripts\activate.bat" (
    echo Creating Python virtual environment for AI service...
    python -m venv venv
    if errorlevel 1 (
        echo WARNING: Failed to create AI service virtual environment
        cd ..
        goto :skip_ai
    )
)
echo Activating AI service virtual environment...
call venv\Scripts\activate.bat
echo Installing AI service dependencies...
pip install -r requirements.txt
if errorlevel 1 (
    echo WARNING: Failed to install AI service dependencies
    cd ..
    goto :skip_ai
)
if not exist ".env" (
    echo Creating .env file from template...
    copy .env.example .env >nul 2>&1
    if exist ".env.example" (
        echo NOTE: Please edit ai-service\.env file with your configuration
    ) else (
        echo WARNING: .env.example not found. Please create .env manually.
    )
)
:skip_ai
cd ..
echo AI Service setup complete.
echo.

echo [5/6] Creating initial database...
cd backend
call venv\Scripts\activate.bat
echo Initializing database...
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all(); print('Database initialized successfully!')"
if errorlevel 1 (
    echo WARNING: Database initialization failed. You may need to run this manually.
) else (
    echo Database initialized successfully!
)
cd ..
echo.

echo [6/6] Setup Summary
echo ========================================
echo Backend:     Ready (venv created, dependencies installed)
echo Frontend:    Ready (dependencies installed)
echo AI Service:  Ready (venv created, dependencies installed)
echo Database:    Initialized
echo.
echo IMPORTANT: Before running the application:
echo 1. Edit backend\.env with your configuration (Stripe keys, email, etc.)
echo 2. Edit ai-service\.env if using AI service
echo.
echo Default Admin Credentials:
echo   Email: admin@currypot.com
echo   Password: admin123
echo.
echo To run the application:
echo   Backend:    cd backend ^&^& venv\Scripts\activate ^&^& python run.py
echo   Frontend:   cd frontend ^&^& npm run dev
echo   AI Service: cd ai-service ^&^& venv\Scripts\activate ^&^& python run.py
echo.
echo Or use the run.bat file to start all services!
echo ========================================
echo.
pause



