# 🌐 SEPARATE RPC NETWORKS FOR EACH ROLE

## 🎯 Overview

This guide provides **completely separate custom networks** with different RPC URLs for each role. Each role operates on their own isolated blockchain network.

---

## 🔴 OPTION 1: SEPARATE HARDHAT INSTANCES (RECOMMENDED)

### Concept:
Run **multiple Hardhat nodes** on different ports, creating completely isolated blockchain networks for each role.

### Network Configuration:

#### 🔴 Admin Network
```
Network Name: Municipal Admin Network
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
Color Code: RED

Admin Wallet:
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 🟢 Supervisor Network
```
Network Name: Municipal Supervisor Network
RPC URL: http://127.0.0.1:8546
Chain ID: 1338
Currency Symbol: ETH
Color Code: GREEN

Supervisor Wallet:
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 🔵 Contractor Network
```
Network Name: Municipal Contractor Network
RPC URL: http://127.0.0.1:8547
Chain ID: 1339
Currency Symbol: ETH
Color Code: BLUE

Contractor Wallet:
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

#### 🟡 Citizen Network
```
Network Name: Municipal Citizen Network
RPC URL: http://127.0.0.1:8548
Chain ID: 1340
Currency Symbol: ETH
Color Code: YELLOW

Citizen Wallet:
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

## 🚀 SETUP INSTRUCTIONS

### Step 1: Create Hardhat Config for Multiple Networks

Create `hardhat.multiple.config.js`:

```javascript
require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    // Admin Network - Port 8545
    admin: {
      url: "http://127.0.0.1:8545",
      chainId: 1337,
      accounts: [
        "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
      ]
    },
    
    // Supervisor Network - Port 8546
    supervisor: {
      url: "http://127.0.0.1:8546",
      chainId: 1338,
      accounts: [
        "0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d"
      ]
    },
    
    // Contractor Network - Port 8547
    contractor: {
      url: "http://127.0.0.1:8547",
      chainId: 1339,
      accounts: [
        "0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a"
      ]
    },
    
    // Citizen Network - Port 8548
    citizen: {
      url: "http://127.0.0.1:8548",
      chainId: 1340,
      accounts: [
        "0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a"
      ]
    }
  }
};
```

### Step 2: Start Multiple Hardhat Nodes

Open **4 separate PowerShell terminals**:

#### Terminal 1 - Admin Network (Port 8545)
```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"
npx hardhat node --port 8545 --network localhost
```

#### Terminal 2 - Supervisor Network (Port 8546)
```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"
npx hardhat node --port 8546 --network localhost
```

#### Terminal 3 - Contractor Network (Port 8547)
```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"
npx hardhat node --port 8547 --network localhost
```

#### Terminal 4 - Citizen Network (Port 8548)
```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"
npx hardhat node --port 8548 --network localhost
```

### Step 3: Add All Networks to MetaMask

**Network 1 - Admin:**
- Name: Municipal Admin Network
- RPC: http://127.0.0.1:8545
- Chain ID: 1337
- Symbol: ETH

**Network 2 - Supervisor:**
- Name: Municipal Supervisor Network
- RPC: http://127.0.0.1:8546
- Chain ID: 1338
- Symbol: ETH

**Network 3 - Contractor:**
- Name: Municipal Contractor Network
- RPC: http://127.0.0.1:8547
- Chain ID: 1339
- Symbol: ETH

**Network 4 - Citizen:**
- Name: Municipal Citizen Network
- RPC: http://127.0.0.1:8548
- Chain ID: 1340
- Symbol: ETH

---

## 🔴 OPTION 2: PUBLIC TESTNET NETWORKS (INTERNET REQUIRED)

### Use different public testnets for each role:

#### 🔴 Admin - Sepolia Testnet
```
Network Name: Sepolia (Admin)
RPC URL: https://sepolia.infura.io/v3/YOUR_INFURA_KEY
Chain ID: 11155111
Currency Symbol: ETH
Explorer: https://sepolia.etherscan.io
```

