# 🛑 STOP ALL HARDHAT NETWORKS
# Kills all Node.js processes running Hardhat

Write-Host "🛑 Stopping all Hardhat networks..." -ForegroundColor Yellow

# Find all node processes running hardhat
$hardhatProcesses = Get-Process -Name node -ErrorAction SilentlyContinue | Where-Object {
    $_.CommandLine -like "*hardhat*node*"
}

if ($hardhatProcesses) {
    Write-Host "Found $($hardhatProcesses.Count) Hardhat network(s) running" -ForegroundColor Cyan
    
    foreach ($process in $hardhatProcesses) {
        Write-Host "Stopping process $($process.Id)..." -ForegroundColor Red
        Stop-Process -Id $process.Id -Force
    }
    
    Write-Host "✅ All Hardhat networks stopped!" -ForegroundColor Green
} else {
    Write-Host "No Hardhat networks found running" -ForegroundColor Yellow
}

# Alternative: Kill all processes on specific ports
Write-Host ""
Write-Host "Checking ports 8545-8548..." -ForegroundColor Cyan

$ports = @(8545, 8546, 8547, 8548)

foreach ($port in $ports) {
    $connection = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue
    
    if ($connection) {
        $processId = $connection.OwningProcess
        Write-Host "Killing process $processId on port $port" -ForegroundColor Red
        Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    }
}

Write-Host ""
Write-Host "✅ Cleanup complete!" -ForegroundColor Green
