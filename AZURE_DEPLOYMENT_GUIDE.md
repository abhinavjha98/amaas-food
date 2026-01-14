# Azure Deployment Guide for Ammas Food

This guide will help you deploy your Flask backend and React frontend to Azure.

## Prerequisites
- Azure account (you have this)
- Azure CLI installed (or use Azure Portal)
- Git installed
- Your code ready to deploy
- Docker installed (for Container Apps option)

## Deployment Options

### Option 1: Azure Container Apps (Recommended) ⭐
**Best for:** Modern serverless deployments, auto-scaling, cost efficiency
- ✅ Serverless - pay only for what you use
- ✅ Auto-scaling (scale to zero when idle)
- ✅ Built-in load balancing
- ✅ Easier container management
- ✅ Can be cheaper for low-medium traffic
- ⚠️ Requires Docker images

### Option 2: Azure App Services (Web Apps)
**Best for:** Traditional deployments, direct code deployment
- ✅ Direct Git deployment
- ✅ No Docker required
- ✅ Built-in CI/CD
- ⚠️ Always-on pricing (even when idle)
- ⚠️ Manual scaling configuration

**This guide covers both options. Choose Container Apps (Option 1) for modern serverless deployment.**

---

## Option 1: Deploy with Azure Container Apps

### Step 1.1: Create Container Apps Environment

#### Using Azure Portal:

1. **Create Container Apps Environment**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Container Apps"
   - Click "Create"
   - Fill in:
     - **Subscription**: Your subscription
     - **Resource Group**: Create new "ammas-food-rg"
     - **Environment name**: `ammas-food-env`
     - **Region**: Choose closest (e.g., UK South)
     - **Zone redundancy**: Disabled (to save costs)
   - Click "Review + create" then "Create"

2. **Create Azure Container Registry (ACR)**
   - Go to "Create a resource"
   - Search for "Container Registry"
   - Click "Create"
   - Fill in:
     - **Registry name**: `ammasfoodregistry` (must be unique, lowercase)
     - **Resource Group**: Same "ammas-food-rg"
     - **Location**: Same as Container Apps
     - **SKU**: Basic (cheapest)
   - Click "Review + create" then "Create"

3. **Create Database**
   - Same as Step 3 in Option 2 (PostgreSQL)

#### Using Azure CLI:

```bash
# Set variables
RESOURCE_GROUP="ammas-food-rg"
LOCATION="uksouth"
ACR_NAME="ammasfoodregistry$(date +%s)"  # Must be unique, lowercase
ENV_NAME="ammas-food-env"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Create Container Apps Environment
az containerapp env create \
  --name $ENV_NAME \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Create PostgreSQL Database
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name ammas-food-db-$(date +%s) \
  --location $LOCATION \
  --admin-user ammasadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32
```

### Step 1.2: Build and Push Docker Images

#### Build Backend Image:

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)

# Build and push backend
cd backend
az acr build --registry $ACR_NAME --image ammas-food-backend:latest .

# Build and push frontend
cd ../frontend
az acr build --registry $ACR_NAME --image ammas-food-frontend:latest .
```

**Or using Docker directly:**

```bash
# Get ACR credentials
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)

# Login to ACR
docker login $ACR_LOGIN_SERVER -u $ACR_USERNAME -p $ACR_PASSWORD

# Build backend
cd backend
docker build -t $ACR_LOGIN_SERVER/ammas-food-backend:latest .
docker push $ACR_LOGIN_SERVER/ammas-food-backend:latest

# Build frontend
cd ../frontend
docker build -t $ACR_LOGIN_SERVER/ammas-food-frontend:latest .
docker push $ACR_LOGIN_SERVER/ammas-food-frontend:latest
```

### Step 1.3: Create Container Apps

#### Backend Container App:

```bash
# Get database connection string (update with your values)
DB_CONNECTION_STRING="postgresql://ammasadmin:YourPassword@ammas-food-db-xxx.postgres.database.azure.com:5432/postgres"

