# Deploy Everything on One Azure VM

Yes! You can deploy your entire stack (backend, frontend, database) on a single Azure VM. This is simpler and can be more cost-effective.

## 🎯 What You'll Deploy

- **Backend (Flask)** - Running on port 5000
- **Frontend (React)** - Running on port 3000 (or 80 with nginx)
- **Database (PostgreSQL)** - Running on port 5432
- **Nginx** (optional) - Reverse proxy for frontend

## 💰 Cost Comparison

### Container Apps (Current):
- Container Apps Environment: ~£0.01/hour
- Container Apps (2 apps): ~£0.000012/vCPU-second
- ACR: ~£3/month
- Database: ~£20/month
- **Total: ~£25-30/month**

### Single VM:
- **VM (B2s - 2 vCPU, 4GB RAM)**: ~£15-20/month
- **No separate database** (PostgreSQL on VM)
- **No ACR needed** (build locally or on VM)
- **Total: ~£15-20/month** ✅

## 📋 Step 1: Create Azure VM

### Option A: Using Azure Portal

1. **Go to Azure Portal** → "Create a resource"
2. **Search for "Virtual Machine"**
3. **Click "Create"**
4. **Fill in:**
   - **Subscription**: Your subscription
   - **Resource Group**: `ammas-food-rg` (or create new)
   - **VM name**: `ammas-food-vm`
   - **Region**: UK South (or closest)
   - **Image**: **Ubuntu Server 22.04 LTS** (recommended)
   - **Size**: **Standard_B2s** (2 vCPU, 4GB RAM) - cheapest for production
   - **Authentication type**: **SSH public key** (recommended) or Password
   - **Username**: `azureuser` (or your choice)
   - **SSH key**: Generate or use existing
   - **Public inbound ports**: **Allow selected ports** → **SSH (22)**
5. **Click "Review + create"** → **"Create"**

### Option B: Using Azure CLI

```bash
# Set variables
RESOURCE_GROUP="ammas-food-rg"
VM_NAME="ammas-food-vm"
LOCATION="uksouth"
VM_SIZE="Standard_B2s"  # 2 vCPU, 4GB RAM
ADMIN_USERNAME="azureuser"

# Create resource group if needed
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create VM
az vm create \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --image Ubuntu2204 \
  --size $VM_SIZE \
  --admin-username $ADMIN_USERNAME \
  --generate-ssh-keys \
  --public-ip-sku Standard

# Open ports (HTTP, HTTPS, and your app ports)
az vm open-port \
  --port 80,443,3000,5000 \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME
```

## 📋 Step 2: Connect to VM

### Get VM IP Address

```bash
az vm show \
  --resource-group $RESOURCE_GROUP \
  --name $VM_NAME \
  --show-details \
  --query publicIps \
  --output tsv
```

### SSH into VM

```bash
ssh azureuser@<VM_IP_ADDRESS>
```

Or from Windows (using PowerShell or WSL):
```bash
ssh azureuser@<VM_IP_ADDRESS>
```

## 📋 Step 3: Install Dependencies on VM

Once connected to the VM, run:

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python 3.11
sudo apt install -y python3.11 python3.11-venv python3-pip

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx (for reverse proxy)
sudo apt install -y nginx

# Install Git
sudo apt install -y git

# Install other utilities
sudo apt install -y build-essential
```

## 📋 Step 4: Set Up PostgreSQL Database

```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL prompt:
CREATE DATABASE ammasfood;
CREATE USER ammasadmin WITH PASSWORD 'YourStrongPassword123!';
GRANT ALL PRIVILEGES ON DATABASE ammasfood TO ammasadmin;
\q

# Configure PostgreSQL to accept connections
sudo nano /etc/postgresql/14/main/postgresql.conf
# Find: #listen_addresses = 'localhost'
# Change to: listen_addresses = '*'

# Configure pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf
# Add line: host    all             all             0.0.0.0/0               md5

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## 📋 Step 5: Deploy Backend

```bash
# Create app directory
sudo mkdir -p /opt/ammas-food
sudo chown $USER:$USER /opt/ammas-food
cd /opt/ammas-food

# Clone your repository (or upload files)
git clone https://github.com/abhinavjha98/ammas-backend.git backend
# Or use scp to upload files from your local machine

cd backend

# Create virtual environment
python3.11 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
nano .env
```

**Add to `.env`:**
```env
FLASK_ENV=production
DATABASE_URL=postgresql://ammasadmin:YourStrongPassword123!@localhost:5432/ammasfood
JWT_SECRET_KEY=your-super-secret-jwt-key-here
STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L
STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
```

**Initialize database:**
```bash
# Run migrations or create tables
python3 -c "from app import create_app, db; app = create_app('production'); app.app_context().push(); db.create_all()"
```

