# 🏛️ CUSTOM NETWORK & WALLET SETUP FOR MUNICIPAL FUND SYSTEM

## 🎯 Overview

This guide sets up **separate wallet addresses** for different roles on a **custom localhost network**:
- **Admin Wallet** - Creates projects, manages system
- **Supervisor Wallet** - Approves tenders, verifies milestones
- **Contractor Wallets** - Submit bids, complete work
- **Citizen Wallet** - View transparency reports

All use the **same custom network** but have **different wallet addresses** for role-based access.

---

## 🌐 CUSTOM LOCALHOST NETWORK SETUP

### Network Details:
```
Network Name: Municipal Fund Network
RPC URL: http://127.0.0.1:8545
Chain ID: 1337
Currency Symbol: ETH
Block Explorer: (Not needed for localhost)
```

---

## 👛 WALLET ADDRESSES FOR EACH ROLE

These are **Hardhat's default test accounts** - perfect for local development!

### 🔴 Admin Wallet (Account #0)
```
Address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
Private Key: 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
Initial Balance: 10,000 ETH (test)
Role: System Admin
Permissions:
  ✅ Create new projects
  ✅ Allocate funds to projects
  ✅ Manage system settings
  ✅ View all transactions
```

### 🟢 Supervisor Wallet (Account #1)
```
Address: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
Private Key: 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
Initial Balance: 10,000 ETH (test)
Role: Project Supervisor
Permissions:
  ✅ Approve tenders anonymously
  ✅ Verify milestone completion
  ✅ View project details
  ❌ Cannot create projects
```

### 🔵 Contractor Wallet #1 (Account #2)
```
Address: 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Initial Balance: 10,000 ETH (test)
Role: Contractor
Permissions:
  ✅ Submit tenders/bids
  ✅ Complete milestones
  ✅ Receive payments
  ❌ Cannot approve tenders
```

### 🟡 Contractor Wallet #2 (Account #3)
```
Address: 0x90F79bf6EB2c4f870365E785982E1f101E93b906
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Initial Balance: 10,000 ETH (test)
Role: Contractor
Permissions:
  ✅ Submit tenders/bids
  ✅ Complete milestones
  ✅ Receive payments
  ❌ Cannot approve tenders
```

### 🟣 Citizen Wallet (Account #4)
```
Address: 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65
Private Key: 0x47e179ec197488593b187f80a00eb0da91f1b9d0b13f8733639f19c30a34926a
Initial Balance: 10,000 ETH (test)
Role: Citizen/Public
Permissions:
  ✅ View public project information
  ✅ Track fund allocation transparency
  ❌ Cannot create or approve projects
```

---

## 🚀 STEP-BY-STEP SETUP GUIDE

### Step 1: Add Custom Network to MetaMask

1. **Open MetaMask Extension**
   - Click the MetaMask icon in your browser

2. **Click Network Dropdown** (at the top)
   - Shows current network (e.g., "Ethereum Mainnet")

3. **Click "Add Network"**
   - Then click "Add a network manually"

4. **Fill in Network Details:**
   ```
   Network Name: Municipal Fund Network
   RPC URL: http://127.0.0.1:8545
   Chain ID: 1337
   Currency Symbol: ETH
   ```

5. **Click "Save"**
   - Network is now added!

6. **Switch to Municipal Fund Network**
   - Click network dropdown
   - Select "Municipal Fund Network"

---

### Step 2: Import Admin Wallet

1. **Click Account Icon** (top right in MetaMask)
2. **Click "Import Account"**
3. **Paste Admin Private Key:**
   ```
   0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
   ```
4. **Click "Import"**
5. **Rename Account** (optional):
   - Click the three dots next to account
   - Click "Account details"
   - Click pencil icon
   - Rename to "Admin Wallet"

**✅ Admin wallet is ready!**

---

### Step 3: Import Supervisor Wallet

1. **Click Account Icon** (top right in MetaMask)
2. **Click "Import Account"**
3. **Paste Supervisor Private Key:**
   ```
   0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
   ```
4. **Click "Import"**
5. **Rename to "Supervisor Wallet"**

**✅ Supervisor wallet is ready!**

---

### Step 4: Import Contractor Wallets (Optional)

Repeat the same process for contractors:

**Contractor #1:**
```
Private Key: 0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
Rename to: Contractor 1
```

