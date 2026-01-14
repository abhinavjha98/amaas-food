@echo off
echo ========================================
echo Fix AI Service - Install Dependencies
echo ========================================
echo.

cd ai-service

if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment for AI service...
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

echo Upgrading pip...
python -m pip install --upgrade pip

echo Installing AI service dependencies...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    cd ..
    pause
    exit /b 1
)

echo.
echo Verifying installation...
python -c "import uvicorn; import fastapi; print('✓ uvicorn:', uvicorn.__version__); print('✓ fastapi:', fastapi.__version__)"

echo.
echo ========================================
echo AI Service dependencies installed!
echo ========================================
echo.
echo You can now run the AI service with:
echo   cd ai-service
echo   venv\Scripts\activate
echo   python run.py
echo.
cd ..
pause



