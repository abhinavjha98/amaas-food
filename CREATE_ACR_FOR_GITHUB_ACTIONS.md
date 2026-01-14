# Create Azure Container Registry for GitHub Actions

## Quick Steps to Create ACR

### Option 1: Using Azure Portal (Easiest)

1. **Go to Azure Portal**
   - Navigate to: https://portal.azure.com
   - Make sure you're in the correct subscription: `f3b57679-063f-4053-8d1d-7be58774bd80`

2. **Create Container Registry**
   - Click "Create a resource" (top left)
   - Search for "Container Registry"
   - Click "Create"

3. **Fill in the form:**
   - **Subscription**: `f3b57679-063f-4053-8d1d-7be58774bd80` (your subscription)
   - **Resource Group**: 
     - If you already have one: Select existing (e.g., `ammas-food-rg`)
     - If not: Click "Create new" → Name: `ammas-food-rg`
   - **Registry name**: `ammasfoodregistry` (must be unique globally, lowercase, 5-50 chars, alphanumeric only)
     - If taken, try: `ammasfoodregistry[yourname]` or `ammasfood[random]`
   - **Location**: Same as your Container Apps (e.g., UK South)
   - **SKU**: **Basic** (cheapest, ~£3/month)
   - **Admin user**: **Enable** (required for GitHub Actions)
   - Click "Review + create" → "Create"

4. **Wait for deployment** (takes 1-2 minutes)

5. **Get credentials** (needed for GitHub Actions):
   - Go to your Container Registry → **Access keys**
   - Copy:
     - **Login server**: `ammasfoodregistry.azurecr.io` (or your name)
     - **Username**: `ammasfoodregistry` (same as registry name)
     - **Password**: Click "Show" and copy (save this!)

### Option 2: Using Azure CLI (Faster)

```bash
# Login to Azure
az login

# Set variables
RESOURCE_GROUP="ammas-food-rg"
ACR_NAME="ammasfoodregistry$(date +%s)"  # Must be unique, lowercase
LOCATION="uksouth"  # or your preferred location

# Create resource group if it doesn't exist
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true

# Get credentials
echo "Login Server: $ACR_NAME.azurecr.io"
az acr credential show --name $ACR_NAME --query username --output tsv
az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv
```

## After Creating ACR

### 1. Verify ACR is Available

Go back to your Container App → **Deployment Center** → **GitHub Actions**
- Click refresh or go back and forward
- Your ACR should now appear in the "Registry" dropdown

### 2. Complete GitHub Actions Setup

When setting up GitHub Actions in Azure Portal:

1. **Repository source**: Select your GitHub repo
2. **Registry**: Select your newly created ACR (e.g., `ammasfoodregistry`)
3. **Image**: `ammas-food-backend` (or `ammas-food-frontend`)
4. **Image tag**: Choose "Tagged with GitHub commit ID (SHA)"
5. **Dockerfile location**: 
   - For backend: `./backend/Dockerfile`
   - For frontend: `./frontend/Dockerfile`
6. **Azure access**: 
   - Select "User-assigned identity" (recommended)
   - Azure will create it automatically

### 3. Grant ACR Permissions

The Container App needs permission to pull from ACR:

```bash
# Get your Container App name and resource group
CONTAINER_APP="ammas-food-backend"
RESOURCE_GROUP="ammas-food-rg"
ACR_NAME="ammasfoodregistry"

# Get Container App identity
IDENTITY_ID=$(az containerapp show \
  --name $CONTAINER_APP \
  --resource-group $RESOURCE_GROUP \
  --query identity.userAssignedIdentities -o tsv | cut -d/ -f9)

# Grant ACR pull permission
az role assignment create \
  --assignee $IDENTITY_ID \
  --role AcrPull \
  --scope $(az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP --query id -o tsv)
```

Or in Azure Portal:
1. Go to your Container Registry → **Access control (IAM)**
2. Click "Add" → "Add role assignment"
3. Role: **AcrPull**
4. Assign access to: **Managed identity**
5. Select your Container App's managed identity
6. Save

## Troubleshooting

### "No ACR Registries are available"

**Causes:**
1. ACR not created yet (create it first)
2. ACR in different subscription
3. ACR in different resource group (should be fine, but check)

**Solutions:**
1. Create ACR (see above)
2. Make sure you're in the correct subscription
3. Refresh the Azure Portal page
4. Try logging out and back into Azure Portal

### "Registry name already taken"

**Solution:**
- Try variations:
  - `ammasfoodregistry[yourname]`
  - `ammasfood[randomnumbers]`
  - `ammasfoodacr[date]`
- Must be lowercase, 5-50 characters, alphanumeric only

### GitHub Actions can't push to ACR

**Solution:**
1. Make sure "Admin user" is enabled on ACR
2. Check GitHub Actions secrets are set correctly:
   - `AZURE_CREDENTIALS` (service principal or managed identity)
   - Or use ACR username/password in GitHub Secrets

## Next Steps

After ACR is created and visible:

1. ✅ Complete GitHub Actions setup in Azure Portal
2. ✅ GitHub will create workflow files automatically
3. ✅ Push code to trigger first deployment
4. ✅ Monitor in GitHub Actions tab

## Cost

- **ACR Basic**: ~£3/month
- **Storage**: First 10GB free, then ~£0.10/GB/month
- **Data transfer**: Free for Azure services, charges for external

## Quick Reference

**ACR Details to Save:**
- Registry name: `ammasfoodregistry` (or your name)
- Login server: `ammasfoodregistry.azurecr.io`
- Username: `ammasfoodregistry`
- Password: (from Access keys)

**Use these in:**
- GitHub Actions workflows
- Container App image references
- Manual docker push commands
