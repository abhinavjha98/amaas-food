@echo off
echo ====================================
echo Database Migration Fix
echo ====================================
echo.

cd backend

REM Check if database exists
if exist "data\currypot.db" (
    echo Database found. Migrating...
    echo.
    python migrate_database.py
    echo.
    echo Migration complete!
) else (
    echo Database not found. It will be created automatically on next run.
    echo Creating data directory...
    if not exist "data" mkdir data
)

echo.
echo ====================================
echo Fix Complete!
echo ====================================
echo.
echo You can now run the backend server:
echo   python run.py
echo.
pause