**Create systemd service for backend:**
```bash
sudo nano /etc/systemd/system/ammas-backend.service
```

**Add:**
```ini
[Unit]
Description=Ammas Food Backend
After=network.target postgresql.service

[Service]
Type=simple
User=azureuser
WorkingDirectory=/opt/ammas-food/backend
Environment="PATH=/opt/ammas-food/backend/venv/bin"
ExecStart=/opt/ammas-food/backend/venv/bin/gunicorn --bind 0.0.0.0:5000 --workers 2 --threads 2 wsgi:app
Restart=always

[Install]
WantedBy=multi-user.target
```

**Start backend:**
```bash
sudo systemctl daemon-reload
sudo systemctl enable ammas-backend
sudo systemctl start ammas-backend
sudo systemctl status ammas-backend
```

## 📋 Step 6: Deploy Frontend

```bash
cd /opt/ammas-food

# Clone or upload frontend
git clone https://github.com/abhinavjha98/ammas-frontend.git frontend
# Or use scp to upload

cd frontend

# Install dependencies
npm install

# Create .env.production
nano .env.production
```

**Add to `.env.production`:**
```env
VITE_API_URL=http://<VM_IP>:5000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
```

**Build frontend:**
```bash
npm run build
```

**Set up Nginx to serve frontend:**
```bash
sudo nano /etc/nginx/sites-available/ammas-food
```

**Add:**
```nginx
server {
    listen 80;
    server_name <VM_IP>;  # Or your domain

    # Serve frontend
    root /opt/ammas-food/frontend/dist;
    index index.html;

    # React Router - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests to backend
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**Enable site:**
```bash
sudo ln -s /etc/nginx/sites-available/ammas-food /etc/nginx/sites-enabled/
sudo nginx -t  # Test configuration
sudo systemctl restart nginx
```

## 📋 Step 7: Configure Firewall

```bash
# Allow HTTP, HTTPS, and your ports
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw allow 5000/tcp # Backend (if needed)
sudo ufw enable
```

## 📋 Step 8: Set Up SSL (Optional but Recommended)

Use Let's Encrypt for free SSL:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

## 🔄 Updating Your Application

### Update Backend:

```bash
cd /opt/ammas-food/backend
git pull  # Or upload new files
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ammas-backend
```

### Update Frontend:

```bash
cd /opt/ammas-food/frontend
git pull  # Or upload new files
npm install
npm run build
sudo systemctl restart nginx
```

## 📊 Monitoring

### Check Backend Logs:
```bash
sudo journalctl -u ammas-backend -f
```

### Check Nginx Logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Check System Resources:
```bash
htop  # Install: sudo apt install htop
df -h  # Disk usage
free -h  # Memory usage
```

## 🔒 Security Best Practices

1. **Change default SSH port** (optional):
   ```bash
   sudo nano /etc/ssh/sshd_config
   # Change: Port 22 to Port 2222
   sudo systemctl restart sshd
   ```

2. **Set up fail2ban** (protect against brute force):
   ```bash
   sudo apt install -y fail2ban
   sudo systemctl enable fail2ban
   sudo systemctl start fail2ban
   ```

3. **Keep system updated**:
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

4. **Use strong passwords** for database and services

5. **Configure firewall** (already done above)

6. **Set up automatic backups** for database

## 💾 Database Backups

### Manual Backup:
```bash
sudo -u postgres pg_dump ammasfood > backup_$(date +%Y%m%d).sql
```

### Automated Daily Backups:
```bash
# Create backup script
nano ~/backup_db.sh
```

**Add:**
```bash
#!/bin/bash
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR
sudo -u postgres pg_dump ammasfood > $BACKUP_DIR/ammasfood_$(date +%Y%m%d_%H%M%S).sql
# Keep only last 7 days
find $BACKUP_DIR -name "ammasfood_*.sql" -mtime +7 -delete
```

**Make executable and add to crontab:**
```bash
chmod +x ~/backup_db.sh
crontab -e
# Add: 0 2 * * * /home/azureuser/backup_db.sh
```

## 🚀 Quick Start Script

I can create an automated setup script. Would you like me to create one?

## 📝 Summary

**Advantages of Single VM:**
- ✅ Simpler deployment
- ✅ Lower cost (~£15-20/month vs £25-30/month)
- ✅ Full control
- ✅ Easier debugging
- ✅ No container complexity

**Disadvantages:**
- ⚠️ Single point of failure
- ⚠️ Manual scaling (need bigger VM)
- ⚠️ More maintenance
- ⚠️ Need to manage updates yourself

**Recommendation:**
- **Start with VM** for cost savings and simplicity
- **Move to Container Apps** later if you need auto-scaling or high availability

---

**Your app will be accessible at:** `http://<VM_IP>` or `http://yourdomain.com`
