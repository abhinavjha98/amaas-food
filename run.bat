@echo off
echo ========================================
echo Curry Pot - Start All Services
echo ========================================
echo.
echo Starting services in separate windows...
echo.

:: Start Backend
echo Starting Backend (Flask) on http://localhost:5000...
start "Curry Pot - Backend" cmd /k "cd backend && venv\Scripts\activate && python run.py"
timeout /t 3 /nobreak >nul

:: Start Frontend
echo Starting Frontend (React) on http://localhost:3000...
start "Curry Pot - Frontend" cmd /k "cd frontend && npm run dev"
timeout /t 3 /nobreak >nul

:: Start AI Service (Optional)
echo Starting AI Service (FastAPI) on http://localhost:8001...
if exist "ai-service\venv\Scripts\activate.bat" (
    start "Curry Pot - AI Service" cmd /k "cd ai-service && venv\Scripts\activate && python run.py"
) else (
    echo WARNING: AI Service not set up. Run setup.bat first or skip AI service.
)

echo.
echo ========================================
echo All services are starting!
echo.
echo Backend:    http://localhost:5000
echo Frontend:   http://localhost:3000
echo AI Service: http://localhost:8001
echo.
echo Press any key to exit this window...
echo (The service windows will remain open)
echo ========================================
pause >nul



