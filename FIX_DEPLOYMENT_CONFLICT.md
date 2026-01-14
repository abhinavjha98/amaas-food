# Fix: Container App Operation In Progress Error

## What Happened

✅ **Image built successfully** - Your Docker image was created and pushed to ACR  
❌ **Deployment failed** - Container App was locked by another operation

**Error Message:**
```
Cannot modify a container app 'ammas-food-backend' because there is 
an active provisioning operation in progress.
```

## Why This Happens

This error occurs when:
1. **Multiple deployments running** - GitHub Actions triggered while another deployment is in progress
2. **Portal operation** - Someone is updating the Container App in Azure Portal
3. **Previous deployment still running** - Last deployment hasn't finished yet

## Solutions

### Solution 1: Wait and Retry (Easiest)

The operation will complete in 1-5 minutes. Then:

1. **Go to GitHub Actions**
   - Click "Re-run failed jobs" or
   - Push another commit to trigger a new deployment

2. **Or manually trigger**:
   - GitHub → Actions → Select workflow → "Run workflow"

### Solution 2: Check Azure Portal

1. **Go to Azure Portal** → Your Container App
2. **Check for ongoing operations**:
   - Look for "Deploying..." or "Updating..." status
   - Wait until it completes
3. **Then retry deployment**

### Solution 3: Cancel Conflicting Operation

If you know what's causing the conflict:

1. **Azure Portal** → Container App
2. **Check "Activity log"** (left menu)
3. **Find the in-progress operation**
4. **Wait for it to complete** (can't cancel, but you can see progress)

### Solution 4: Use Azure CLI to Check Status

```bash
# Check Container App status
az containerapp show \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --query "properties.provisioningState"

# If it shows "Succeeded", you can retry deployment
# If it shows "InProgress", wait a bit longer
```

## Prevention: Add Retry Logic

You can modify the GitHub Actions workflow to automatically retry on this error. The workflow file is at:
`.github/workflows/azure-container-apps-ammas-food-backend.yml`

Add retry logic (if it doesn't already exist):

```yaml
- name: Deploy to Container App
  uses: azure/container-apps-deploy-action@v1
  with:
    acrName: ${{ env.AZURE_CONTAINER_REGISTRY }}
    containerAppName: ${{ env.CONTAINER_APP_NAME }}
    resourceGroup: ${{ env.RESOURCE_GROUP }}
    imageToDeploy: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
  continue-on-error: false
  retries: 3
  retry-delay: 60  # Wait 60 seconds between retries
```

## Quick Fix Right Now

**Option A: Wait 2-3 minutes, then:**
```bash
# Just push a new commit (even a small change)
git commit --allow-empty -m "Retry deployment"
git push origin master
```

**Option B: Check if image is already deployed:**
1. Go to Azure Portal → Container App → Revisions
2. Check if a new revision was created with your commit SHA: `a444ac9d`
3. If yes, just switch traffic to it manually

## Verify Image Was Pushed

Your image was successfully pushed! You can verify:

```bash
# List images in ACR
az acr repository show-tags \
  --name <your-acr-name> \
  --repository ammas-food-backend \
  --output table

# You should see: a444ac9d41ed0a0f665e0db64978c2764d13be8f
```

## Manual Deployment (If Needed)

If automatic deployment keeps failing, you can manually deploy:

```bash
# Get ACR details
ACR_NAME="your-acr-name"
IMAGE_TAG="a444ac9d41ed0a0f665e0db64978c2764d13be8f"

# Update Container App manually
az containerapp update \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --image ${ACR_NAME}.azurecr.io/ammas-food-backend:${IMAGE_TAG}
```

## Status Check

**Current Status:**
- ✅ Docker image built
- ✅ Image pushed to ACR
- ⏳ Deployment pending (waiting for lock to release)

**Next Steps:**
1. Wait 2-3 minutes
2. Check Azure Portal for any ongoing operations
3. Retry deployment (push new commit or re-run workflow)

## Common Causes

1. **Rapid successive pushes** - Push multiple commits quickly
2. **Portal + GitHub Actions** - Updating in portal while GitHub Actions runs
3. **First deployment** - Initial setup takes longer
4. **Resource constraints** - Azure is provisioning resources

## Prevention Tips

1. **Don't push too rapidly** - Wait for previous deployment to finish
2. **Check GitHub Actions** - Make sure previous run completed
3. **Avoid portal updates** - Don't update Container App in portal while GitHub Actions is running
4. **Use staging environment** - Test in separate Container App first

---

**TL;DR:** Your image is ready! Just wait 2-3 minutes and retry the deployment. The Container App was busy with another operation.
