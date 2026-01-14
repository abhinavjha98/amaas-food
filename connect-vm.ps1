# PowerShell script to connect to Azure VM
# Usage: .\connect-vm.ps1 -VMIP "20.123.45.67" -PEMFile "C:\path\to\key.pem"

param(
    [Parameter(Mandatory=$true)]
    [string]$VMIP,
    
    [Parameter(Mandatory=$true)]
    [string]$PEMFile,
    
    [string]$Username = "azureuser"
)

Write-Host "Connecting to Azure VM..." -ForegroundColor Green
Write-Host "VM IP: $VMIP" -ForegroundColor Yellow
Write-Host "PEM File: $PEMFile" -ForegroundColor Yellow
Write-Host "Username: $Username" -ForegroundColor Yellow
Write-Host ""

# Check if PEM file exists
if (-not (Test-Path $PEMFile)) {
    Write-Host "Error: PEM file not found at $PEMFile" -ForegroundColor Red
    exit 1
}

# Set PEM file permissions (Windows)
Write-Host "Setting PEM file permissions..." -ForegroundColor Cyan
icacls $PEMFile /inheritance:r
icacls $PEMFile /grant:r "$env:USERNAME:R"

# Check if SSH is available
if (-not (Get-Command ssh -ErrorAction SilentlyContinue)) {
    Write-Host "Error: SSH not found. Please install:" -ForegroundColor Red
    Write-Host "  - Git for Windows (includes SSH)" -ForegroundColor Yellow
    Write-Host "  - Or use WSL" -ForegroundColor Yellow
    exit 1
}

# Connect to VM
Write-Host "Connecting to VM..." -ForegroundColor Cyan
Write-Host ""

ssh -i $PEMFile $Username@$VMIP
