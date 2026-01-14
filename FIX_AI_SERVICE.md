# Fix AI Service - Missing Dependencies

## Problem
You're getting `ModuleNotFoundError: No module named 'uvicorn'` when trying to run the AI service.

## Solution

### Option 1: Use the Fix Script (Easiest)

Simply run:
```bash
fix_ai_service.bat
```

This will:
1. Check if the virtual environment exists (create it if not)
2. Activate the virtual environment
3. Install all required dependencies from `requirements.txt`

### Option 2: Manual Installation

If the script doesn't work, run these commands manually:

```bash
cd ai-service
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Option 3: Recreate Virtual Environment

If you're still having issues, recreate the virtual environment:

```bash
cd ai-service
rmdir /s /q venv
python -m venv venv
venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
python run.py
```

## Verify Installation

After installation, verify it worked:

```bash
cd ai-service
venv\Scripts\activate
python -c "import uvicorn; import fastapi; print('✓ Installation successful!')"
```

## Required Packages

The AI service requires:
- `fastapi` - Web framework
- `uvicorn[standard]` - ASGI server
- `pydantic` - Data validation
- `numpy` - Numerical computing
- `scikit-learn` - Machine learning (for future phases)
- `pandas` - Data manipulation (for future phases)
- `requests` - HTTP library
- `python-dotenv` - Environment variables

All these will be installed automatically when you run `pip install -r requirements.txt`.



