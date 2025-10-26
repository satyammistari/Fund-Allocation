# 🚀 START ALL MUNICIPAL FUND NETWORKS
# Starts 4 separate Hardhat blockchain instances on different ports

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "🏛️  MUNICIPAL FUND BLOCKCHAIN - MULTI-NETWORK STARTUP" -ForegroundColor Yellow
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

$projectPath = "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"

# Check if Hardhat is installed
if (-not (Test-Path "$projectPath\node_modules\hardhat")) {
    Write-Host "❌ Hardhat not found! Installing dependencies..." -ForegroundColor Red
    Set-Location $projectPath
    npm install --legacy-peer-deps
}

Write-Host "🔴 Starting Admin Network (Port 8545, Chain ID 1337)..." -ForegroundColor Red
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '🔴 ADMIN NETWORK - Port 8545' -ForegroundColor Red; npx hardhat node --port 8545"
Start-Sleep -Seconds 3

Write-Host "🟢 Starting Supervisor Network (Port 8546, Chain ID 1338)..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '🟢 SUPERVISOR NETWORK - Port 8546' -ForegroundColor Green; npx hardhat node --port 8546"
Start-Sleep -Seconds 3

Write-Host "🔵 Starting Contractor Network (Port 8547, Chain ID 1339)..." -ForegroundColor Blue
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '🔵 CONTRACTOR NETWORK - Port 8547' -ForegroundColor Blue; npx hardhat node --port 8547"
Start-Sleep -Seconds 3

Write-Host "🟡 Starting Citizen Network (Port 8548, Chain ID 1340)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$projectPath'; Write-Host '🟡 CITIZEN NETWORK - Port 8548' -ForegroundColor Yellow; npx hardhat node --port 8548"
Start-Sleep -Seconds 3

Write-Host ""
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host "✅ ALL 4 NETWORKS STARTED SUCCESSFULLY!" -ForegroundColor Green
Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

Write-Host "📋 NETWORK DETAILS:" -ForegroundColor Yellow
Write-Host ""

Write-Host "🔴 Admin Network:" -ForegroundColor Red
Write-Host "   RPC URL: http://127.0.0.1:8545"
Write-Host "   Chain ID: 1337"
Write-Host "   Role: System Administrator"
Write-Host ""

Write-Host "🟢 Supervisor Network:" -ForegroundColor Green
Write-Host "   RPC URL: http://127.0.0.1:8546"
Write-Host "   Chain ID: 1338"
Write-Host "   Role: Project Supervisor"
Write-Host ""

Write-Host "🔵 Contractor Network:" -ForegroundColor Blue
Write-Host "   RPC URL: http://127.0.0.1:8547"
Write-Host "   Chain ID: 1339"
Write-Host "   Role: Contractor"
Write-Host ""

Write-Host "🟡 Citizen Network:" -ForegroundColor Yellow
Write-Host "   RPC URL: http://127.0.0.1:8548"
Write-Host "   Chain ID: 1340"
Write-Host "   Role: Public Citizen"
Write-Host ""

Write-Host "=" -NoNewline -ForegroundColor Cyan
Write-Host ("=" * 69) -ForegroundColor Cyan
Write-Host ""

Write-Host "📝 NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Add each network to MetaMask (see SEPARATE_RPC_NETWORKS.md)"
Write-Host "2. Import wallet private keys for each network"
Write-Host "3. Start your backend: cd backend; py server_wallet_auth.py"
Write-Host "4. Start your frontend: cd frontend; npx craco start"
Write-Host "5. Switch between networks in MetaMask to change roles"
Write-Host ""

Write-Host "⚠️  WARNING: These are TEST networks for LOCAL DEVELOPMENT ONLY!" -ForegroundColor Yellow
Write-Host ""

Write-Host "Press any key to continue..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
