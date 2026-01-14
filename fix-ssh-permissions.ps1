# Fix SSH config file permissions
Write-Host "Fixing SSH config file permissions..." -ForegroundColor Yellow

$sshDir = "$env:USERPROFILE\.ssh"
$configPath = Join-Path $sshDir "config"
$currentUser = $env:USERNAME

# Ensure .ssh directory exists
if (-not (Test-Path $sshDir)) {
    New-Item -ItemType Directory -Path $sshDir -Force | Out-Null
    Write-Host "Created .ssh directory" -ForegroundColor Green
}

# Fix .ssh directory permissions
Write-Host "Setting permissions on .ssh directory..." -ForegroundColor Yellow
icacls $sshDir /inheritance:r 2>$null
icacls $sshDir /grant "${currentUser}:(OI)(CI)F" 2>$null
icacls $sshDir /grant "SYSTEM:(OI)(CI)F" 2>$null
icacls $sshDir /grant "Administrators:(OI)(CI)F" 2>$null

# Create config file if it doesn't exist
if (-not (Test-Path $configPath)) {
    New-Item -ItemType File -Path $configPath -Force | Out-Null
    Write-Host "Created config file" -ForegroundColor Green
}

# Fix config file permissions
Write-Host "Setting permissions on config file..." -ForegroundColor Yellow
icacls $configPath /inheritance:r 2>$null
icacls $configPath /grant "${currentUser}:F" 2>$null
icacls $configPath /grant "SYSTEM:F" 2>$null
icacls $configPath /grant "Administrators:F" 2>$null

Write-Host ""
Write-Host "Permissions fixed successfully!" -ForegroundColor Green
Write-Host "Config file location: $configPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now edit the file with:" -ForegroundColor Yellow
Write-Host "  notepad $configPath" -ForegroundColor White
Write-Host ""
Write-Host "Or open it from File Explorer without permission issues." -ForegroundColor Green
