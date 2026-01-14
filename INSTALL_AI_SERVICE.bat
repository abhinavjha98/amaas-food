@echo off
echo ========================================
echo Installing AI Service Dependencies
echo ========================================
echo.

cd ai-service

if not exist "venv" (
    echo Creating virtual environment...
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

echo.
echo Installing dependencies from requirements.txt...
pip install -r requirements.txt

if errorlevel 1 (
    echo ERROR: Failed to install dependencies
    echo.
    echo Trying to install packages individually...
    pip install fastapi uvicorn[standard] pydantic numpy scikit-learn pandas requests python-dotenv
)

echo.
echo Verifying installation...
python -c "import uvicorn; print('✓ uvicorn installed successfully')" 2>nul || echo "ERROR: uvicorn not found"
python -c "import fastapi; print('✓ fastapi installed successfully')" 2>nul || echo "ERROR: fastapi not found"

echo.
echo ========================================
echo Installation Complete!
echo ========================================
echo.
echo You can now run the AI service with:
echo   cd ai-service
echo   venv\Scripts\activate
echo   python run.py
echo.
echo Or use: run.bat (to start all services)
echo.

cd ..
pause



