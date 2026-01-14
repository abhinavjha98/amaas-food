# Curry Pot - Quick Start Guide

## 🚀 Automated Setup (Recommended)

### Windows

1. **Run Setup Script:**
   ```bash
   setup.bat
   ```
   This will:
   - Create Python virtual environments
   - Install all dependencies (backend, frontend, AI service)
   - Create .env files from templates
   - Initialize the database

2. **Configure Environment Variables:**
   - Edit `backend/.env` with your Stripe keys, email config, etc.
   - Edit `ai-service/.env` if using AI service

3. **Start All Services:**
   ```bash
   run.bat
   ```
   This opens separate windows for:
   - Backend (http://localhost:5000)
   - Frontend (http://localhost:3000)
   - AI Service (http://localhost:8001)

### Linux/Mac

1. **Make Scripts Executable (first time only):**
   ```bash
   chmod +x setup.sh run.sh
   ```

2. **Run Setup Script:**
   ```bash
   ./setup.sh
   ```

3. **Configure Environment Variables:**
   - Edit `backend/.env` with your configuration
   - Edit `ai-service/.env` if using AI service

4. **Start All Services:**
   ```bash
   ./run.sh
   ```

## 📝 After Setup

### Default Admin Login
- **Email:** `admin@currypot.com`
- **Password:** `admin123`

### Access URLs
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000/api
- **AI Service:** http://localhost:8001 (optional)

## 🔧 Manual Steps (If Scripts Don't Work)

### Backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your config
python run.py
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

### AI Service (Optional)
```bash
cd ai-service
python -m venv venv
venv\Scripts\activate  # Windows
# or: source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt
cp .env.example .env  # Edit .env
python run.py
```

## ⚠️ Troubleshooting

### Port Already in Use
If a port is already in use, you can:
- Change the port in the `.env` file (backend) or `vite.config.js` (frontend)
- Kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  
  # Linux/Mac
  lsof -ti:5000 | xargs kill
  ```

### Module Not Found
Make sure you've activated the virtual environment:
```bash
# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### Database Issues
Delete and recreate the database:
```bash
cd backend
rm data/currypot.db  # or delete manually
python -c "from app import create_app, db; app = create_app(); app.app_context().push(); db.create_all()"
```

## 📚 Next Steps

1. **Create Test Data:** Use the Python shell script in SETUP.md
2. **Configure Stripe:** Add your Stripe test keys to `backend/.env`
3. **Configure Email:** Add Gmail SMTP credentials to `backend/.env`
4. **Start Developing:** Check the sprint plan in the main README.md

## 🆘 Need Help?

- See [SETUP.md](./SETUP.md) for detailed instructions
- See [README.md](./README.md) for project overview and API documentation
- Check backend logs for errors
- Verify all environment variables are set correctly

Happy coding! 🍛



