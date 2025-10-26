# 🚀 DEPLOY SMART CONTRACTS TO TESTNET

## 📋 **COMPLETE DEPLOYMENT GUIDE**

---

## 🌐 **RECOMMENDED TESTNET: SEPOLIA**

### Why Sepolia?
- ✅ Ethereum's official testnet
- ✅ Long-term support
- ✅ Free testnet ETH from faucets
- ✅ Etherscan verification
- ✅ Similar to Ethereum mainnet

---

## 🎯 **STEP-BY-STEP DEPLOYMENT**

### **PHASE 1: GET TESTNET ETH** 💰

#### Step 1: Get Your Wallet Address

1. **Open MetaMask**
2. **Copy your wallet address** (starts with 0x...)
3. Example: `0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266`

#### Step 2: Get Free Testnet ETH

**Option A: Alchemy Sepolia Faucet** (Recommended)
```
1. Go to: https://sepoliafaucet.com/
2. Sign in with Alchemy account (free)
3. Paste your wallet address
4. Click "Send Me ETH"
5. Wait 1-2 minutes
6. Check MetaMask - you should have 0.5 SepoliaETH!
```

**Option B: Infura Faucet**
```
https://www.infura.io/faucet/sepolia
```

**Option C: QuickNode Faucet**
```
https://faucet.quicknode.com/ethereum/sepolia
```

**Option D: Multiple Faucets (Get more!)**
```
https://faucetlink.to/sepolia
```

---

### **PHASE 2: SETUP DEPLOYMENT** ⚙️

#### Step 1: Add Sepolia Network to MetaMask

1. **Open MetaMask**
2. **Click Network Dropdown** (top)
3. **Click "Add Network"**
4. **Add Network Manually**
5. **Enter Details:**

```
Network Name: Sepolia Testnet
RPC URL: https://rpc.sepolia.org
Chain ID: 11155111
Currency Symbol: ETH
Block Explorer: https://sepolia.etherscan.io
```

6. **Click Save**
7. **Switch to Sepolia Network**

#### Step 2: Get Infura API Key (Free)

1. **Go to:** https://www.infura.io/
2. **Sign Up** (free account)
3. **Create New Project:**
   - Name: "Municipal Fund"
   - Product: "Web3 API"
4. **Copy API Key** (you'll need this!)
5. Example: `9aa3d95b3bc440fa88ea12eaa4456161`

#### Step 3: Export Your Private Key (⚠️ CAREFUL!)

1. **Open MetaMask**
2. **Click** three dots (⋮)
3. **Account Details**
4. **Export Private Key**
5. **Enter Password**
6. **Copy Private Key** (Keep this SECRET!)
7. Example: `0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`

⚠️ **SECURITY WARNING:**
- NEVER share your private key!
- NEVER commit it to GitHub!
- Use a TEST wallet only for testnet!
- Generate a new wallet for production!

---

### **PHASE 3: CONFIGURE PROJECT** 🔧

#### Step 1: Create Environment File

Create `.env` in project root:

```bash
# c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main\.env

# Infura API Key
INFURA_API_KEY=your_infura_api_key_here

# Private Key (without 0x prefix)
PRIVATE_KEY=your_private_key_without_0x

# Etherscan API Key (for verification - optional)
ETHERSCAN_API_KEY=your_etherscan_api_key_here

# Example (replace with YOUR keys):
# INFURA_API_KEY=9aa3d95b3bc440fa88ea12eaa4456161
# PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
# ETHERSCAN_API_KEY=ABC123DEF456GHI789
```

#### Step 2: Update Hardhat Config

Your `hardhat.config.js` should look like this:

```javascript
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },
  networks: {
    // Local Hardhat Network
    hardhat: {
      chainId: 31337
    },
    
    // Localhost Network
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337
    },
    
    // Sepolia Testnet
    sepolia: {
      url: `https://sepolia.infura.io/v3/${process.env.INFURA_API_KEY}`,
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 11155111
    },
    
    // Mumbai Testnet (Polygon)
    mumbai: {
      url: "https://rpc-mumbai.maticvigil.com",
      accounts: process.env.PRIVATE_KEY ? [`0x${process.env.PRIVATE_KEY}`] : [],
      chainId: 80001
    }
  },
  
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || ""
    }
  },
  
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
```

---

### **PHASE 4: CREATE DEPLOYMENT SCRIPT** 📝

Create `scripts/deploy-testnet.js`:

```javascript
const hre = require("hardhat");
const fs = require("fs");

