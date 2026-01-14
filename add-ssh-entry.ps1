# Add SSH config entry for ammas-vm
$configPath = Join-Path $env:USERPROFILE ".ssh\config"

$entry = @"
Host ammas-vm
    HostName 172.171.241.8
    User azureuser
    IdentityFile C:\Users\abhin\Downloads\ammas-food_key.pem
    StrictHostKeyChecking no
"@

if (Test-Path $configPath) {
    $content = Get-Content $configPath -Raw -ErrorAction SilentlyContinue
    if (-not $content -or $content -notmatch 'Host ammas-vm') {
        Add-Content -Path $configPath -Value "`n$entry"
        Write-Host "✓ Added 'ammas-vm' entry to SSH config" -ForegroundColor Green
    } else {
        Write-Host "✓ 'ammas-vm' entry already exists in SSH config" -ForegroundColor Cyan
    }
} else {
    Set-Content -Path $configPath -Value $entry
    Write-Host "✓ Created SSH config file with 'ammas-vm' entry" -ForegroundColor Green
}

Write-Host ""
Write-Host "Config file location: $configPath" -ForegroundColor Cyan
Write-Host ""
Write-Host "You can now connect with: ssh ammas-vm" -ForegroundColor Yellow
