# Curry Pot - Home-Cooked Indian Meals Platform

A full-stack food delivery platform connecting customers with home chefs specializing in authentic Indian cuisine.

## 🎯 Project Overview

Curry Pot is a marketplace platform that enables customers to discover, order, and receive home-cooked Indian meals from local home chefs. The platform features AI-driven recommendations, secure payment processing, real-time order tracking, and comprehensive admin management tools.

## 🛠 Tech Stack

### Backend
- **Framework**: Flask (Python 3.11+)
- **ORM**: SQLAlchemy
- **Database**: SQLite3 (dev) → PostgreSQL/MySQL (production)
- **Authentication**: JWT (access + refresh tokens)
- **Password Hashing**: Argon2
- **Payment**: Stripe (demo mode)
- **Maps**: Google Maps API
- **Email**: Flask-Mail (Gmail SMTP)

### Frontend
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Payment**: Stripe.js (React Stripe Elements)

### AI/ML Service
- **Framework**: FastAPI
- **Libraries**: scikit-learn (for future ML features)
- **Recommendations**: Rule-based (Phase 1) → ML-based collaborative filtering (Phase 3)

### Cloud & Deployment
- **Primary**: Azure
- **CI/CD**: Jenkins
- **Optional**: AWS

## 📁 Project Structure

```
currypot/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── models/          # Database models (User, Producer, Dish, Order, Review, Cart)
│   │   ├── routes/          # API endpoints (auth, users, producers, dishes, orders, cart, checkout, admin, ai, reviews)
│   │   └── utils/           # Utilities (auth, validators, email, distance, rate_limiter)
│   ├── data/                # Database files (SQLite)
│   ├── requirements.txt
│   ├── run.py
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable components (Navbar, Footer)
│   │   ├── pages/           # Page components (Home, Login, Catalog, Cart, etc.)
│   │   ├── contexts/        # React contexts (Auth, Cart)
│   │   └── services/        # API service (axios configuration)
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── ai-service/
│   ├── app/
│   │   ├── main.py          # FastAPI application
│   │   └── services/        # Recommendation engine
│   ├── requirements.txt
│   └── run.py
├── README.md
└── SETUP.md
```

## 🚀 Getting Started

### Quick Start (Windows)

**Automated Setup:**
```bash
# Run the automated setup script
setup.bat
```

**Start All Services:**
```bash
# Start backend, frontend, and AI service
run.bat
```

### Quick Start (Linux/Mac)

**Automated Setup:**
```bash
# Make scripts executable (first time only)
chmod +x setup.sh run.sh

# Run the automated setup script
./setup.sh
```

**Start All Services:**
```bash
# Start backend, frontend, and AI service
./run.sh
```

### Manual Setup

For detailed manual setup instructions, see [SETUP.md](./SETUP.md)

### Prerequisites
- Python 3.11+
- Node.js 16+
- SQLite3 (included with Python)
- Stripe account (demo mode) - Optional
- Google Maps API key - Optional

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env with your configuration
mkdir -p data
python run.py
```

Backend runs on `http://localhost:5000`

**Default Admin:**
- Email: `admin@currypot.com`
- Password: `admin123`

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:3000`

### AI Service Setup (Optional)

```bash
cd ai-service
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env  # Edit .env
python run.py
```

AI Service runs on `http://localhost:8001`

## 📚 API Documentation

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user info
- `POST /api/auth/logout` - Logout (client-side token deletion)

### User Endpoints
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `PUT /api/users/preferences` - Update preferences

### Producer Endpoints
- `GET /api/producers` - List all active producers
- `GET /api/producers/<id>` - Get producer details
- `GET /api/producers/profile` - Get current producer profile
- `PUT /api/producers/profile` - Update producer profile
- `GET /api/producers/nearby` - Get nearby producers

### Dish Endpoints
- `GET /api/dishes` - List dishes (with filters)
- `GET /api/dishes/<id>` - Get dish details
- `POST /api/dishes` - Create dish (producer only)
- `PUT /api/dishes/<id>` - Update dish (producer only)
- `DELETE /api/dishes/<id>` - Delete dish (producer only)

### Order Endpoints
- `GET /api/orders` - List orders
- `GET /api/orders/<id>` - Get order details
- `PUT /api/orders/<id>/status` - Update order status (producer/admin)

