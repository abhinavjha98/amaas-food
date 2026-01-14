@echo off
echo ====================================
echo Recreate Database (Development)
echo ====================================
echo.
echo WARNING: This will DELETE all existing data!
echo Press Ctrl+C to cancel, or
pause

cd backend

REM Delete database
if exist "data\currypot.db" (
    echo Deleting existing database...
    del /Q "data\currypot.db"
    echo Database deleted.
) else (
    echo Database not found.
)

REM Create data directory if it doesn't exist
if not exist "data" mkdir data

echo.
echo ====================================
echo Database will be recreated on next run
echo ====================================
echo.
echo Now you can start the backend server:
echo   python run.py
echo.
pause



