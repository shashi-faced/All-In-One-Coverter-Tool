# ConvertForge - Start All Services Locally
$ErrorActionPreference = "Stop"

# Create logs directory if it doesn't exist
$logDir = "E:\converter-tool\tmp\logs"
New-Item -ItemType Directory -Force -Path $logDir | Out-Null

Write-Host "=== Step 1: Cleaning up any old running processes ==="
$ports = @(3000, 4000, 6379, 6380)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $owningPid = $conn.OwningProcess
            if ($owningPid) {
                Write-Host "Stopping process $owningPid listening on port $port..."
                Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
Start-Sleep -Seconds 1

Write-Host "=== Step 2: Starting Standalone Redis v5 on port 6380 ==="
$redis = Start-Process -FilePath "E:\converter-tool\tmp\redis\redis-server.exe" -ArgumentList "--port 6380" -WindowStyle Hidden -PassThru
Start-Sleep -Seconds 3

# Environment Variables
$env:DATABASE_URL = "postgresql://postgres:root@localhost:5432/convertforge"
$env:REDIS_HOST = "localhost"
$env:REDIS_PORT = "6380"
$env:CORS_ORIGIN = "http://localhost:3000"
$env:LOCAL_STORAGE_PATH = "E:\converter-tool\uploads"

Write-Host "=== Step 3: Starting NestJS Backend on port 4000 ==="
$backend = Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "E:\converter-tool\apps\backend" -WindowStyle Hidden -RedirectStandardOutput "$logDir\backend-out.log" -RedirectStandardError "$logDir\backend-err.log" -PassThru

Write-Host "=== Step 4: Starting Conversion Worker ==="
$worker = Start-Process -FilePath "node" -ArgumentList "dist/main.js" -WorkingDirectory "E:\converter-tool\apps\workers" -WindowStyle Hidden -RedirectStandardOutput "$logDir\worker-out.log" -RedirectStandardError "$logDir\worker-err.log" -PassThru

Write-Host "=== Step 5: Starting Next.js Frontend on port 3000 ==="
$env:NEXT_PUBLIC_API_URL = "http://localhost:4000/api"
$env:NEXT_PUBLIC_WS_URL = "ws://localhost:4000/ws"
$env:NEXT_PUBLIC_APP_URL = "http://localhost:3000"
$frontend = Start-Process -FilePath "node" -ArgumentList "node_modules\next\dist\bin\next", "start", "--port", "3000" -WorkingDirectory "E:\converter-tool\apps\frontend" -WindowStyle Hidden -RedirectStandardOutput "$logDir\frontend-out.log" -RedirectStandardError "$logDir\frontend-err.log" -PassThru

Write-Host "Waiting 10 seconds for servers to warm up..."
Start-Sleep -Seconds 10

# Verify they are running
$backendCheck = Get-NetTCPConnection -LocalPort 4000 -ErrorAction SilentlyContinue
$frontendCheck = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
$redisCheck = Get-NetTCPConnection -LocalPort 6380 -ErrorAction SilentlyContinue

Write-Host ""
Write-Host "+-----------------------------------------------+"
Write-Host "|  ConvertForge status check:                   |"
Write-Host "|                                               |"
if ($redisCheck) {
    Write-Host "|  Redis (6380):   ONLINE                       |"
} else {
    Write-Host "|  Redis (6380):   OFFLINE (check log)          |"
}
if ($backendCheck) {
    Write-Host "|  Backend (4000): ONLINE                       |"
} else {
    Write-Host "|  Backend (4000): OFFLINE (check log)          |"
}
if ($frontendCheck) {
    Write-Host "|  Frontend (3000):ONLINE                       |"
} else {
    Write-Host "|  Frontend (3000):OFFLINE (check log)          |"
}
Write-Host "|                                               |"
Write-Host "|  Frontend:  http://localhost:3000             |"
Write-Host "|  Backend:   http://localhost:4000             |"
Write-Host "|  Logs:      E:\converter-tool\tmp\logs        |"
Write-Host "|                                               |"
Write-Host "|  Run .\stop_all_locally.ps1 to shut down.     |"
Write-Host "+-----------------------------------------------+"
Write-Host ""
