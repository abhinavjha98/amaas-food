@echo off
echo ========================================
echo Upgrading SQLAlchemy for Python 3.13
echo ========================================
echo.

cd backend

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first or create venv manually.
    cd ..
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Current SQLAlchemy version:
python -c "import sqlalchemy; print('Current version:', sqlalchemy.__version__)" 2>nul || echo "SQLAlchemy not installed or error"

echo.
echo Upgrading pip...
python -m pip install --upgrade pip

echo.
echo Uninstalling old SQLAlchemy...
pip uninstall -y sqlalchemy

echo.
echo Installing SQLAlchemy 2.0.36+ (Python 3.13 compatible)...
pip install "SQLAlchemy>=2.0.36"

echo.
echo Upgrading Werkzeug...
pip install --upgrade "Werkzeug==3.0.3"

echo.
echo Reinstalling all dependencies...
pip install -r requirements.txt --upgrade

echo.
echo Verifying installation...
python -c "import sqlalchemy; print('✓ SQLAlchemy version:', sqlalchemy.__version__)"
python -c "from flask_sqlalchemy import SQLAlchemy; print('✓ Flask-SQLAlchemy imported successfully')"

echo.
echo ========================================
echo Upgrade complete!
echo ========================================
echo.
echo You can now run the backend with:
echo   cd backend
echo   venv\Scripts\activate
echo   python run.py
echo.
cd ..
pause



