# Simple script to set up SSH config
$sshDir = "$env:USERPROFILE\.ssh"
$configPath = Join-Path $sshDir "config"

# Create .ssh directory if it doesn't exist
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "Created .ssh directory: $sshDir"
}

# SSH config entry
$entry = @"
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile C:\Users\abhin\Downloads\ammas-food_key.pem
    StrictHostKeyChecking no
"@

# Check if entry already exists
if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw -ErrorAction SilentlyContinue
    if ($content -and $content -match 'Host ammas-vm') {
        Write-Host "SSH config already contains 'ammas-vm' entry"
        Write-Host "Config file location: $configPath"
        Write-Host ""
        Write-Host "To edit it manually, run:"
        Write-Host "notepad $configPath"
    } else {
        Add-Content -Path $configPath -Value "`n$entry"
        Write-Host "Added 'ammas-vm' entry to existing SSH config"
        Write-Host "Config file location: $configPath"
    }
} else {
    Set-Content -Path $configPath -Value $entry
    Write-Host "Created new SSH config file with 'ammas-vm' entry"
    Write-Host "Config file location: $configPath"
}

Write-Host ""
Write-Host "Opening config file in Notepad..."
Start-Process notepad -ArgumentList $configPath