### Cart Endpoints
- `GET /api/cart` - Get cart
- `POST /api/cart` - Add item to cart
- `PUT /api/cart/<id>` - Update cart item
- `DELETE /api/cart/<id>` - Remove from cart

### Checkout Endpoints
- `POST /api/checkout/create-payment-intent` - Create Stripe payment intent
- `POST /api/checkout/confirm-order` - Confirm order after payment

### Review Endpoints
- `POST /api/reviews` - Create review
- `GET /api/reviews/dish/<id>` - Get dish reviews
- `GET /api/reviews/producer/<id>` - Get producer reviews

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/producers/pending` - Pending producer approvals
- `POST /api/admin/producers/<id>/approve` - Approve producer
- `POST /api/admin/producers/<id>/reject` - Reject producer
- `GET /api/admin/orders` - List all orders
- `GET /api/admin/reports/sales` - Sales report

### AI Endpoints
- `GET /api/ai/recommendations` - Get personalized recommendations
- `GET /api/ai/popular` - Get popular dishes

## 👥 User Roles

### Customer
- Browse and search dishes
- Set dietary preferences
- Add items to cart
- Place orders with payment
- Track orders
- Submit reviews and ratings

### Producer (Home Chef)
- Register and create profile
- Manage menu/dishes
- Accept/reject orders
- Update order status
- Respond to reviews

### Admin
- Approve/reject producers
- Monitor orders and users
- View analytics and reports
- Manage platform operations

## 🔐 Security Features

- JWT-based authentication with refresh tokens
- Argon2 password hashing
- Role-based access control (RBAC)
- HTTPS enforcement (production)
- Input validation and sanitization
- Rate limiting on sensitive endpoints

## 🤖 AI Recommendation System

### Phase 1 (Current): Rule-based
- Filter by dietary preferences
- Spice level matching
- Preferred cuisine matching
- Popularity-based ranking

### Phase 2 (Future): Feedback-based
- User review analysis
- Purchase history tracking
- Collaborative filtering

### Phase 3 (Future): Machine Learning
- Collaborative filtering model
- Content-based filtering
- Hybrid recommendation system

## 📊 Database Schema

Key tables:
- `users` - Customer, producer, admin accounts
- `producers` - Home chef profiles
- `dishes` - Menu items
- `orders` - Order records
- `order_items` - Order line items
- `reviews` - Ratings and feedback
- `cart_items` - Shopping cart items

## 🧪 Testing

```bash
# Backend tests
cd backend
pytest

# Frontend tests
cd frontend
npm test
```

## 📝 Environment Variables

### Backend (.env)
See `backend/.env.example` for required environment variables:
- `FLASK_ENV` - Environment (development/production)
- `SECRET_KEY` - Flask secret key
- `JWT_SECRET_KEY` - JWT signing key
- `DATABASE_URL` - Database connection string
- `STRIPE_PUBLIC_KEY` / `STRIPE_SECRET_KEY` - Stripe API keys (demo mode)
- `GOOGLE_MAPS_API_KEY` - Google Maps API key
- `MAIL_*` - Email configuration
- `AI_SERVICE_URL` - AI microservice URL

### Frontend
No environment variables needed for basic setup. Configured via `vite.config.js`.

### AI Service (.env)
See `ai-service/.env.example`:
- `BACKEND_API_URL` - Backend API URL
- `PORT` - Service port (default: 8001)

## 🚢 Deployment

### Development
- SQLite database
- Local Flask server
- React dev server

### Production
- PostgreSQL/MySQL database
- Gunicorn/uWSGI
- Nginx reverse proxy
- React production build
- Azure App Service / AWS Elastic Beanstalk

## 📅 Development Timeline

- **Phase 0**: Research & Planning ✅
- **Phase 1**: Planning / Ideation ✅
- **Phase 2**: Development (Nov 10 - Dec 21, 2025)
  - Sprint 1: Core architecture & authentication
  - Sprint 2: Producer CRUD, cart, checkout, AI, orders
- **Phase 3**: Testing (Dec 22 - Jan 5, 2026)
- **Phase 4**: Deployment (Jan 6 - Jan 10, 2026)
- **Phase 5**: Maintenance (Jan 11 - Jan 15, 2026)

## 🤝 Contributing

This is a project for learning and portfolio purposes. Contributions are welcome!

## 📄 License

[Your License Here]

## 👤 Contact

[Your Contact Information]

---

**Note**: This project is in active development. Some features may not be fully implemented yet.

"# amaas-food" 
