#!/usr/bin/env pwsh
# ConvertForge Development Startup Script
Write-Output "+--------------------------------------+"
Write-Output "|     ConvertForge - Dev Startup       |"
Write-Output "+--------------------------------------+"
Write-Output ""

# Configuration
$BACKEND_DIR = Join-Path $PSScriptRoot "apps\backend"
$FRONTEND_DIR = Join-Path $PSScriptRoot "apps\frontend"
$DB_URL = "postgresql://postgres:root@localhost:5432/convertforge"
$REDIS_PORT = 6380

# Check prerequisites
Write-Output "Checking prerequisites..."

# Check Node
$nodeVer = node --version 2>$null
if (-not $nodeVer) { Write-Error "Node.js not found"; exit 1 }
Write-Output "  ✅ Node.js $nodeVer"

# Check PostgreSQL
$pgCheck = netstat -an | Select-String ":5432 "
if (-not $pgCheck) { Write-Warning "  ⚠ PostgreSQL not on 5432 - DB won't connect!" }
else { Write-Output "  ✅ PostgreSQL on 5432" }

# Check Redis/Memurai
$redisCheck = netstat -an | Select-String ":$REDIS_PORT "
if (-not $redisCheck) { Write-Warning "  ⚠ Redis/Memurai not on $REDIS_PORT" }
else { Write-Output "  ✅ Memurai/Redis on $REDIS_PORT" }

Write-Output ""

# Build shared-types if needed
$sharedDist = Join-Path $PSScriptRoot "packages\shared-types\dist"
if (-not (Test-Path $sharedDist)) {
  Write-Output "Building shared-types..."
  Push-Location (Join-Path $PSScriptRoot "packages\shared-types")
  npx tsc 2>&1 | Out-Null
  Pop-Location
  Write-Output "  ✅ shared-types built"
}

# Kill old processes
Write-Output "Stopping old processes..."
$oldBackend = netstat -ano | Select-String ":4000 "
if ($oldBackend) {
  $oldBackend | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' } | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
$oldFrontend = netstat -ano | Select-String ":3000 "
if ($oldFrontend) {
  $oldFrontend | ForEach-Object { ($_ -split '\s+')[-1] } | Where-Object { $_ -match '^\d+$' } | ForEach-Object { Stop-Process -Id $_ -Force -ErrorAction SilentlyContinue }
}
Start-Sleep -Seconds 2
Write-Output "  ✅ Old processes stopped"

# Start Backend
Write-Output ""
Write-Output "Starting Backend (NestJS on :4000)..."
$env:DATABASE_URL = $DB_URL
$env:REDIS_PORT = "$REDIS_PORT"
Push-Location $BACKEND_DIR
$backendJob = Start-Job -Name "convertforge-backend" -ScriptBlock {
  param($dir, $dbUrl, $redisPort)
  Set-Location $dir
  $env:DATABASE_URL = $dbUrl
  $env:REDIS_PORT = "$redisPort"
  node dist/main.js
} -ArgumentList $BACKEND_DIR, $DB_URL, $REDIS_PORT
Pop-Location

Start-Sleep -Seconds 5
$backendRunning = netstat -an | Select-String ":4000 "
if ($backendRunning) { Write-Output "  ✅ Backend running on http://localhost:4000" }
else { Write-Output "  ⏳ Waiting for backend..." }

# Start Frontend
Write-Output ""
Write-Output "Starting Frontend (Next.js on :3000)..."
$env:NEXT_PUBLIC_API_URL = "http://localhost:4000/api"
$env:NEXT_PUBLIC_WS_URL = "ws://localhost:4000/ws"
Push-Location $FRONTEND_DIR
$frontendJob = Start-Job -Name "convertforge-frontend" -ScriptBlock {
  param($dir, $apiUrl, $wsUrl)
  Set-Location $dir
  $env:NEXT_PUBLIC_API_URL = $apiUrl
  $env:NEXT_PUBLIC_WS_URL = $wsUrl
  npx next dev --port 3000
} -ArgumentList $FRONTEND_DIR, "http://localhost:4000/api", "ws://localhost:4000/ws"
Pop-Location

Start-Sleep -Seconds 10
$frontendRunning = netstat -an | Select-String ":3000 "
if ($frontendRunning) { Write-Output "  ✅ Frontend running on http://localhost:3000" }
else { Write-Output "  ⏳ Waiting for frontend..." }

Write-Output ""
Write-Output "+--------------------------------------+"
Write-Output "|  ConvertForge is starting up!        |"
Write-Output "|                                      |"
Write-Output "|  Frontend:  http://localhost:3000    |"
Write-Output "|  Backend:   http://localhost:4000    |"
Write-Output "|  API Docs:  http://localhost:4000/api/docs |"
Write-Output "|                                      |"
Write-Output "|  Demo:  demo@convertforge.app        |"
Write-Output "|  Admin: admin@convertforge.app       |"
Write-Output "+--------------------------------------+"
Write-Output ""
Write-Output "Use Stop-Job convertforge-backend and Stop-Job convertforge-frontend to stop."