async function main() {
  console.log("\n" + "=".repeat(70));
  console.log("🚀 DEPLOYING MUNICIPAL FUND CONTRACTS TO TESTNET");
  console.log("=".repeat(70) + "\n");

  // Get network info
  const network = await hre.ethers.provider.getNetwork();
  console.log("📡 Network:", network.name);
  console.log("🔗 Chain ID:", network.chainId);

  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("👤 Deploying with account:", deployer.address);
  
  const balance = await deployer.getBalance();
  console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

  if (balance.isZero()) {
    throw new Error("❌ Insufficient funds! Get testnet ETH from faucet.");
  }

  const deployedContracts = {};

  try {
    // 1. Deploy FundManagement
    console.log("1️⃣ Deploying FundManagement...");
    const FundManagement = await hre.ethers.getContractFactory("FundManagement");
    const fundManagement = await FundManagement.deploy();
    await fundManagement.deployed();
    deployedContracts.FundManagement = fundManagement.address;
    console.log("✅ FundManagement deployed to:", fundManagement.address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${fundManagement.address}\n`);

    // 2. Deploy ProjectRegistry
    console.log("2️⃣ Deploying ProjectRegistry...");
    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.deployed();
    deployedContracts.ProjectRegistry = projectRegistry.address;
    console.log("✅ ProjectRegistry deployed to:", projectRegistry.address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${projectRegistry.address}\n`);

    // 3. Deploy AnonymousTenderSystem
    console.log("3️⃣ Deploying AnonymousTenderSystem...");
    const AnonymousTenderSystem = await hre.ethers.getContractFactory("AnonymousTenderSystem");
    const tenderSystem = await AnonymousTenderSystem.deploy();
    await tenderSystem.deployed();
    deployedContracts.AnonymousTenderSystem = tenderSystem.address;
    console.log("✅ AnonymousTenderSystem deployed to:", tenderSystem.address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${tenderSystem.address}\n`);

    // 4. Deploy ApprovalWorkflow
    console.log("4️⃣ Deploying ApprovalWorkflow...");
    const ApprovalWorkflow = await hre.ethers.getContractFactory("ApprovalWorkflow");
    const approvalWorkflow = await ApprovalWorkflow.deploy();
    await approvalWorkflow.deployed();
    deployedContracts.ApprovalWorkflow = approvalWorkflow.address;
    console.log("✅ ApprovalWorkflow deployed to:", approvalWorkflow.address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${approvalWorkflow.address}\n`);

    // 5. Deploy DocumentVerification
    console.log("5️⃣ Deploying DocumentVerification...");
    const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
    const documentVerification = await DocumentVerification.deploy();
    await documentVerification.deployed();
    deployedContracts.DocumentVerification = documentVerification.address;
    console.log("✅ DocumentVerification deployed to:", documentVerification.address);
    console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${documentVerification.address}\n`);

    console.log("=".repeat(70));
    console.log("🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!");
    console.log("=".repeat(70) + "\n");

    // Print summary
    console.log("📋 DEPLOYMENT SUMMARY:");
    console.log("─".repeat(70));
    for (const [name, address] of Object.entries(deployedContracts)) {
      console.log(`${name.padEnd(30)} ${address}`);
    }
    console.log("─".repeat(70) + "\n");

    // Save to file
    const deploymentInfo = {
      network: network.name,
      chainId: network.chainId,
      deployer: deployer.address,
      timestamp: new Date().toISOString(),
      contracts: deployedContracts
    };

    fs.writeFileSync(
      "deployment-info.json",
      JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("💾 Deployment info saved to: deployment-info.json\n");

    // Create frontend config
    const frontendConfig = {
      REACT_APP_NETWORK: network.name,
      REACT_APP_CHAIN_ID: network.chainId,
      REACT_APP_FUND_MANAGEMENT_ADDRESS: fundManagement.address,
      REACT_APP_PROJECT_REGISTRY_ADDRESS: projectRegistry.address,
      REACT_APP_TENDER_SYSTEM_ADDRESS: tenderSystem.address,
      REACT_APP_APPROVAL_WORKFLOW_ADDRESS: approvalWorkflow.address,
      REACT_APP_DOCUMENT_VERIFICATION_ADDRESS: documentVerification.address
    };

    let envContent = "\n# Smart Contract Addresses (Testnet)\n";
    for (const [key, value] of Object.entries(frontendConfig)) {
      envContent += `${key}=${value}\n`;
    }

    fs.appendFileSync("frontend/.env", envContent);
    console.log("✅ Contract addresses added to frontend/.env\n");

    console.log("🔐 NEXT STEPS:");
    console.log("1. Verify contracts on Etherscan (optional)");
    console.log("2. Restart your frontend to load new addresses");
    console.log("3. Switch MetaMask to Sepolia network");
    console.log("4. Test your application with real testnet!\n");

    // Test basic functionality
    console.log("🧪 Testing Basic Functionality...\n");

    console.log("Test 1: Creating a project...");
    const tx1 = await projectRegistry.createProject(
      "Test Road Construction",
      "5km road renovation project",
      "Mumbai, Maharashtra",
      hre.ethers.utils.parseEther("100"),
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 86400 * 30,
      "QmTestHash123"
    );
    await tx1.wait();
    console.log("✅ Project created! TX:", tx1.hash);

    const project = await projectRegistry.getProject(1);
    console.log("📊 Project Name:", project.name);
    console.log("💰 Project Budget:", hre.ethers.utils.formatEther(project.budget), "ETH\n");

    console.log("🎊 DEPLOYMENT COMPLETE AND VERIFIED!");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:", error.message);
    throw error;
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
```

---

### **PHASE 5: DEPLOY TO TESTNET** 🚀

#### Command:

```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"

# Deploy to Sepolia
npx hardhat run scripts/deploy-testnet.js --network sepolia
```

#### Expected Output:

```
======================================================================
🚀 DEPLOYING MUNICIPAL FUND CONTRACTS TO TESTNET
======================================================================

📡 Network: sepolia
🔗 Chain ID: 11155111
👤 Deploying with account: 0xYourAddress...
💰 Account balance: 0.5 ETH

1️⃣ Deploying FundManagement...
✅ FundManagement deployed to: 0xABC123...
🔗 View on Etherscan: https://sepolia.etherscan.io/address/0xABC123...

2️⃣ Deploying ProjectRegistry...
✅ ProjectRegistry deployed to: 0xDEF456...

[... all 5 contracts deployed ...]

🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!

📋 DEPLOYMENT SUMMARY:
──────────────────────────────────────────────────────────────────────
FundManagement                0xABC123...
ProjectRegistry               0xDEF456...
AnonymousTenderSystem         0xGHI789...
ApprovalWorkflow              0xJKL012...
DocumentVerification          0xMNO345...
──────────────────────────────────────────────────────────────────────

💾 Deployment info saved to: deployment-info.json
✅ Contract addresses added to frontend/.env

🎊 DEPLOYMENT COMPLETE AND VERIFIED!
```

---

### **PHASE 6: VERIFY CONTRACTS ON ETHERSCAN** ✅

#### Step 1: Get Etherscan API Key

1. **Go to:** https://etherscan.io/
2. **Sign Up** (free)
3. **API Keys** → **Add**
4. **Copy API Key**
5. **Add to `.env`:**
   ```
   ETHERSCAN_API_KEY=your_etherscan_api_key
   ```

#### Step 2: Verify Each Contract

```powershell
# Verify FundManagement
npx hardhat verify --network sepolia 0xYourFundManagementAddress

# Verify ProjectRegistry
npx hardhat verify --network sepolia 0xYourProjectRegistryAddress

# Verify AnonymousTenderSystem
npx hardhat verify --network sepolia 0xYourTenderSystemAddress

# Verify ApprovalWorkflow
npx hardhat verify --network sepolia 0xYourApprovalWorkflowAddress

# Verify DocumentVerification
npx hardhat verify --network sepolia 0xYourDocumentVerificationAddress
```

#### Expected Output:

```
Successfully submitted source code for contract
contracts/FundManagement.sol:FundManagement at 0xABC123...
for verification on the block explorer. Waiting for verification result...

Successfully verified contract FundManagement on Etherscan.
https://sepolia.etherscan.io/address/0xABC123...#code
```

---

### **PHASE 7: UPDATE FRONTEND** 🎨

Your `frontend/.env` will be automatically updated with contract addresses!

Check `frontend/.env` - you should see:

```bash
# Smart Contract Addresses (Testnet)
REACT_APP_NETWORK=sepolia
REACT_APP_CHAIN_ID=11155111
REACT_APP_FUND_MANAGEMENT_ADDRESS=0xABC123...
REACT_APP_PROJECT_REGISTRY_ADDRESS=0xDEF456...
REACT_APP_TENDER_SYSTEM_ADDRESS=0xGHI789...
REACT_APP_APPROVAL_WORKFLOW_ADDRESS=0xJKL012...
REACT_APP_DOCUMENT_VERIFICATION_ADDRESS=0xMNO345...
```

#### Restart Frontend:

```powershell
cd frontend
# Stop with Ctrl+C
npm start
```

---

### **PHASE 8: TEST YOUR LIVE APP** 🧪

#### Step 1: Switch MetaMask to Sepolia

1. **Open MetaMask**
2. **Select "Sepolia Testnet"**
3. **Verify you have testnet ETH**

#### Step 2: Open Your App

```
http://localhost:3002
```

#### Step 3: Connect & Test

1. **Click "Connect Wallet"**
2. **Approve in MetaMask**
3. **Create a test project**
4. **Transaction will appear in MetaMask**
5. **Approve transaction**
6. **Wait for confirmation**
7. **Check Etherscan** for transaction!

#### Step 4: View on Etherscan

```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS

You can see:
- Contract code ✅
- All transactions ✅
- Read/Write functions ✅
- Events emitted ✅
```

---

## 🎯 **TROUBLESHOOTING**

### Issue: "Insufficient Funds"

**Solution:**
```
Get more testnet ETH from faucets:
- https://sepoliafaucet.com/
- https://faucetlink.to/sepolia
```

### Issue: "nonce too low"

**Solution:**
```
1. Open MetaMask
2. Settings → Advanced
3. Reset Account
4. Try again
```

### Issue: "Cannot find module hardhat"

**Solution:**
```powershell
# Use Remix instead:
1. Go to https://remix.ethereum.org/
2. Upload contracts
3. Compile
4. Deploy → Select "Injected Provider - MetaMask"
5. MetaMask will connect to Sepolia
6. Deploy!
```

### Issue: "Private key error"

**Solution:**
```
1. Make sure .env file exists
2. Private key should NOT have 0x prefix in .env
3. Restart terminal
4. Try: echo $env:PRIVATE_KEY (should show key)
```

---

## 📋 **DEPLOYMENT CHECKLIST**

### Before Deployment:
- [ ] ✅ Got testnet ETH from faucet (0.5+ ETH)
- [ ] ✅ Added Sepolia network to MetaMask
- [ ] ✅ Created Infura account & got API key
- [ ] ✅ Exported private key from MetaMask
- [ ] ✅ Created `.env` file with credentials
- [ ] ✅ Updated `hardhat.config.js`
- [ ] ✅ Created `deploy-testnet.js` script

### During Deployment:
- [ ] ⏳ Run: `npx hardhat run scripts/deploy-testnet.js --network sepolia`
- [ ] ⏳ Wait for all 5 contracts to deploy
- [ ] ⏳ Note all contract addresses
- [ ] ⏳ Verify `deployment-info.json` created

### After Deployment:
- [ ] ⏳ Verify contracts on Etherscan (optional)
- [ ] ⏳ Check contract addresses added to `frontend/.env`
- [ ] ⏳ Restart frontend
- [ ] ⏳ Switch MetaMask to Sepolia
- [ ] ⏳ Test application with real transactions!

---

## 🎉 **SUCCESS INDICATORS**

✅ **Deployment Successful If You See:**
- All 5 contracts deployed with addresses
- Etherscan links for each contract
- `deployment-info.json` file created
- Contract addresses in `frontend/.env`
- Can view contracts on Etherscan
- Test transaction succeeds

---

## 💰 **COST ESTIMATE**

### Sepolia Testnet (FREE!):
```
- Testnet ETH: FREE (from faucets)
- Deployment: FREE (using testnet)
- Transactions: FREE (using testnet)
- Verification: FREE

Total Cost: $0.00 ✅
```

### Ethereum Mainnet (For Reference):
```
- Deployment: ~$500-1000 (at current gas prices)
- Each transaction: $10-50
- Total for 5 contracts: ~$2500-5000

(Don't deploy to mainnet yet! Use testnet first!)
```

---

## 🚀 **QUICK START COMMANDS**

```powershell
# 1. Setup
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"

# 2. Create .env with your keys
# (Add INFURA_API_KEY and PRIVATE_KEY)

# 3. Create deployment script
# (Copy deploy-testnet.js from above)

# 4. Deploy!
npx hardhat run scripts/deploy-testnet.js --network sepolia

# 5. Verify (optional)
npx hardhat verify --network sepolia CONTRACT_ADDRESS

# 6. Test in browser
# - Switch MetaMask to Sepolia
# - Open http://localhost:3002
# - Connect wallet & test!
```

---

## 📚 **HELPFUL RESOURCES**

- **Sepolia Faucet:** https://sepoliafaucet.com/
- **Infura Dashboard:** https://app.infura.io/
- **Sepolia Etherscan:** https://sepolia.etherscan.io/
- **Hardhat Docs:** https://hardhat.org/getting-started/
- **Ethers.js Docs:** https://docs.ethers.org/

---

**Ready to deploy your contracts to testnet?** 🚀

Would you like me to help you with any specific step?
