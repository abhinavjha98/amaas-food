# PowerShell script to set up SSH config for Azure VM
# This will create/update your SSH config file

$SSH_DIR = "$env:USERPROFILE\.ssh"
$CONFIG_FILE = "$SSH_DIR\config"
$PEM_FILE = "C:\Users\abhin\Downloads\ammas-food_key.pem"
$VM_IP = "172.171.241.8"
$USERNAME = "azureuser"
$HOST_NAME = "ammas-vm"

# Create .ssh directory if it doesn't exist
if (-not (Test-Path $SSH_DIR)) {
    New-Item -ItemType Directory -Path $SSH_DIR | Out-Null
    Write-Host "Created .ssh directory" -ForegroundColor Green
}

# Check if config file exists
$configExists = Test-Path $CONFIG_FILE

# Check if entry already exists
$entryExists = $false
if ($configExists) {
    $content = Get-Content $CONFIG_FILE -Raw
    if ($content -match "Host\s+$HOST_NAME") {
        $entryExists = $true
        Write-Host "Entry for '$HOST_NAME' already exists in config" -ForegroundColor Yellow
    }
}

if (-not $entryExists) {
    # Add new entry
    $configEntry = @"

Host $HOST_NAME
    HostName $VM_IP
    User $USERNAME
    IdentityFile $PEM_FILE
    StrictHostKeyChecking no
    UserKnownHostsFile $SSH_DIR\known_hosts

"@
    
    if ($configExists) {
        Add-Content -Path $CONFIG_FILE -Value $configEntry
        Write-Host "Added entry to existing config file" -ForegroundColor Green
    } else {
        Set-Content -Path $CONFIG_FILE -Value $configEntry
        Write-Host "Created new config file" -ForegroundColor Green
    }
    
    # Set permissions on config file
    icacls $CONFIG_FILE /inheritance:r 2>$null
    icacls $CONFIG_FILE /grant "${env:USERNAME}:(R)" 2>$null
    
    Write-Host ""
    Write-Host "SSH config updated successfully!" -ForegroundColor Green
    Write-Host ""
    Write-Host "You can now connect using:" -ForegroundColor Yellow
    Write-Host "  ssh $HOST_NAME" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "To update the entry, edit: $CONFIG_FILE" -ForegroundColor Yellow
}

# Set permissions on PEM file
if (Test-Path $PEM_FILE) {
    icacls $PEM_FILE /inheritance:r 2>$null
    icacls $PEM_FILE /grant "${env:USERNAME}:(R)" 2>$null
    Write-Host "Set permissions on PEM file" -ForegroundColor Green
} else {
    Write-Host "Warning: PEM file not found at $PEM_FILE" -ForegroundColor Red
}

Write-Host ""
Write-Host "Config file location: $CONFIG_FILE" -ForegroundColor Cyan
