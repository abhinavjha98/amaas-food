# GitHub Actions Continuous Deployment Guide

## 🎯 How It Works

When you set up GitHub Actions in Azure Portal, here's what happens:

### 1. **Workflow File Created**
Azure automatically creates a GitHub Actions workflow file in your repository:
- **Location**: `.github/workflows/azure-container-apps-[your-app-name].yml`
- **What it does**: Defines the CI/CD pipeline

### 2. **The Deployment Flow**

```
┌─────────────────┐
│  You Push Code  │
│  to GitHub      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ GitHub Actions   │
│ Triggered        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Build Docker    │
│ Image           │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Push to ACR     │
│ (Container      │
│  Registry)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Deploy to       │
│ Container App   │
│ (New Revision)  │
└─────────────────┘
```

## 📋 Step-by-Step: What Happens When You Push

### Step 1: Push Code to GitHub
```bash
git add .
git commit -m "Update backend code"
git push origin master
```

### Step 2: GitHub Actions Triggers
- GitHub detects the push to `master` branch
- Automatically starts the workflow defined in `.github/workflows/`

### Step 3: Build Docker Image
The workflow:
1. **Checks out your code** from GitHub
2. **Logs into Azure** using credentials (managed identity)
3. **Logs into ACR** (Azure Container Registry)
4. **Builds Docker image** using your `Dockerfile`
5. **Tags image** with commit SHA (e.g., `ammas-food-backend:abc123def`)
6. **Pushes image** to ACR

### Step 4: Deploy to Container App
1. **Updates Container App** with new image
2. **Creates new revision** (version of your app)
3. **Traffic routing**:
   - New revision gets 0% traffic initially (or configured %)
   - Old revision keeps 100% traffic
   - You can manually switch or configure auto-switch

### Step 5: New Revision Available
- New revision is created but **not active** by default
- You can test it before switching traffic
- Switch traffic in Azure Portal → Container App → Revisions

## 🔍 Viewing Your Workflow

### In GitHub:
1. Go to your repository: `https://github.com/abhinavjha98/ammas-backend`
2. Click **"Actions"** tab
3. See all workflow runs
4. Click on a run to see:
   - Build logs
   - Deployment status
   - Any errors

### In Azure Portal:
1. Go to your Container App
2. Click **"Revisions"** in left menu
3. See all revisions (versions)
4. Each deployment creates a new revision

## 📝 Typical Workflow File Structure

The workflow file Azure created looks like this:

```yaml
name: Build and deploy container app to Azure Container Apps

on:
  push:
    branches:
      - master  # Triggers on push to master
  workflow_dispatch:  # Allows manual trigger

env:
  AZURE_CONTAINER_REGISTRY: 'your-acr-name'
  CONTAINER_APP_NAME: 'ammas-food-backend'
  RESOURCE_GROUP: 'ammas-food-rg'
  IMAGE_NAME: 'ammas-food-backend'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout code
        uses: actions/checkout@v3
      
      - name: Login to Azure
        uses: azure/login@v1
        with:
          creds: ${{ secrets.AZURE_CREDENTIALS }}
      
      - name: Build and push image
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io
          username: ${{ secrets.REGISTRY_USERNAME }}
          password: ${{ secrets.REGISTRY_PASSWORD }}
      
      - name: Build and push
        run: |
          docker build -t ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }} ./backend
          docker push ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
      
      - name: Deploy to Container App
        uses: azure/container-apps-deploy-action@v1
        with:
          acrName: ${{ env.AZURE_CONTAINER_REGISTRY }}
          containerAppName: ${{ env.CONTAINER_APP_NAME }}
          resourceGroup: ${{ env.RESOURCE_GROUP }}
          imageToDeploy: ${{ env.AZURE_CONTAINER_REGISTRY }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
```

## 🎛️ Understanding Revisions

### What is a Revision?
- A **snapshot** of your Container App at a point in time
- Each deployment creates a new revision
- Multiple revisions can run simultaneously
- You control traffic distribution between revisions

### Revision States:
- **Active**: Receiving traffic
- **Inactive**: Not receiving traffic (but can be activated)
- **Single Revision Mode**: Only one active revision (default)

### Traffic Splitting:
You can split traffic between revisions:
- **Revision 1**: 80% traffic (stable)
- **Revision 2**: 20% traffic (testing new version)

## 🚀 How to Use Continuous Deployment

### Normal Workflow:
1. **Make changes** to your code locally
2. **Test locally** (optional but recommended)
3. **Commit and push**:
   ```bash
   git add .
   git commit -m "Fix bug in checkout"
   git push origin master
   ```
