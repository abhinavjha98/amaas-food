#!/bin/bash
# Automated setup script for Azure VM deployment
# Run this script on your Azure VM after connecting via SSH

set -e  # Exit on error

echo "=========================================="
echo "Ammas Food - VM Setup Script"
echo "=========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
   echo -e "${RED}Please do not run as root. Run as regular user.${NC}"
   exit 1
fi

echo -e "${GREEN}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

echo -e "${GREEN}[2/8] Installing Python 3.11...${NC}"
sudo apt install -y python3.11 python3.11-venv python3-pip

echo -e "${GREEN}[3/8] Installing Node.js 18...${NC}"
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

echo -e "${GREEN}[4/8] Installing PostgreSQL...${NC}"
sudo apt install -y postgresql postgresql-contrib

echo -e "${GREEN}[5/8] Installing Nginx...${NC}"
sudo apt install -y nginx

echo -e "${GREEN}[6/8] Installing Git and build tools...${NC}"
sudo apt install -y git build-essential

echo -e "${GREEN}[7/8] Setting up PostgreSQL database...${NC}"
# Prompt for database password
read -sp "Enter database password for 'ammasadmin' user: " DB_PASSWORD
echo ""

# Create database and user
sudo -u postgres psql <<EOF
CREATE DATABASE ammasfood;
CREATE USER ammasadmin WITH PASSWORD '$DB_PASSWORD';
GRANT ALL PRIVILEGES ON DATABASE ammasfood TO ammasadmin;
\q
EOF

# Configure PostgreSQL
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf
sudo systemctl restart postgresql

echo -e "${GREEN}[8/8] Creating application directory...${NC}"
sudo mkdir -p /opt/ammas-food
sudo chown $USER:$USER /opt/ammas-food

echo ""
echo -e "${GREEN}✅ System setup complete!${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clone or upload your backend code to /opt/ammas-food/backend"
echo "2. Clone or upload your frontend code to /opt/ammas-food/frontend"
echo "3. Follow the deployment steps in AZURE_VM_DEPLOYMENT_GUIDE.md"
echo ""
echo -e "${YELLOW}Database connection string:${NC}"
echo "postgresql://ammasadmin:$DB_PASSWORD@localhost:5432/ammasfood"
echo ""