# Create backend container app
az containerapp create \
  --name ammas-food-backend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $ACR_LOGIN_SERVER/ammas-food-backend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8000 \
  --ingress external \
  --env-vars \
    "DATABASE_URL=$DB_CONNECTION_STRING" \
    "JWT_SECRET_KEY=your-jwt-secret-key-change-this" \
    "STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L" \
    "STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4" \
    "FLASK_ENV=production" \
  --cpu 0.5 \
  --memory 1.0Gi \
  --min-replicas 1 \
  --max-replicas 3
```

#### Frontend Container App:

```bash
# Get backend URL
BACKEND_URL=$(az containerapp show --name ammas-food-backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)

# Create frontend container app
az containerapp create \
  --name ammas-food-frontend \
  --resource-group $RESOURCE_GROUP \
  --environment $ENV_NAME \
  --image $ACR_LOGIN_SERVER/ammas-food-frontend:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 80 \
  --ingress external \
  --env-vars \
    "VITE_API_URL=https://$BACKEND_URL/api" \
    "VITE_STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4" \
  --cpu 0.25 \
  --memory 0.5Gi \
  --min-replicas 1 \
  --max-replicas 2
```

#### Using Azure Portal:

1. **Create Backend Container App**:
   - Go to Container Apps Environment → "Create container app"
   - Name: `ammas-food-backend`
   - Image source: Azure Container Registry
   - Select your registry and image: `ammas-food-backend:latest`
   - Ingress: Enabled, External, Port 8000
   - Environment variables: Add all from above
   - CPU: 0.5, Memory: 1.0Gi
   - Scale: Min 1, Max 3

2. **Create Frontend Container App**:
   - Same process but:
   - Name: `ammas-food-frontend`
   - Image: `ammas-food-frontend:latest`
   - Port: 80
   - CPU: 0.25, Memory: 0.5Gi
   - Scale: Min 1, Max 2

### Step 1.4: Configure CORS

```bash
# Update backend to allow frontend origin
az containerapp update \
  --name ammas-food-backend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars \
    "CORS_ORIGINS=https://$(az containerapp show --name ammas-food-frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)"
```

### Step 1.5: Get URLs

```bash
# Get backend URL
az containerapp show \
  --name ammas-food-backend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv

# Get frontend URL
az containerapp show \
  --name ammas-food-frontend \
  --resource-group $RESOURCE_GROUP \
  --query properties.configuration.ingress.fqdn \
  --output tsv
```

### Step 1.6: Update Frontend with Backend URL

After getting the backend URL, update the frontend container app:

```bash
BACKEND_URL="your-backend-url.azurecontainerapps.io"
az containerapp update \
  --name ammas-food-frontend \
  --resource-group $RESOURCE_GROUP \
  --set-env-vars "VITE_API_URL=https://$BACKEND_URL/api"
```

**Note:** For production, rebuild the frontend image with the correct API URL in `.env.production` before building.

---

## Option 2: Deploy with Azure App Services (Web Apps)

## Step 1: Create Azure Resources

### Option A: Using Azure Portal (Easier)

1. **Create Azure App Service for Backend (Flask)**
   - Go to [Azure Portal](https://portal.azure.com)
   - Click "Create a resource"
   - Search for "Web App"
   - Click "Create"
   - Fill in:
     - **Subscription**: Your subscription
     - **Resource Group**: Create new "ammas-food-rg"
     - **Name**: `ammas-food-backend` (must be unique)
     - **Publish**: Code
     - **Runtime stack**: Python 3.11 or 3.12
     - **Operating System**: Linux
     - **Region**: Choose closest to you (e.g., UK South)
     - **App Service Plan**: Create new "ammas-food-plan" (Basic B1 - cheapest)
   - Click "Review + create" then "Create"

2. **Create Azure App Service for Frontend (React)**
   - Repeat above but:
     - **Name**: `ammas-food-frontend` (must be unique)
     - **Runtime stack**: Node.js 18 LTS
   - Click "Review + create" then "Create"

3. **Create Azure Database (PostgreSQL or SQL Database)**
   - Go to "Create a resource"
   - Search for "Azure Database for PostgreSQL" (or "SQL Database")
   - Click "Create"
   - Fill in:
     - **Server name**: `ammas-food-db` (must be unique)
     - **Admin username**: `ammasadmin`
     - **Password**: Create strong password (save it!)
     - **Resource Group**: Same "ammas-food-rg"
     - **Location**: Same as App Services
     - **Compute + storage**: Basic tier (cheapest)
   - Click "Review + create" then "Create"

### Option B: Using Azure CLI (Faster)

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="ammas-food-rg"
LOCATION="uksouth"  # or "eastus", "westeurope", etc.
BACKEND_APP="ammas-food-backend-$(date +%s)"  # Unique name
FRONTEND_APP="ammas-food-frontend-$(date +%s)"  # Unique name
DB_SERVER="ammas-food-db-$(date +%s)"

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create App Service Plan
az appservice plan create \
  --name ammas-food-plan \
  --resource-group $RESOURCE_GROUP \
  --sku B1 \
  --is-linux

# Create Backend App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan ammas-food-plan \
  --name $BACKEND_APP \
  --runtime "PYTHON:3.11"

# Create Frontend App Service
az webapp create \
  --resource-group $RESOURCE_GROUP \
  --plan ammas-food-plan \
  --name $FRONTEND_APP \
  --runtime "NODE:18-lts"

# Create PostgreSQL Database
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name $DB_SERVER \
  --location $LOCATION \
  --admin-user ammasadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 14 \
  --storage-size 32
```