**Contractor #2:**
```
Private Key: 0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
Rename to: Contractor 2
```

---

## 🔄 HOW TO SWITCH BETWEEN WALLETS

### During Testing:

1. **Click Account Dropdown** in MetaMask (top center)
2. **Select the wallet** you want to use:
   - Admin Wallet → for creating projects
   - Supervisor Wallet → for approving tenders
   - Contractor Wallet → for submitting bids

3. **Refresh Your Application** after switching
   - The app will detect the new wallet
   - Your role will automatically change

---

## 🎭 TESTING WORKFLOW

### Scenario: Complete Project Lifecycle

#### Phase 1: Admin Creates Project
1. **Switch to Admin Wallet** in MetaMask
2. **Login to app** with Admin credentials
3. **Connect Admin Wallet**
4. **Create New Project**:
   - Project Name: "Road Construction"
   - Budget: 1000 ETH
   - Description: "Main street renovation"

#### Phase 2: Contractor Submits Tender
1. **Switch to Contractor Wallet** in MetaMask
2. **Login as Contractor**
3. **Connect Contractor Wallet**
4. **Submit Tender**:
   - Bid Amount: 800 ETH
   - Timeline: 6 months
   - Proposal: Detailed plan

#### Phase 3: Supervisor Approves (Anonymous)
1. **Switch to Supervisor Wallet** in MetaMask
2. **Login as Supervisor**
3. **Connect Supervisor Wallet**
4. **View Pending Tenders**
   - ✅ Contractor identity is HIDDEN (anonymous)
   - Only sees: Bid amount, timeline, proposal
5. **Approve Tender**
   - Evaluates based on merit
   - Cannot see who submitted

#### Phase 4: Smart Contract Executes
1. **Contract automatically reveals** contractor identity
2. **Funds released** to contractor wallet
3. **All transactions recorded** on blockchain

---

## 🔐 BACKEND CONFIGURATION

Update your backend to recognize wallet addresses by role:

### Update `backend/server.py`:

```python
# Role-based wallet addresses
ROLE_ADDRESSES = {
    # Admin
    '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266': {
        'role': 'admin',
        'name': 'System Administrator',
        'permissions': ['create_project', 'allocate_funds', 'manage_system']
    },
    
    # Supervisor
    '0x70997970C51812dc3A010C7d01b50e0d17dc79C8': {
        'role': 'supervisor',
        'name': 'Project Supervisor',
        'permissions': ['approve_tender', 'verify_milestone', 'view_projects']
    },
    
    # Contractor 1
    '0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC': {
        'role': 'contractor',
        'name': 'Contractor A',
        'permissions': ['submit_tender', 'complete_milestone', 'view_own_projects']
    },
    
    # Contractor 2
    '0x90F79bf6EB2c4f870365E785982E1f101E93b906': {
        'role': 'contractor',
        'name': 'Contractor B',
        'permissions': ['submit_tender', 'complete_milestone', 'view_own_projects']
    },
    
    # Citizen
    '0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65': {
        'role': 'citizen',
        'name': 'Public Citizen',
        'permissions': ['view_public_info']
    }
}

# Wallet-based authentication endpoint
@app.route('/api/auth/wallet', methods=['POST'])
def authenticate_wallet():
    data = request.json
    address = data.get('address', '').lower()
    
    # Check if address is registered
    role_info = ROLE_ADDRESSES.get(address)
    
    if role_info:
        return jsonify({
            'success': True,
            'user': {
                'address': address,
                'role': role_info['role'],
                'name': role_info['name'],
                'permissions': role_info['permissions']
            }
        })
    else:
        # Default to contractor role for unregistered addresses
        return jsonify({
            'success': True,
            'user': {
                'address': address,
                'role': 'contractor',
                'name': 'Guest Contractor',
                'permissions': ['submit_tender', 'view_own_projects']
            }
        })
```

---

## 🎨 FRONTEND AUTO-AUTHENTICATION

Update your frontend to auto-authenticate based on connected wallet:

### Update `frontend/src/App.js`:

