# Start the dev server — run this in PowerShell from the project folder

$ErrorActionPreference = "Stop"
Set-Location $PSScriptRoot\..

function Find-Node {
    # 1. System Node (after installing from nodejs.org or winget)
    $nodeCmd = Get-Command node -ErrorAction SilentlyContinue
    if ($nodeCmd) { return @{ Node = "node"; Npm = "npm" } }

    # 2. Default Windows install path
    $defaultNode = "C:\Program Files\nodejs\node.exe"
    $defaultNpm = "C:\Program Files\nodejs\npm.cmd"
    if (Test-Path $defaultNode) {
        return @{ Node = $defaultNode; Npm = $defaultNpm }
    }

    # 3. Portable Node in project .tools folder
    $portableNode = Join-Path $PSScriptRoot "..\.tools\nodejs\node.exe"
    $portableNpm = Join-Path $PSScriptRoot "..\.tools\nodejs\npm.cmd"
    if (Test-Path $portableNode) {
        return @{ Node = $portableNode; Npm = $portableNpm }
    }

    return $null
}

$runtime = Find-Node

if (-not $runtime) {
    Write-Host ""
    Write-Host "Node.js not found." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Install Node first (pick one):" -ForegroundColor Cyan
    Write-Host "  A) Download LTS from https://nodejs.org and run the installer"
    Write-Host "  B) winget install OpenJS.NodeJS.LTS --source winget"
    Write-Host ""
    Write-Host "Then restart PowerShell and run:" -ForegroundColor Cyan
    Write-Host "  .\scripts\start-dev.ps1"
    Write-Host ""
    Write-Host "See docs/NODE_SETUP.md for full steps."
    exit 1
}

Write-Host "Using Node: $($runtime.Node)" -ForegroundColor Green
& $runtime.Node --version
& $runtime.Npm --version

$needsInstall = -not (Test-Path "node_modules\next\package.json")
if ($needsInstall) {
    Write-Host ""
    Write-Host "Installing dependencies (first time: 5-15 min, please wait)..." -ForegroundColor Cyan
    & $runtime.Npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "npm install failed. Run: powershell -ExecutionPolicy Bypass -File .\scripts\install-deps.ps1" -ForegroundColor Red
        exit 1
    }
    if (-not (Test-Path "node_modules\next\package.json")) {
        Write-Host "Install incomplete. Run: powershell -ExecutionPolicy Bypass -File .\scripts\install-deps.ps1" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path ".env.local")) {
    Write-Host ""
    Write-Host "Creating .env.local from example..." -ForegroundColor Cyan
    Copy-Item ".env.local.example" ".env.local"
}

# Stop old dev servers that block port 3000 and serve broken pages
$port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction SilentlyContinue
if ($port3000) {
    Write-Host ""
    Write-Host "Stopping old server on port 3000 (causes unstyled pages if left running)..." -ForegroundColor Yellow
    $port3000.OwningProcess | Sort-Object -Unique | ForEach-Object {
        Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue
    }
    Start-Sleep -Seconds 2
}

# Clear stale build cache (fixes missing CSS / unstyled pages)
if (Test-Path ".next") {
    Write-Host ""
    Write-Host "Clearing stale .next cache..." -ForegroundColor Cyan
    cmd /c "rmdir /s /q `"$PWD\.next`"" 2>$null | Out-Null
    if (Test-Path ".next") {
        Remove-Item -Recurse -Force ".next" -ErrorAction SilentlyContinue
    }
}

# Create Excel database if missing
if (-not (Test-Path "data\celebrity-site.xlsx")) {
    Write-Host ""
    Write-Host "Creating Excel database..." -ForegroundColor Cyan
    & $runtime.Npm run seed
}

Write-Host ""
Write-Host "Starting dev server..." -ForegroundColor Green
Write-Host "  On this PC:     http://localhost:3000  (use Chrome or Edge, not Cursor preview)" -ForegroundColor Cyan
$localIps = Get-NetIPAddress -AddressFamily IPv4 -ErrorAction SilentlyContinue |
    Where-Object { $_.IPAddress -notlike "127.*" -and $_.PrefixOrigin -ne "WellKnown" } |
    Select-Object -ExpandProperty IPAddress -Unique
if ($localIps) {
    foreach ($ip in $localIps) {
        Write-Host "  On your phone:  http://${ip}:3000  (same Wi-Fi as this PC)" -ForegroundColor Yellow
    }
} else {
    Write-Host "  On your phone:  http://YOUR-PC-IP:3000  (find IP with ipconfig)" -ForegroundColor Yellow
}
Write-Host "Press Ctrl+C to stop."
Write-Host ""

# Open default browser (Chrome/Edge) after the server has time to start
Start-Job -ScriptBlock {
    Start-Sleep -Seconds 12
    Start-Process "http://localhost:3000"
} | Out-Null

& $runtime.Npm run dev