## Step 2: Configure Backend for Azure

### 2.1 Update Backend Configuration

1. **Create `backend/requirements.txt`** (if not exists):
```txt
Flask==3.0.0
flask-sqlalchemy==3.1.1
flask-jwt-extended==4.6.0
flask-cors==4.0.0
flask-mail==0.10.0
passlib[argon2]==1.7.4
stripe==7.8.0
requests==2.31.0
python-dotenv==1.0.0
psycopg2-binary==2.9.9
gunicorn==21.2.0
```

2. **Create `backend/.deployment` file**:
```
[config]
SCM_DO_BUILD_DURING_DEPLOYMENT=true
```

3. **Create `backend/startup.sh`**:
```bash
#!/bin/bash
# Startup script for Azure App Service
gunicorn --bind 0.0.0.0:8000 --timeout 600 --workers 2 --threads 2 app:create_app
```

4. **Update `backend/app/__init__.py`** to use environment variables:
```python
# In create_app function, update database URL:
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv(
    'DATABASE_URL',
    'sqlite:///' + os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data', 'currypot.db')
)
```

5. **Create `backend/.env` file** (for local testing):
```env
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET_KEY=your-secret-key-change-in-production
STRIPE_SECRET_KEY=sk_test_51SpGQtF5Zsiqo5SKYXS209JyRf3d0IbuBvx8g3O4du4yaPD5MZsp2wZuQ8QqNfvpdlNU3xNq9mNa8kpvPcWFG7Oq007iVewI7L
STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
```

### 2.2 Configure Backend App Service

1. In Azure Portal, go to your Backend App Service
2. Go to **Configuration** → **Application settings**
3. Add these settings:
   - `DATABASE_URL`: Your PostgreSQL connection string
     - Format: `postgresql://username:password@server:5432/database`
   - `JWT_SECRET_KEY`: Generate a strong random string
   - `STRIPE_SECRET_KEY`: Your Stripe secret key
   - `STRIPE_PUBLIC_KEY`: Your Stripe public key
   - `FLASK_ENV`: `production`
   - `SCM_DO_BUILD_DURING_DEPLOYMENT`: `true`
   - `WEBSITES_PORT`: `8000`
   - `WEBSITES_ENABLE_APP_SERVICE_STORAGE`: `true`

4. Go to **Deployment Center**:
   - **Source**: Local Git (or GitHub if you prefer)
   - Follow instructions to set up deployment

## Step 3: Configure Frontend for Azure

### 3.1 Update Frontend Configuration

1. **Create `frontend/.env.production`**:
```env
VITE_API_URL=https://your-backend-app.azurewebsites.net/api
VITE_STRIPE_PUBLIC_KEY=pk_test_51SpGQtF5Zsiqo5SKWrPxo4QTHI91ipNMVrZfHRH6qzrUif3htIjygU5EqoGjZIP95bUWy0lePukyK6fhWncua5Dz00y902R2p4
```

2. **Update `frontend/src/services/api.js`**:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

