# One-Click Deployment Guide

Deploy your entire Ammas Food application to an Azure VM with a single command!

## 🚀 Quick Start

### Step 1: Create Azure VM

1. Go to [Azure Portal](https://portal.azure.com)
2. Create a Virtual Machine:
   - **Image**: Ubuntu Server 22.04 LTS
   - **Size**: Standard_B2s (2 vCPU, 4GB RAM) - ~£15-20/month
   - **Authentication**: SSH public key (recommended)
   - **Public inbound ports**: SSH (22)

### Step 2: Connect to VM

```bash
# Get VM IP address
az vm show \
  --resource-group ammas-food-rg \
  --name ammas-food-vm \
  --show-details \
  --query publicIps \
  --output tsv

# SSH into VM
ssh azureuser@<VM_IP_ADDRESS>
```

### Step 3: Run Deployment Script

```bash
# Download the deployment script
curl -o deploy.sh https://raw.githubusercontent.com/abhinavjha98/ammas-food/main/deploy.sh
# OR if you have the file locally, upload it using scp:
# scp deploy.sh azureuser@<VM_IP>:/home/azureuser/

# Make it executable
chmod +x deploy.sh

# Run the deployment (it will prompt for inputs)
./deploy.sh
```

Or with parameters:
```bash
./deploy.sh https://github.com/abhinavjha98/ammas-food.git main
```

## 📋 What the Script Does

The deployment script automatically:

1. ✅ Updates system packages
2. ✅ Installs Python 3.11, Node.js 18, PostgreSQL, Nginx
3. ✅ Clones your code from GitHub
4. ✅ Sets up PostgreSQL database
5. ✅ Configures backend with environment variables
6. ✅ Creates systemd service for backend
7. ✅ Builds frontend
8. ✅ Configures Nginx as reverse proxy
9. ✅ Sets up firewall rules
10. ✅ Starts all services

## 🔧 Configuration Prompts

When you run the script, it will ask for:

1. **GitHub Repository URL** - Your repo URL (default: provided)
2. **Branch name** - Branch to deploy (default: main)
3. **Database password** - Password for PostgreSQL user
4. **JWT Secret Key** - Secret key (or press Enter to auto-generate)
5. **VM IP address** - Your VM's IP (or press Enter to auto-detect)

## 📁 Project Structure Expected

Your GitHub repository should have this structure:

```
ammas-food/
├── backend/
│   ├── app/
│   ├── wsgi.py
│   ├── requirements.txt
│   └── Dockerfile (optional)
├── frontend/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
└── deploy.sh (this script)
```

## 🔄 Updating Your Application

### Option 1: Re-run Deployment Script

```bash
cd /opt/ammas-food
./deploy.sh https://github.com/abhinavjha98/ammas-food.git main
```

### Option 2: Manual Update

```bash
# Update backend
cd /opt/ammas-food/backend
git pull origin main
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart ammas-backend

# Update frontend
cd /opt/ammas-food/frontend
git pull origin main
npm install
npm run build
sudo systemctl restart nginx
```

## 🛠️ Troubleshooting

### Backend Not Starting

```bash
# Check logs
sudo journalctl -u ammas-backend -f

# Check status
sudo systemctl status ammas-backend

# Restart service
sudo systemctl restart ammas-backend
```

### Frontend Not Loading

```bash
# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### Database Connection Issues

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Test connection
psql -U ammasadmin -d ammasfood -h localhost
```

## 📊 Monitoring

### Check Service Status

```bash
# All services
sudo systemctl status ammas-backend nginx postgresql

# Backend logs
sudo journalctl -u ammas-backend -f

# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# System resources
htop
```

## 🔒 Security

### Set Up SSL (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

### Firewall

The script automatically configures UFW firewall. To add more rules:

```bash
sudo ufw allow <port>/tcp
sudo ufw reload
```

## 💾 Backups

### Database Backup

```bash
# Manual backup
sudo -u postgres pg_dump ammasfood > backup_$(date +%Y%m%d).sql

# Restore
sudo -u postgres psql ammasfood < backup_20250114.sql
```

### Automated Daily Backups

Add to crontab:
```bash
crontab -e
# Add: 0 2 * * * sudo -u postgres pg_dump ammasfood > /opt/backups/ammasfood_$(date +\%Y\%m\%d).sql
```

## 📝 Environment Variables

The script automatically creates `.env` file with:
- `DATABASE_URL` - PostgreSQL connection
- `JWT_SECRET_KEY` - JWT secret
- `STRIPE_SECRET_KEY` - Stripe secret key
- `STRIPE_PUBLIC_KEY` - Stripe public key
- `FLASK_ENV` - Set to production

## 🎯 Next Steps

1. **Set up domain** (optional) - Point your domain to VM IP
2. **Configure SSL** - Use Let's Encrypt for HTTPS
3. **Set up monitoring** - Use Azure Monitor or custom solution
4. **Configure backups** - Set up automated database backups
5. **Set up CI/CD** - Use GitHub Actions to auto-deploy on push

## 📞 Support

If you encounter issues:
1. Check service logs: `sudo journalctl -u ammas-backend -f`
2. Check Nginx logs: `sudo tail -f /var/log/nginx/error.log`
3. Verify environment variables in `/opt/ammas-food/backend/.env`
4. Check database connection: `psql -U ammasadmin -d ammasfood`

---

**Your application will be live at:** `http://<VM_IP>` 🚀
