# Azure Quick Start Checklist

## Choose Your Deployment Method

### Option 1: Container Apps (Recommended) ⭐
**Best for:** Modern, serverless, cost-effective
- See `AZURE_CONTAINER_APPS_QUICK_START.md` for quick setup
- Requires Docker images (Dockerfiles provided)

### Option 2: App Services (Web Apps)
**Best for:** Traditional deployment, direct Git push
- See below for checklist

---

## Option 1: Container Apps - What to Create

1. **Container Apps Environment**: `ammas-food-env`
2. **Azure Container Registry**: `ammasfoodregistry-[random]` (Basic tier)
3. **Backend Container App**: `ammas-food-backend`
4. **Frontend Container App**: `ammas-food-frontend`
5. **Database**: PostgreSQL Flexible Server (Burstable B1ms)

**Quick Command:**
```bash
# See AZURE_CONTAINER_APPS_QUICK_START.md for full commands
```

---

## Option 2: App Services - What to Create in Azure Portal

### 1. Resource Group
- Name: `ammas-food-rg`
- Location: `UK South` (or closest to you)

### 2. App Service Plan
- Name: `ammas-food-plan`
- Tier: **Basic B1** (cheapest, ~£10/month)
- OS: Linux

### 3. Backend App Service
- Name: `ammas-food-backend-[random]` (must be globally unique)
- Runtime: Python 3.11
- Plan: Use `ammas-food-plan`

### 4. Frontend App Service
- Name: `ammas-food-frontend-[random]` (must be globally unique)
- Runtime: Node.js 18 LTS
- Plan: Use `ammas-food-plan`

### 5. Database
- Type: Azure Database for PostgreSQL (Flexible Server)
- Name: `ammas-food-db-[random]`
- Tier: **Burstable B1ms** (cheapest, ~£20/month)
- Admin: `ammasadmin`
- Password: Create strong password (save it!)

## Quick Deploy Steps

1. **Create resources** (use Azure Portal or CLI - see AZURE_DEPLOYMENT_GUIDE.md)

2. **Get connection strings**:
   - Database: Azure Portal → Database → Connection strings
   - Backend URL: `https://your-backend-app.azurewebsites.net`
   - Frontend URL: `https://your-frontend-app.azurewebsites.net`

3. **Configure Backend**:
   - Go to Backend App Service → Configuration → Application settings
   - Add:
     - `DATABASE_URL`: PostgreSQL connection string
     - `JWT_SECRET_KEY`: Random string
     - `STRIPE_SECRET_KEY`: Your key
     - `STRIPE_PUBLIC_KEY`: Your key
     - `WEBSITES_PORT`: `8000`

4. **Deploy Backend**:
   - Go to Deployment Center
   - Connect GitHub/Local Git
   - Deploy

5. **Deploy Frontend**:
   - Update `frontend/.env.production` with backend URL
   - Go to Frontend App Service → Deployment Center
   - Connect repository
   - Set build command: `npm run build`
   - Deploy

6. **Test**:
   - Backend: `https://your-backend.azurewebsites.net/api/auth/health`
   - Frontend: `https://your-frontend.azurewebsites.net`

## Estimated Monthly Cost

- App Service Plan (B1): ~£10/month
- Database (B1ms): ~£20/month
- **Total: ~£30/month** (can be reduced with free tier if eligible)

## Important URLs to Save

- Backend: `https://[your-backend-name].azurewebsites.net`
- Frontend: `https://[your-frontend-name].azurewebsites.net`
- Database connection string: (from Azure Portal)

