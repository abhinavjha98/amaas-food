#!/bin/bash
# Automated Deployment Script (Non-Interactive)
# Usage: ./deploy-auto.sh <github-repo> <branch> <db-password> <jwt-secret> <vm-ip>

set -e

GITHUB_REPO=${1:-"https://github.com/abhinavjha98/ammas-food.git"}
BRANCH=${2:-"main"}
DB_PASSWORD=${3:-$(openssl rand -base64 16)}
JWT_SECRET_KEY=${4:-$(openssl rand -base64 32)}
VM_IP=${5:-$(hostname -I | awk '{print $1}')}

APP_DIR="/opt/ammas-food"
BACKEND_DIR="$APP_DIR/backend"
FRONTEND_DIR="$APP_DIR/frontend"
DB_NAME="ammasfood"
DB_USER="ammasadmin"

echo "🚀 Starting automated deployment..."
echo "Repository: $GITHUB_REPO"
echo "Branch: $BRANCH"
echo "VM IP: $VM_IP"

# Update system
sudo apt update -qq && sudo apt upgrade -y -qq

# Install dependencies
sudo apt install -y -qq python3.11 python3.11-venv python3-pip \
    postgresql postgresql-contrib nginx git build-essential curl openssl

# Install Node.js
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash - -qq
    sudo apt install -y -qq nodejs
fi

# Setup directories
sudo mkdir -p $APP_DIR
sudo chown $USER:$USER $APP_DIR
cd $APP_DIR

# Clone/Update repository
if [ -d ".git" ]; then
    git fetch origin
    git checkout $BRANCH 2>/dev/null || git checkout -b $BRANCH origin/$BRANCH
    git pull origin $BRANCH
else
    git clone -b $BRANCH $GITHUB_REPO .
fi

# Setup PostgreSQL
sudo -u postgres psql <<EOF > /dev/null 2>&1
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

sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf 2>/dev/null || true
if ! grep -q "host.*all.*all.*0.0.0.0/0.*md5" /etc/postgresql/*/main/pg_hba.conf 2>/dev/null; then
    echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf > /dev/null
fi
sudo systemctl restart postgresql > /dev/null 2>&1

# Setup Backend
cd $BACKEND_DIR
python3.11 -m venv venv
source venv/bin/activate
pip install --quiet --upgrade pip
pip install --quiet -r requirements.txt

cat > .env <<EOF
FLASK_ENV=production
DATABASE_URL=postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME
JWT_SECRET_KEY=$JWT_SECRET_KEY
STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L
STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
SECRET_KEY=$JWT_SECRET_KEY
EOF

export DATABASE_URL="postgresql://$DB_USER:$DB_PASSWORD@localhost:5432/$DB_NAME"
python3 -c "from app import create_app, db; app = create_app('production'); app.app_context().push(); db.create_all()" 2>/dev/null || true

# Create backend service
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
sudo systemctl enable ammas-backend > /dev/null 2>&1
sudo systemctl restart ammas-backend > /dev/null 2>&1

# Setup Frontend
cd $FRONTEND_DIR
npm install --silent
cat > .env.production <<EOF
VITE_API_URL=http://$VM_IP:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
EOF
npm run build --silent

# Configure Nginx
sudo tee /etc/nginx/sites-available/ammas-food > /dev/null <<EOF
server {
    listen 80;
    server_name $VM_IP;

    root $FRONTEND_DIR/dist;
    index index.html;

    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/x-javascript application/xml+rss application/json;

    location / {
        try_files \$uri \$uri/ /index.html;
    }

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

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

sudo ln -sf /etc/nginx/sites-available/ammas-food /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t > /dev/null 2>&1
sudo systemctl restart nginx > /dev/null 2>&1

# Configure firewall
sudo ufw --force enable > /dev/null 2>&1
sudo ufw allow 22/tcp > /dev/null 2>&1
sudo ufw allow 80/tcp > /dev/null 2>&1
sudo ufw allow 443/tcp > /dev/null 2>&1

echo "✅ Deployment complete!"
echo "Frontend: http://$VM_IP"
echo "Backend API: http://$VM_IP/api"
