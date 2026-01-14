# Curry Pot - Setup Guide

This guide will help you set up the Curry Pot platform locally for development.

## Prerequisites

- **Python 3.11+** - [Download](https://www.python.org/downloads/)
- **Node.js 16+** - [Download](https://nodejs.org/)
- **Git** - [Download](https://git-scm.com/downloads)
- **SQLite3** (included with Python)
- **Stripe Account** (for demo payments) - [Sign up](https://stripe.com)
- **Google Maps API Key** (optional for now) - [Get API Key](https://developers.google.com/maps/documentation)

## Project Structure

```
currypot/
├── backend/           # Flask backend API
├── frontend/          # React frontend
├── ai-service/        # FastAPI AI recommendation microservice
└── data/              # Database files (created automatically)
```

## Step-by-Step Setup

### 1. Clone or Navigate to Project

```bash
cd AmmasFood
```

### 2. Backend Setup

#### 2.1 Navigate to backend directory

```bash
cd backend
```

#### 2.2 Create virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 2.3 Install dependencies

```bash
pip install -r requirements.txt
```

#### 2.4 Create environment file

Create a `.env` file in the `backend/` directory:

```bash
# Copy example file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env` with your configuration:

```env
FLASK_ENV=development
SECRET_KEY=your-secret-key-change-in-production
JWT_SECRET_KEY=your-jwt-secret-key-change-in-production
DATABASE_URL=sqlite:///./data/currypot.db

# Stripe (Demo Mode - use test keys)
STRIPE_PUBLIC_KEY=pk_test_your_stripe_public_key
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key

# Google Maps API (optional for now)
GOOGLE_MAPS_API_KEY=your_google_maps_api_key

# Email Configuration (optional for now)
MAIL_SERVER=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=your_email@gmail.com
MAIL_PASSWORD=your_app_password

# AI Service
AI_SERVICE_URL=http://localhost:8001

PORT=5000
```

#### 2.5 Create data directory

```bash
mkdir -p data
```

#### 2.6 Run backend server

```bash
python run.py
```

The backend will start on `http://localhost:5000`

**Default Admin Credentials:**
- Email: `admin@currypot.com`
- Password: `admin123`

### 3. Frontend Setup

#### 3.1 Navigate to frontend directory

Open a new terminal:

```bash
cd frontend
```

#### 3.2 Install dependencies

```bash
npm install
```

#### 3.3 Run frontend development server

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

### 4. AI Service Setup (Optional)

The AI service is optional but recommended for recommendations.

#### 4.1 Navigate to ai-service directory

Open another terminal:

```bash
cd ai-service
```

#### 4.2 Create virtual environment

**Windows:**
```bash
python -m venv venv
venv\Scripts\activate
```

**Linux/Mac:**
```bash
python3 -m venv venv
source venv/bin/activate
```

#### 4.3 Install dependencies

```bash
pip install -r requirements.txt
```

#### 4.4 Create environment file

```bash
# Copy example file
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env`:

```env
BACKEND_API_URL=http://localhost:5000/api
PORT=8001
```

#### 4.5 Run AI service

```bash
python run.py
```

The AI service will start on `http://localhost:8001`

## Verification

### Backend API

Visit `http://localhost:5000/api/auth/me` (requires authentication) or check:
- `http://localhost:5000/api/dishes` - Should return empty array or dishes list

### Frontend

Visit `http://localhost:3000` - Should show the homepage

### AI Service

Visit `http://localhost:8001/health` - Should return `{"status": "healthy"}`

## Creating Test Data

### Using Python Shell

```bash
cd backend
python

# In Python shell:
from app import create_app, db
from app.models.user import User
from app.models.producer import Producer
from app.models.dish import Dish

app = create_app()
with app.app_context():
    # Create test customer
    customer = User(
        name='Test Customer',
        email='customer@test.com',
        role='customer',
        is_active=True
    )
    customer.set_password('test123')
    db.session.add(customer)
    
    # Create test producer
    producer_user = User(
        name='Test Chef',
        email='chef@test.com',
        role='producer',
        is_active=True
    )
    producer_user.set_password('test123')
    db.session.add(producer_user)
    db.session.commit()
    
    producer = Producer(
        user_id=producer_user.id,
        kitchen_name='Test Kitchen',
        cuisine_specialty='North Indian',
        status='approved',
        is_active=True
    )
    db.session.add(producer)
    db.session.commit()
    
    # Create test dish
    dish = Dish(
        producer_id=producer.id,
        name='Butter Chicken',
        description='Creamy tomato-based curry',
        price=250.0,
        category='Dinner',
        dietary_type='non-veg',
        spice_level='medium',
        is_available=True
    )
    db.session.add(dish)
    db.session.commit()
    
    print('Test data created successfully!')
```

## Common Issues

### Issue: Port already in use

**Solution:** Change the port in `.env` file or kill the process using the port:
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Linux/Mac
lsof -ti:5000 | xargs kill
```

### Issue: Database errors

**Solution:** Delete the database file and recreate:
```bash
cd backend
rm data/currypot.db  # or delete it manually
python run.py  # This will recreate the database
```

### Issue: Module not found errors

**Solution:** Make sure you're in the virtual environment and dependencies are installed:
```bash
pip install -r requirements.txt
```

### Issue: CORS errors in frontend

**Solution:** Make sure backend CORS is enabled (it should be by default). Check `backend/app/__init__.py`

## Development Tips

1. **Backend Hot Reload:** The Flask development server auto-reloads on code changes
2. **Frontend Hot Reload:** Vite auto-reloads on code changes
3. **Database Reset:** Delete `backend/data/currypot.db` to reset the database
4. **API Testing:** Use Postman or curl to test API endpoints
5. **Logs:** Check terminal output for errors and debug information

## Next Steps

1. Set up Stripe test account for payment integration
2. Configure email service (Gmail SMTP or other)
3. Set up Google Maps API for delivery tracking
4. Add more test data for development
5. Start implementing features following the sprint plan

## Support

For issues or questions, refer to:
- README.md for project overview
- API documentation in code comments
- Flask documentation: https://flask.palletsprojects.com/
- React documentation: https://react.dev/

Happy coding! 🍛




