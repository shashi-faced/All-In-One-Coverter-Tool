# ConvertForge - Stop All Services Locally
$ErrorActionPreference = "Continue"

Write-Host "Stopping ConvertForge services..."
$ports = @(3000, 4000, 6380)
foreach ($port in $ports) {
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    if ($connections) {
        foreach ($conn in $connections) {
            $owningPid = $conn.OwningProcess
            if ($owningPid) {
                Write-Host "Stopping process $owningPid listening on port $port"
                Stop-Process -Id $owningPid -Force -ErrorAction SilentlyContinue
            }
        }
    }
}
Write-Host "All services stopped."