#### 🟢 Supervisor - Goerli Testnet
```
Network Name: Goerli (Supervisor)
RPC URL: https://goerli.infura.io/v3/YOUR_INFURA_KEY
Chain ID: 5
Currency Symbol: ETH
Explorer: https://goerli.etherscan.io
```

#### 🔵 Contractor - Mumbai Testnet (Polygon)
```
Network Name: Mumbai (Contractor)
RPC URL: https://rpc-mumbai.maticvigil.com
Chain ID: 80001
Currency Symbol: MATIC
Explorer: https://mumbai.polygonscan.com
```

#### 🟡 Citizen - BSC Testnet
```
Network Name: BSC Testnet (Citizen)
RPC URL: https://data-seed-prebsc-1-s1.binance.org:8545
Chain ID: 97
Currency Symbol: BNB
Explorer: https://testnet.bscscan.com
```

**Note:** Public testnets require:
- Real testnet tokens (get from faucets)
- Internet connection
- May have slower transaction times

---

## 🔴 OPTION 3: GANACHE MULTIPLE INSTANCES

### Using Ganache GUI or CLI:

#### Install Ganache CLI:
```powershell
npm install -g ganache
```

#### Start Multiple Ganache Instances:

**Terminal 1 - Admin (Port 7545):**
```powershell
ganache --port 7545 --networkId 1337 --chainId 1337
```

**Terminal 2 - Supervisor (Port 7546):**
```powershell
ganache --port 7546 --networkId 1338 --chainId 1338
```

**Terminal 3 - Contractor (Port 7547):**
```powershell
ganache --port 7547 --networkId 1339 --chainId 1339
```

**Terminal 4 - Citizen (Port 7548):**
```powershell
ganache --port 7548 --networkId 1340 --chainId 1340
```

#### MetaMask Configuration:

**Admin Network:**
- RPC: http://127.0.0.1:7545
- Chain ID: 1337

**Supervisor Network:**
- RPC: http://127.0.0.1:7546
- Chain ID: 1338

**Contractor Network:**
- RPC: http://127.0.0.1:7547
- Chain ID: 1339

**Citizen Network:**
- RPC: http://127.0.0.1:7548
- Chain ID: 1340

---

## 🔴 OPTION 4: CUSTOM PORT CONFIGURATION (SIMPLEST)

### Just use different ports on same machine:

```javascript
// Admin
RPC: http://127.0.0.1:8545  (Chain ID: 1337)

// Supervisor  
RPC: http://127.0.0.1:8546  (Chain ID: 1338)

// Contractor
RPC: http://127.0.0.1:8547  (Chain ID: 1339)

// Citizen
RPC: http://127.0.0.1:8548  (Chain ID: 1340)
```

**Or use localhost alias:**
```javascript
// Admin
RPC: http://localhost:8545

// Supervisor
RPC: http://localhost:8546

// Contractor
RPC: http://localhost:8547

// Citizen
RPC: http://localhost:8548
```

---

## 🔴 OPTION 5: REMOTE RPC URLS (FOR TEAM COLLABORATION)

### If team members are on different computers:

#### Computer 1 (Admin):
```
RPC: http://192.168.1.10:8545
Chain ID: 1337
```

#### Computer 2 (Supervisor):
```
RPC: http://192.168.1.20:8545
Chain ID: 1338
```

#### Computer 3 (Contractor):
```
RPC: http://192.168.1.30:8545
Chain ID: 1339
```

**Important:** 
- Replace `192.168.1.X` with actual computer IPs
- Configure firewall to allow port access
- Use `--hostname 0.0.0.0` when starting Hardhat:
  ```powershell
  npx hardhat node --hostname 0.0.0.0 --port 8545
  ```

---

## 📋 QUICK COPY-PASTE COMMANDS

