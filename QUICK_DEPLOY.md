# 🚀 One-Click Deployment - Quick Guide

Deploy your entire Ammas Food application in minutes!

## Prerequisites

1. **Azure VM** (Ubuntu 22.04)
2. **SSH access** to the VM
3. **GitHub repository** with your code

## Quick Start (3 Steps)

### Step 1: Create Azure VM

```bash
az vm create \
  --resource-group ammas-food-rg \
  --name ammas-food-vm \
  --image Ubuntu2204 \
  --size Standard_B2s \
  --admin-username azureuser \
  --generate-ssh-keys \
  --public-ip-sku Standard
```

### Step 2: Upload Deployment Script

```bash
# Get VM IP
VM_IP=$(az vm show --resource-group ammas-food-rg --name ammas-food-vm --show-details --query publicIps --output tsv)

# Upload script
scp deploy.sh azureuser@$VM_IP:/home/azureuser/
```

### Step 3: Run Deployment

```bash
# SSH into VM
ssh azureuser@$VM_IP

# Make script executable
chmod +x deploy.sh

# Run deployment (interactive - will prompt for inputs)
./deploy.sh
```

Or non-interactive:
```bash
./deploy-auto.sh https://github.com/abhinavjha98/ammas-food.git main
```

## What Gets Installed

✅ Python 3.11 + Flask backend  
✅ Node.js 18 + React frontend  
✅ PostgreSQL database  
✅ Nginx reverse proxy  
✅ Systemd services  
✅ Firewall configuration  

## After Deployment

Your app will be live at:
- **Frontend**: `http://<VM_IP>`
- **Backend API**: `http://<VM_IP>/api`
- **Health Check**: `http://<VM_IP>/api/auth/health`

## Update Your App

Just push to GitHub and run:
```bash
cd /opt/ammas-food
./deploy.sh
```

Or set up GitHub Actions to auto-deploy!

## Troubleshooting

```bash
# Check backend status
sudo systemctl status ammas-backend

# View backend logs
sudo journalctl -u ammas-backend -f

# Restart services
sudo systemctl restart ammas-backend nginx
```

---

**That's it! Your app is live! 🎉**
