# Azure Container Apps - Quick Start Guide

## Why Container Apps?
- ✅ **Serverless** - Pay only for what you use
- ✅ **Auto-scaling** - Scales to zero when idle (saves money!)
- ✅ **Modern** - Built for containers
- ✅ **Cost-effective** - Can be cheaper than App Services

## Quick Setup (5 Steps)

### 1. Create Resources

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="ammas-food-rg"
LOCATION="uksouth"
ACR_NAME="ammasfood$(date +%s)"  # Must be unique, lowercase
ENV_NAME="ammas-food-env"

# Create everything
az group create --name $RESOURCE_GROUP --location $LOCATION

# Container Registry
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# Container Apps Environment
az containerapp env create --name $ENV_NAME --resource-group $RESOURCE_GROUP --location $LOCATION

# Database
az postgres flexible-server create \
  --resource-group $RESOURCE_GROUP \
  --name ammas-food-db-$(date +%s) \
  --location $LOCATION \
  --admin-user ammasadmin \
  --admin-password "YourStrongPassword123!" \
  --sku-name Standard_B1ms \
  --tier Burstable
```

### 2. Build & Push Images

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build backend
cd backend
az acr build --registry $ACR_NAME --image ammas-food-backend:latest .

# Build frontend
cd ../frontend
az acr build --registry $ACR_NAME --image ammas-food-frontend:latest .
```

### 3. Get ACR Details

```bash
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)
```

### 4. Create Container Apps

```bash
# Backend
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
  --env-vars "DATABASE_URL=postgresql://ammasadmin:YourPassword@your-db.postgres.database.azure.com:5432/postgres" "JWT_SECRET_KEY=your-secret" "STRIPE_SECRET_KEY=sk_test_..." "STRIPE_PUBLIC_KEY=pk_test_..." \
  --cpu 0.5 --memory 1.0Gi \
  --min-replicas 1 --max-replicas 3

# Frontend
BACKEND_URL=$(az containerapp show --name ammas-food-backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv)

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
  --env-vars "VITE_API_URL=https://$BACKEND_URL/api" "VITE_STRIPE_PUBLIC_KEY=pk_test_..." \
  --cpu 0.25 --memory 0.5Gi \
  --min-replicas 1 --max-replicas 2
```

### 5. Get URLs

```bash
# Backend
az containerapp show --name ammas-food-backend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv

# Frontend
az containerapp show --name ammas-food-frontend --resource-group $RESOURCE_GROUP --query properties.configuration.ingress.fqdn --output tsv
```

## Cost Estimate

- **Container Apps Environment**: ~£0.01/hour when running
- **Container Apps** (per app): ~£0.000012/vCPU-second
- **ACR Basic**: ~£3/month
- **Database**: ~£20/month
- **Total**: ~£25-30/month (can scale to zero when idle!)

## Update & Redeploy

```bash
# Rebuild and redeploy backend
cd backend
az acr build --registry $ACR_NAME --image ammas-food-backend:latest .
az containerapp update --name ammas-food-backend --resource-group $RESOURCE_GROUP --image $ACR_LOGIN_SERVER/ammas-food-backend:latest

# Rebuild and redeploy frontend
cd ../frontend
az acr build --registry $ACR_NAME --image ammas-food-frontend:latest .
az containerapp update --name ammas-food-frontend --resource-group $RESOURCE_GROUP --image $ACR_LOGIN_SERVER/ammas-food-frontend:latest
```

## Troubleshooting

- **View logs**: `az containerapp logs show --name ammas-food-backend --resource-group $RESOURCE_GROUP --follow`
- **Check status**: `az containerapp show --name ammas-food-backend --resource-group $RESOURCE_GROUP`
- **Update env vars**: `az containerapp update --name ammas-food-backend --resource-group $RESOURCE_GROUP --set-env-vars "KEY=value"`
