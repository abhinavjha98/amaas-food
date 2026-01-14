@echo off
cd ai-service

echo Activating virtual environment...
call venv\Scripts\activate.bat

echo Installing AI service dependencies...
pip install -r requirements.txt

echo.
echo Installation complete! You can now run the AI service with:
echo   cd ai-service
echo   venv\Scripts\activate
echo   python run.py

cd ..
pause



