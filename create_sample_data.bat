@echo off
echo ========================================
echo Creating Sample Data for Curry Pot
echo ========================================
echo.
echo This will create:
echo   - Admin user (if not exists)
echo   - Customer user
echo   - 2 Chef accounts (North Indian and South Indian)
echo   - 13 dishes across both kitchens
echo.
pause

cd backend

if not exist "venv\Scripts\activate.bat" (
    echo ERROR: Virtual environment not found!
    echo Please run setup.bat first.
    cd ..
    pause
    exit /b 1
)

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Running sample data creation script...
python create_sample_data.py

if errorlevel 1 (
    echo.
    echo ERROR: Failed to create sample data!
    echo Please check the error messages above.
    cd ..
    pause
    exit /b 1
)

echo.
cd ..
pause