4. **GitHub Actions runs automatically**
5. **Check deployment**:
   - GitHub Actions tab (see progress)
   - Azure Portal → Revisions (see new revision)
6. **Switch traffic** to new revision (if needed)

### Manual Deployment:
You can also trigger manually:
1. Go to GitHub → Actions
2. Select your workflow
3. Click "Run workflow"
4. Choose branch
5. Click "Run workflow"

## 🔧 Configuration Options

### Change Branch:
Edit workflow file (`.github/workflows/azure-container-apps-*.yml`):
```yaml
on:
  push:
    branches:
      - master  # Change to 'main' or 'develop'
```

### Change Dockerfile Location:
In Azure Portal → Deployment Center:
- Update "Dockerfile location" field
- Or edit workflow file directly

### Change Image Tag Strategy:
- **Commit SHA** (default): `image:abc123def`
- **Branch name**: `image:master`
- **Latest**: `image:latest`

## 📊 Monitoring Deployments

### In GitHub Actions:
- ✅ Green checkmark = Success
- ❌ Red X = Failed
- 🟡 Yellow circle = In progress

### In Azure Portal:
1. **Container App** → **Revisions**
   - See all revisions
   - Traffic distribution
   - Status (Active/Inactive)

2. **Container App** → **Log stream**
   - Real-time logs
   - See application output

3. **Container App** → **Metrics**
   - CPU usage
   - Memory usage
   - Request count

## ⚠️ Important Notes

### 1. Every Push Creates a New Revision
- Even small changes create new revisions
- Old revisions are kept (can be deleted manually)
- This helps with rollback

### 2. New Revision Doesn't Get Traffic Automatically
- By default, new revision gets 0% traffic
- You need to manually switch or configure auto-switch
- This prevents breaking changes from going live immediately

### 3. Environment Variables
- Set in Azure Portal → Container App → Environment variables
- Not in workflow file (for security)
- Apply to all revisions

### 4. Secrets Management
- GitHub Secrets: For workflow authentication
- Azure Key Vault: For application secrets (recommended)
- Never commit secrets to code!

## 🔄 Rollback Process

If something goes wrong:

1. **Go to Azure Portal** → Container App → Revisions
2. **Find previous working revision**
3. **Click "..."** → **"Set traffic"**
4. **Set to 100%** traffic
5. **Save**

Or use Azure CLI:
```bash
az containerapp revision set-traffic \
  --name ammas-food-backend \
  --resource-group ammas-food-rg \
  --revision <old-revision-name> \
  --traffic-weight 100
```

## 🎯 Best Practices

1. **Test Before Deploying**
   - Test locally first
   - Use staging environment if possible

2. **Use Feature Branches**
   - Create feature branches
   - Test in separate Container App
   - Merge to master when ready

3. **Monitor Deployments**
   - Check GitHub Actions logs
   - Monitor Azure metrics
   - Set up alerts

4. **Gradual Rollout**
   - Start with 10% traffic to new revision
   - Monitor for issues
   - Gradually increase to 100%

5. **Keep Revisions Clean**
   - Delete old inactive revisions
   - Keep only last 5-10 revisions

## 🐛 Troubleshooting

### Deployment Fails:
1. **Check GitHub Actions logs**
   - See exact error message
   - Common issues: Dockerfile errors, build failures

2. **Check Azure Portal**
   - Container App → Revisions → See failed revision
   - Check logs for application errors

3. **Common Issues**:
   - Dockerfile path incorrect
   - Missing environment variables
   - ACR permissions issue
   - Resource group/name mismatch

### Image Not Updating:
1. **Check if workflow ran** (GitHub Actions)
2. **Check ACR** - Is new image there?
3. **Check revision** - Is new revision created?
4. **Switch traffic** - New revision might have 0% traffic

### Workflow Not Triggering:
1. **Check branch name** - Must match workflow config
2. **Check workflow file** - Is it in `.github/workflows/`?
3. **Check GitHub Actions** - Are workflows enabled?

## 📚 Next Steps

1. **Make a test change** and push to see it in action
2. **Monitor first deployment** in GitHub Actions
3. **Check new revision** in Azure Portal
4. **Switch traffic** to new revision when ready

## 🔗 Useful Links

- **GitHub Actions**: `https://github.com/abhinavjha98/ammas-backend/actions`
- **Azure Portal**: Your Container App
- **ACR**: Your Container Registry

---

**You're all set!** Every time you push to `master`, your app will automatically build and deploy. 🚀
