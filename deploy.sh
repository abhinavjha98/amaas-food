#!/bin/bash
# One-Click Deployment Script for Ammas Food
# This script will install and deploy everything automatically
# Usage: ./deploy.sh <github-repo-url> <branch-name>

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
GITHUB_REPO=${1:-"https://github.com/abhinavjha98/ammas-food.git"}
BRANCH=${2:-"main"}
APP_DIR="/opt/ammas-food"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DB_NAME="ammasfood"
DB_USER="ammasadmin"

echo -e "${BLUE}=========================================="
echo "Ammas Food - One-Click Deployment"
echo "==========================================${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as regular user.${NC}"
   exit 1
fi

# Function to print step
print_step() {
    echo -e "${GREEN}[$1] $2${NC}"
}

# Function to prompt for input
prompt_input() {
    local prompt=$1
    local var_name=$2
    local is_secret=${3:-false}
    
    if [ "$is_secret" = true ]; then
        read -sp "$prompt: " input
        echo ""
    else
        read -p "$prompt: " input
    fi
    eval "$var_name='$input'"
}

# Get configuration
echo -e "${YELLOW}Configuration:${NC}"
prompt_input "GitHub Repository URL" GITHUB_REPO
prompt_input "Branch name" BRANCH
prompt_input "Database password for $DB_USER" DB_PASSWORD true
prompt_input "JWT Secret Key (or press Enter to generate)" JWT_SECRET_KEY true

# Generate JWT secret if not provided
if [ -z "$JWT_SECRET_KEY" ]; then
    JWT_SECRET_KEY=$(openssl rand -base64 32)
    echo -e "${GREEN}Generated JWT Secret Key${NC}"
fi

# Get VM IP or domain
prompt_input "VM IP address or domain (for API URL)" VM_IP
if [ -z "$VM_IP" ]; then
    VM_IP=$(hostname -I | awk '{print $1}')
    echo -e "${YELLOW}Using detected IP: $VM_IP${NC}"
fi

print_step "1/12" "Updating system packages..."
sudo apt update && sudo apt upgrade -y

print_step "2/12" "Installing system dependencies..."
sudo apt install -y python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib nginx git build-essential \
    curl openssl

print_step "3/12" "Installing Node.js 18..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
fi

print_step "4/12" "Creating application directory..."
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

print_step "5/12" "Cloning repository from GitHub..."
if [ -d ".git" ]; then
    echo -e "${YELLOW}Repository already exists, pulling latest changes...${NC}"
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH origin/$BRANCH
    git pull origin $BRANCH
else
    git clone -b $BRANCH $GITHUB_REPO .
fi

print_step "6/12" "Setting up PostgreSQL database..."
# Create database and user
sudo -u postgres psql <<EOF
DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_database WHERE datname = '$DB_NAME') THEN
        CREATE DATABASE $DB_NAME;
    END IF;
END
\$\$;

DO \$\$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_user WHERE usename = '$DB_USER') THEN
        CREATE USER $DB_USER WITH PASSWORD '$DB_PASSWORD';
    END IF;
END
\$\$;

GRANT ALL PRIVILEGES ON DATABASE $DB_NAME TO $DB_USER;
\q
EOF

# Configure PostgreSQL
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf 2>/dev/null || true
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
fi
sudo systemctl restart postgresql
sudo systemctl enable postgresql

print_step "7/12" "Setting up Backend..."
cd $BACKEND_DIR

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Create .env file
cat > .env <<EOF
FLASK_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET_KEY=$JWT_SECRET_KEY
STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L
STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
SECRET_KEY=$JWT_SECRET_KEY
EOF

# Initialize database
print_step "8/12" "Initializing database..."
export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
python3 -c "
from app import create_app, db
app = create_app('production')
with app.app_context():
    db.create_all()
    print('Database tables created successfully')
"

# Create systemd service for backend
print_step "9/12" "Creating backend service..."
sudo tee /etc/systemd/system/ammas-backend.service > /dev/null <<EOF
[Unit]
Description=Ammas Food Backend
After=network.target postgresql.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$BACKEND_DIR
Environment="PATH=$BACKEND_DIR/venv/bin"
Environment="DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
Environment="JWT_SECRET_KEY=$JWT_SECRET_KEY"
Environment="STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L"
Environment="STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4"
Environment="FLASK_ENV=production"
ExecStart=$BACKEND_DIR/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 2 --timeout 600 wsgi:app
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

sudo systemctl daemon-reload
sudo systemctl enable ammas-backend
sudo systemctl start ammas-backend

# Wait for backend to start
sleep 5
if sudo systemctl is-active --quiet ammas-backend; then
    echo -e "${GREEN}Backend service started successfully${NC}"
else
    echo -e "${RED}Backend service failed to start. Check logs: sudo journalctl -u ammas-backend${NC}"
fi

print_step "10/12" "Setting up Frontend..."
cd $FRONTEND_DIR

# Install dependencies
npm install

# Create .env.production
cat > .env.production <<EOF
VITE_API_URL=http://$VM_IP:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
EOF

# Build frontend
npm run build

print_step "11/12" "Configuring Nginx..."
sudo tee /etc/nginx/sites-available/ammas-food > /dev/null <<EOF
server {
    listen 80;
    server_name $VM_IP;

    # Serve frontend
    root $FRONTEND_DIR/dist;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    # React Router - serve index.html for all routes
    location / {
        try_files \$uri \$uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/ammas-food /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

print_step "12/12" "Configuring firewall..."
sudo ufw --force enable
sudo ufw allow 22/tcp   # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw allow 5000/tcp  # Backend (if needed for direct access)

# Summary
echo ""
echo -e "${GREEN}=========================================="
echo "✅ Deployment Complete!"
echo "==========================================${NC}"
echo ""
echo -e "${YELLOW}Application URLs:${NC}"
echo "  Frontend: http://$VM_IP"
echo "  Backend API: http://$VM_IP/api"
echo "  Health Check: http://$VM_IP/api/auth/health"
echo ""
echo -e "${YELLOW}Service Status:${NC}"
sudo systemctl status ammas-backend --no-pager -l
echo ""
echo -e "${YELLOW}Useful Commands:${NC}"
echo "  Backend logs: sudo journalctl -u ammas-backend -f"
echo "  Nginx logs: sudo tail -f /var/log/nginx/access.log"
echo "  Restart backend: sudo systemctl restart ammas-backend"
echo "  Restart nginx: sudo systemctl restart nginx"
echo ""
echo -e "${YELLOW}Database Info:${NC}"
echo "  Database: $DB_NAME"
echo "  User: $DB_USER"
echo "  Connection: postgresql://$DB_USER:***@localhost:5432/$DB_NAME"
echo ""
echo -e "${GREEN}Your application is now live! 🚀${NC}"
