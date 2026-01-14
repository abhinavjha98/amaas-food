@echo off
echo Quick Fix: Installing AI Service Dependencies
echo ============================================
echo.

cd ai-service

echo Step 1: Activating virtual environment...
call venv\Scripts\activate.bat

echo.
echo Step 2: Installing packages...
pip install fastapi uvicorn[standard] pydantic numpy scikit-learn pandas requests python-dotenv

echo.
echo Step 3: Verifying...
python -c "import uvicorn; import fastapi; print('SUCCESS! uvicorn and fastapi installed.')" 2>nul || (
    echo ERROR: Installation failed. Trying alternative method...
    pip install --upgrade pip
    pip install -r requirements.txt
)

echo.
echo Done! Try running: python run.py
echo.
cd ..
pause



