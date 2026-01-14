@echo off
echo ========================================
echo Fix Python 3.13 Compatibility Issue
echo ========================================
echo.
echo This script will upgrade SQLAlchemy and dependencies
echo to versions compatible with Python 3.13
echo.

cd backend
if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Backend virtual environment not found!
    echo Please run setup.bat first.
    cd ..
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Upgrading pip...
python -m pip install --upgrade pip

echo Upgrading SQLAlchemy and dependencies...
pip install --upgrade SQLAlchemy>=2.0.36 Werkzeug==3.0.3

echo Reinstalling all dependencies...
pip install -r requirements.txt --upgrade

echo Verifying SQLAlchemy version...
python -c "import sqlalchemy; print('SQLAlchemy version:', sqlalchemy.__version__)"

echo.
echo ========================================
echo Fix complete!
echo ========================================
echo.
echo SQLAlchemy has been upgraded to support Python 3.13.
echo You can now run: python run.py
echo.
cd ..
pause