### Start All 4 Hardhat Networks:

**PowerShell Script** (`start_all_networks.ps1`):
```powershell
# Start Admin Network
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main'; npx hardhat node --port 8545"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Supervisor Network
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main'; npx hardhat node --port 8546"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Contractor Network
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main'; npx hardhat node --port 8547"

# Wait 5 seconds
Start-Sleep -Seconds 5

# Start Citizen Network
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main'; npx hardhat node --port 8548"

Write-Host "✅ All 4 networks started!"
Write-Host "Admin: http://127.0.0.1:8545 (Chain ID 1337)"
Write-Host "Supervisor: http://127.0.0.1:8546 (Chain ID 1338)"
Write-Host "Contractor: http://127.0.0.1:8547 (Chain ID 1339)"
Write-Host "Citizen: http://127.0.0.1:8548 (Chain ID 1340)"
```

### Run the script:
```powershell
powershell -ExecutionPolicy Bypass -File start_all_networks.ps1
```

---

## 🎯 RECOMMENDED APPROACH

### ✅ Best Option: **OPTION 1 - Multiple Hardhat Instances**

**Why?**
- ✅ Completely isolated networks
- ✅ Full control over each network
- ✅ No internet required
- ✅ Fast transactions
- ✅ Easy to reset and test
- ✅ Each role has their own blockchain

**Setup Time:** 10 minutes
**Complexity:** Medium
**Best For:** Local development & testing

---

## 🧪 TESTING WORKFLOW

### Test with Separate Networks:

1. **Admin creates project on Port 8545:**
   - Switch MetaMask to "Municipal Admin Network"
   - Connect wallet
   - Create project → Recorded on Admin blockchain

2. **Supervisor evaluates on Port 8546:**
   - Switch MetaMask to "Municipal Supervisor Network"
   - Connect wallet
   - View tenders → Separate blockchain data

3. **Contractor submits on Port 8547:**
   - Switch MetaMask to "Municipal Contractor Network"
   - Connect wallet
   - Submit bid → Recorded on Contractor blockchain

---

## 🔧 TROUBLESHOOTING

### Port Already in Use:
```powershell
# Check what's using port 8545
netstat -ano | findstr :8545

# Kill the process
taskkill /PID <PID_NUMBER> /F
```

### Can't Connect to Network:
- Check Hardhat node is running in terminal
- Verify correct port number
- Try http://localhost:PORT instead of 127.0.0.1
- Clear MetaMask activity data

### Wrong Chain ID Error:
- Make sure Chain ID matches network configuration
- Delete network from MetaMask and re-add
- Restart Hardhat node

---

## 📊 NETWORK COMPARISON TABLE

| Network | Port | Chain ID | Use Case | Isolation |
|---------|------|----------|----------|-----------|
| **Admin** | 8545 | 1337 | Create projects, manage system | ✅ Separate blockchain |
| **Supervisor** | 8546 | 1338 | Approve tenders, verify work | ✅ Separate blockchain |
| **Contractor** | 8547 | 1339 | Submit bids, complete work | ✅ Separate blockchain |
| **Citizen** | 8548 | 1340 | View public information | ✅ Separate blockchain |

---

## 🎉 SUMMARY

**You now have 4 options for different RPC URLs:**

1. ⭐ **Multiple Hardhat Instances** (Recommended)
   - Ports: 8545, 8546, 8547, 8548
   - Chain IDs: 1337, 1338, 1339, 1340

2. 🌍 **Public Testnets** (Sepolia, Goerli, Mumbai, BSC)
   - Requires internet & testnet tokens

3. 🔧 **Ganache Instances** (Alternative to Hardhat)
   - Ports: 7545, 7546, 7547, 7548

4. 💻 **Remote Team Setup** (Different computers)
   - Use IP addresses: 192.168.1.X:8545

**Choose based on your needs!** 🚀