```javascript
const connectWallet = async () => {
  if (!window.ethereum) {
    alert('Please install MetaMask');
    return;
  }

  try {
    setIsConnecting(true);
    
    const web3Provider = new ethers.providers.Web3Provider(window.ethereum);
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    const web3Signer = web3Provider.getSigner();
    const address = await web3Signer.getAddress();
    const network = await web3Provider.getNetwork();

    setProvider(web3Provider);
    setSigner(web3Signer);
    setAccount(address);
    setChainId(Number(network.chainId));

    // Auto-authenticate based on wallet address
    const response = await fetch(`${API}/auth/wallet`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address: address.toLowerCase() })
    });

    const data = await response.json();
    
    if (data.success) {
      handleLogin(data.user);
      console.log('✅ Authenticated as:', data.user.role);
    }
  } catch (error) {
    console.error('❌ Error connecting wallet:', error);
    alert('Failed to connect wallet');
  } finally {
    setIsConnecting(false);
  }
};
```

---

## 📊 WALLET COMPARISON TABLE

| Role | Address (Last 4) | Can Create Projects | Can Approve Tenders | Can Submit Bids | View All Projects |
|------|------------------|---------------------|---------------------|-----------------|-------------------|
| **Admin** | ...2266 | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| **Supervisor** | ...79C8 | ❌ No | ✅ Yes (Anonymous) | ❌ No | ✅ Yes |
| **Contractor 1** | ...93BC | ❌ No | ❌ No | ✅ Yes | ❌ Own Only |
| **Contractor 2** | ...b906 | ❌ No | ❌ No | ✅ Yes | ❌ Own Only |
| **Citizen** | ...6A65 | ❌ No | ❌ No | ❌ No | ✅ Public Info |

---

## 🔒 SECURITY NOTES

### ⚠️ IMPORTANT WARNINGS:

1. **NEVER use these private keys on mainnet or real networks!**
   - These are Hardhat's PUBLIC default keys
   - Everyone knows these keys
   - Only for LOCAL TESTING

2. **For Production:**
   - Generate new random wallet addresses
   - Keep private keys secret
   - Use hardware wallets for admin roles
   - Implement multi-sig for critical operations

3. **Network Security:**
   - Localhost network is NOT secure
   - Don't expose port 8545 to internet
   - Use VPN for remote team testing

---

## 🧪 TESTING CHECKLIST

### Before Testing:
- [ ] Hardhat node is running (`npx hardhat node`)
- [ ] Backend server is running (`py server.py`)
- [ ] Frontend is running (`npx craco start`)
- [ ] MetaMask has Custom Network added
- [ ] All wallets imported to MetaMask

### Test Flow:
- [ ] Switch to Admin wallet → Create project
- [ ] Switch to Contractor wallet → Submit tender
- [ ] Switch to Supervisor wallet → Approve tender (can't see contractor name)
- [ ] Verify smart contract executed
- [ ] Check all wallets received/sent correct amounts
- [ ] View transaction history from any wallet

---

## 🎯 QUICK REFERENCE CARD

### Copy-Paste Ready:

**Network Configuration:**
```
Name: Municipal Fund Network
RPC: http://127.0.0.1:8545
Chain ID: 1337
Symbol: ETH
```

**Admin Import:**
```
0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

**Supervisor Import:**
```
0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d
```

**Contractor 1 Import:**
```
0x5de4111afa1a4b94908f83103eb1f1706367c2e68ca870fc3fb9a804cdab365a
```

**Contractor 2 Import:**
```
0x7c852118294e51e653712a81e05800f419141751be58f605c371e15141b007a6
```

---

## 🔧 TROUBLESHOOTING

### Wallet Won't Connect:
- Make sure you're on "Municipal Fund Network" in MetaMask
- Try disconnecting and reconnecting
- Clear MetaMask activity data (Settings → Advanced)

### Wrong Role Displayed:
- Check you're using the correct wallet address
- Backend must be restarted after configuration changes
- Clear browser cache

### Can't See Balance:
- Make sure Hardhat node is running
- Check Chain ID is 1337
- RPC URL must be exactly `http://127.0.0.1:8545`

### Transaction Fails:
- Check you have enough ETH for gas
- Verify you're on correct network
- Check smart contract is deployed

---

## 🎉 YOU'RE ALL SET!

You now have:
✅ Custom localhost network configured
✅ Separate wallets for each role
✅ All wallets imported to MetaMask
✅ Role-based permissions system
✅ Anonymous tender evaluation workflow

**Start testing by switching between wallets in MetaMask!** 🚀
