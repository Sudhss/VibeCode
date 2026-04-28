# VibeCode — Auto-start script for Windows PowerShell
# Run this file: Right-click > Run with PowerShell  OR  Open terminal and run: .\start.ps1

$Host.UI.RawUI.WindowTitle = "VibeCode Launcher"

Write-Host ""
Write-Host "  ██╗   ██╗██╗██████╗ ███████╗ ██████╗ ██████╗ ██████╗ ███████╗" -ForegroundColor Cyan
Write-Host "  ██║   ██║██║██╔══██╗██╔════╝██╔════╝██╔═══██╗██╔══██╗██╔════╝" -ForegroundColor Cyan
Write-Host "  ██║   ██║██║██████╔╝█████╗  ██║     ██║   ██║██║  ██║█████╗  " -ForegroundColor Cyan
Write-Host "  ╚██╗ ██╔╝██║██╔══██╗██╔══╝  ██║     ██║   ██║██║  ██║██╔══╝  " -ForegroundColor Blue
Write-Host "   ╚████╔╝ ██║██████╔╝███████╗╚██████╗╚██████╔╝██████╔╝███████╗" -ForegroundColor Blue
Write-Host "    ╚═══╝  ╚═╝╚═════╝ ╚══════╝ ╚═════╝ ╚═════╝ ╚═════╝ ╚══════╝" -ForegroundColor Blue
Write-Host ""
Write-Host "  AI-Powered Vibe Coding Environment" -ForegroundColor DarkGray
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Check Node.js
Write-Host "  [1/3] Checking Node.js..." -ForegroundColor Yellow
try {
    $nodeVersion = node --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Not found" }
    Write-Host "        ✓ Node.js $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "        ✗ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    Write-Host ""
    Read-Host "  Press Enter to exit"
    exit 1
}

# Check npm
Write-Host "  [2/3] Checking npm..." -ForegroundColor Yellow
try {
    $npmVersion = npm --version 2>&1
    if ($LASTEXITCODE -ne 0) { throw "Not found" }
    Write-Host "        ✓ npm $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "        ✗ npm not found." -ForegroundColor Red
    Read-Host "  Press Enter to exit"
    exit 1
}

# Install dependencies
Write-Host "  [3/3] Installing dependencies..." -ForegroundColor Yellow
Set-Location $PSScriptRoot

if (-not (Test-Path "node_modules")) {
    Write-Host "        Running npm install (first time only, may take a minute)..." -ForegroundColor DarkGray
    npm install --silent 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        Write-Host "        ✗ npm install failed. Try running it manually." -ForegroundColor Red
        Read-Host "  Press Enter to exit"
        exit 1
    }
    Write-Host "        ✓ Dependencies installed" -ForegroundColor Green
} else {
    Write-Host "        ✓ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host "      Starting VibeCode..." -ForegroundColor Cyan
Write-Host ""
Write-Host "  URL:      http://localhost:3000" -ForegroundColor White
Write-Host "  Login:    testuser / test@123" -ForegroundColor White
Write-Host ""
Write-Host "    The browser will open automatically in a few seconds." -ForegroundColor DarkGray
Write-Host "    To stop the server, press Ctrl+C in this window." -ForegroundColor DarkGray
Write-Host "  ─────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""

# Set env to avoid browser auto-open (we'll open manually after delay)
$env:BROWSER = "none"

# Start dev server in background job
$job = Start-Job -ScriptBlock {
    Set-Location $using:PSScriptRoot
    npm start 2>&1
}

# Wait for server to boot then open browser
Start-Sleep -Seconds 8
Start-Process "http://localhost:3000"

Write-Host "  ✓ Browser opened at http://localhost:3000" -ForegroundColor Green
Write-Host ""

# Stream output from the job
try {
    while ($true) {
        $output = Receive-Job $job
        if ($output) {
            Write-Host $output -ForegroundColor DarkGray
        }
        if ($job.State -eq "Failed" -or $job.State -eq "Completed") {
            break
        }
        Start-Sleep -Milliseconds 500
    }
} finally {
    # Cleanup on Ctrl+C
    Stop-Job $job -ErrorAction SilentlyContinue
    Remove-Job $job -ErrorAction SilentlyContinue
    Write-Host ""
    Write-Host "  VibeCode server stopped." -ForegroundColor DarkGray
}
