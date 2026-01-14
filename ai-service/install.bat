@echo off
cd /d "%~dp0"
echo Installing AI Service Dependencies...
echo.

if not exist "venv\Scripts\activate.bat" (
    echo Creating virtual environment...
    python -m venv venv
)

call venv\Scripts\activate.bat
python -m pip install --upgrade pip
pip install -r requirements.txt

echo.
echo Installation complete!
echo.
echo To run the AI service:
echo   1. Activate: venv\Scripts\activate
echo   2. Run: python run.py
echo.
pause



