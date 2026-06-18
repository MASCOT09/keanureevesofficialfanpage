# Clean install with retries. Close other terminals first.
# Usage: powershell -ExecutionPolicy Bypass -File .\scripts\install-deps.ps1

$ErrorActionPreference = "Continue"
Set-Location $PSScriptRoot\..

$npm = "C:\Program Files\nodejs\npm.cmd"
if (-not (Test-Path $npm)) {
    Write-Host "Node.js not found. Install from https://nodejs.org first." -ForegroundColor Red
    exit 1
}

function Remove-NodeModules {
    if (-not (Test-Path "node_modules")) { return }

    Write-Host "  Stopping any running Node processes..."
    Get-Process -Name "node" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2

    Write-Host "  Removing node_modules..."
    cmd /c "rmdir /s /q node_modules" 2>$null
    Start-Sleep -Seconds 1

    if (Test-Path "node_modules") {
        Write-Host "  Folder locked - renaming to node_modules.old (safe to delete later)..."
        $oldName = "node_modules.old." + (Get-Date -Format "HHmmss")
        Rename-Item "node_modules" $oldName -ErrorAction SilentlyContinue
    }
}

Write-Host "Step 1/3: Cleaning old install..." -ForegroundColor Cyan
Remove-NodeModules

if (Test-Path "package-lock.json") {
    Remove-Item -Force "package-lock.json" -ErrorAction SilentlyContinue
}

Write-Host "  Clearing npm cache..."
& $npm cache clean --force 2>$null

Write-Host ""
Write-Host "Step 2/3: Installing dependencies..." -ForegroundColor Cyan
Write-Host "  DO NOT close this window. Takes 5-20 minutes on slow internet." -ForegroundColor Yellow
Write-Host "  If it fails, just run this script again - npm resumes downloads." -ForegroundColor Yellow
Write-Host ""

$maxAttempts = 3
$success = $false

for ($i = 1; $i -le $maxAttempts; $i++) {
    if ($i -gt 1) {
        Write-Host ""
        Write-Host "  Retry $i of $maxAttempts (network dropped, trying again)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 5
    }

    & $npm install

    if ($LASTEXITCODE -eq 0 -and (Test-Path "node_modules\next\package.json")) {
        $success = $true
        break
    }
}

Write-Host ""
Write-Host "Step 3/3: Verifying install..." -ForegroundColor Cyan

if (-not $success) {
    Write-Host ""
    Write-Host "Install failed after $maxAttempts attempts." -ForegroundColor Red
    Write-Host ""
    Write-Host "Try these fixes:" -ForegroundColor Yellow
    Write-Host "  1. Close ALL Cursor terminals, then run this script again"
    Write-Host "  2. Use a more stable internet connection (try phone hotspot)"
    Write-Host "  3. Temporarily pause Windows Defender real-time scan"
    Write-Host "  4. Run PowerShell as Administrator"
    exit 1
}

Write-Host ""
Write-Host "SUCCESS! Dependencies installed." -ForegroundColor Green
Write-Host ""
Write-Host "Now run:" -ForegroundColor White
Write-Host '  & "C:\Program Files\nodejs\npm.cmd" run dev' -ForegroundColor Cyan
Write-Host ""
Write-Host "Then open http://localhost:3000" -ForegroundColor Green
