# PowerShell script to create Azure Container Registry
# Run this script to create ACR for GitHub Actions

Write-Host "Creating Azure Container Registry..." -ForegroundColor Green

# Set variables - MODIFY THESE
$RESOURCE_GROUP = "ammas-food-rg"
$LOCATION = "uksouth"  # or "eastus", "westeurope", etc.
$ACR_NAME = "ammasfoodregistry" + (Get-Random -Minimum 1000 -Maximum 9999)  # Must be unique, lowercase

# If you need to switch subscription, uncomment and set:
# $SUBSCRIPTION_ID = "f3b57679-063f-4053-8d1d-7be58774bd80"
# az account set --subscription $SUBSCRIPTION_ID

Write-Host "`nConfiguration:" -ForegroundColor Yellow
Write-Host "  Resource Group: $RESOURCE_GROUP"
Write-Host "  Location: $LOCATION"
Write-Host "  ACR Name: $ACR_NAME"
Write-Host ""

# Create resource group if it doesn't exist
Write-Host "Creating resource group..." -ForegroundColor Cyan
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container Registry
Write-Host "Creating Container Registry..." -ForegroundColor Cyan
az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $ACR_NAME `
  --sku Basic `
  --admin-enabled true

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ Container Registry created successfully!" -ForegroundColor Green
    Write-Host "`nRegistry Details:" -ForegroundColor Yellow
    Write-Host "  Name: $ACR_NAME"
    Write-Host "  Login Server: $ACR_NAME.azurecr.io"
    
    # Get credentials
    Write-Host "`nGetting credentials..." -ForegroundColor Cyan
    $username = az acr credential show --name $ACR_NAME --query username --output tsv
    $password = az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv
    
    Write-Host "`nCredentials (SAVE THESE!):" -ForegroundColor Yellow
    Write-Host "  Username: $username"
    Write-Host "  Password: $password"
    Write-Host "`n⚠️  Save these credentials - you'll need them for GitHub Actions!" -ForegroundColor Red
    
    Write-Host "`nNext Steps:" -ForegroundColor Green
    Write-Host "1. Go back to Azure Portal → Container App → Deployment Center"
    Write-Host "2. Refresh the page"
    Write-Host "3. Your ACR ($ACR_NAME) should now appear in the Registry dropdown"
    Write-Host "4. Complete the GitHub Actions setup"
} else {
    Write-Host "`n❌ Failed to create Container Registry" -ForegroundColor Red
    Write-Host "Check the error message above" -ForegroundColor Yellow
}