3. **Create `frontend/package.json` build script** (should already exist):
```json
{
  "scripts": {
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

4. **Create `frontend/web.config`** (for Azure):
```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### 3.2 Configure Frontend App Service

1. In Azure Portal, go to your Frontend App Service
2. Go to **Configuration** → **General settings**:
   - Set **Stack**: Node 18 LTS
   - Set **Startup command**: `npm run build && npm run preview -- --port 8080 --host 0.0.0.0`
   - Or use **Deployment Center** with build command: `npm run build`

3. Go to **Deployment Center**:
   - Set up deployment from your repository

## Step 4: Deploy Code

### Option A: Using Azure Portal Deployment Center

1. **Backend**:
   - Go to Backend App Service → **Deployment Center**
   - Connect your Git repository
   - Azure will auto-deploy on push

2. **Frontend**:
   - Go to Frontend App Service → **Deployment Center**
   - Connect your Git repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

### Option B: Using Azure CLI

```bash
# Deploy Backend
cd backend
az webapp up \
  --name $BACKEND_APP \
  --resource-group $RESOURCE_GROUP \
  --runtime "PYTHON:3.11"

# Deploy Frontend
cd ../frontend
npm run build
az webapp up \
  --name $FRONTEND_APP \
  --resource-group $RESOURCE_GROUP \
  --runtime "NODE:18-lts" \
  --html
```

### Option C: Using Git (Recommended)

1. **Initialize Git** (if not done):
```bash
git init
git add .
git commit -m "Initial commit"
```

2. **Add Azure remote**:
```bash
# Get deployment URL from Azure Portal → Deployment Center
git remote add azure-backend https://your-backend-app.scm.azurewebsites.net:443/your-backend-app.git
git remote add azure-frontend https://your-frontend-app.scm.azurewebsites.net:443/your-frontend-app.git
```

3. **Deploy**:
```bash
# Deploy backend
cd backend
git push azure-backend main

# Deploy frontend
cd ../frontend
git push azure-frontend main
```

## Step 5: Configure CORS

1. In Backend App Service → **CORS**:
   - Add your frontend URL: `https://your-frontend-app.azurewebsites.net`
   - Or allow all: `*` (for testing)

## Step 6: Database Migration

1. **Get database connection string** from Azure Portal
2. **Update backend** to use PostgreSQL
3. **Run migrations**:
```bash
# SSH into backend (Azure Portal → SSH)
python migrate_database.py
```

Or use Azure Cloud Shell:
```bash
az webapp ssh --name $BACKEND_APP --resource-group $RESOURCE_GROUP
```

## Step 7: Test Deployment

1. **Backend**: `https://your-backend-app.azurewebsites.net/api/auth/health`
2. **Frontend**: `https://your-frontend-app.azurewebsites.net`

## Step 8: Custom Domains (Optional)

1. Go to App Service → **Custom domains**
2. Add your domain
3. Configure DNS records as instructed

## Troubleshooting

### Backend Issues:
- Check **Log stream** in Azure Portal
- Check **Application Insights** (enable if needed)
- Verify environment variables are set
- Check database connection

### Frontend Issues:
- Check build logs in Deployment Center
- Verify API URL is correct
- Check browser console for errors

### Common Errors:
- **Module not found**: Add to `requirements.txt`
- **Database connection failed**: Check connection string
- **CORS error**: Add frontend URL to CORS settings
- **Build failed**: Check Node.js version and build logs

## Cost Optimization

- Use **Basic B1** tier for App Services (cheapest)
- Use **Burstable** tier for database
- Enable **Auto-shutdown** for non-production
- Use **Azure Free Tier** if eligible

## Security Checklist

- [ ] Use strong JWT secret key
- [ ] Enable HTTPS only
- [ ] Set up firewall rules for database
- [ ] Use managed identity for database access
- [ ] Enable Application Insights
- [ ] Set up backup for database
- [ ] Use environment variables for secrets

## Next Steps

1. Set up CI/CD pipeline
2. Configure custom domain
3. Set up SSL certificates
4. Enable monitoring and alerts
5. Set up database backups

## Support

- Azure Documentation: https://docs.microsoft.com/azure
- Azure Support: Available in Azure Portal

