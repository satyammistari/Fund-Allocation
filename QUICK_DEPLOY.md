# 🚀 QUICK START: Deploy to Testnet in 5 Minutes

## ⚡ FAST DEPLOYMENT GUIDE

### **STEP 1: Get Testnet ETH** (2 minutes)

1. **Copy your MetaMask address**
2. **Visit:** https://sepoliafaucet.com/
3. **Paste address & click "Send Me ETH"**
4. **Wait 1-2 minutes**
5. ✅ You have 0.5 SepoliaETH!

---

### **STEP 2: Get Infura API Key** (1 minute)

1. **Visit:** https://www.infura.io/
2. **Sign up** (free)
3. **Create Project** → Name: "Municipal Fund"
4. **Copy API Key** (looks like: `9aa3d95b3bc440fa88ea12eaa4456161`)
5. ✅ Save this key!

---

### **STEP 3: Export Private Key** (1 minute)

⚠️ **Use a TEST wallet only!**

1. **Open MetaMask**
2. **Click ⋮** (three dots)
3. **Account Details** → **Export Private Key**
4. **Enter password**
5. **Copy** (WITHOUT 0x prefix)
6. Example: `ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80`
7. ✅ Keep this SECRET!

---

### **STEP 4: Create .env File** (30 seconds)

Create `c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main\.env`:

```bash
INFURA_API_KEY=paste_your_infura_key_here
PRIVATE_KEY=paste_your_private_key_here_without_0x
```

**Example:**
```bash
INFURA_API_KEY=9aa3d95b3bc440fa88ea12eaa4456161
PRIVATE_KEY=ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

---

### **STEP 5: Deploy!** (2 minutes)

```powershell
cd "c:\Users\SATYAM\Downloads\Muncipal-main\Muncipal-main"

npx hardhat run scripts/deploy-testnet.js --network sepolia
```

**Wait for:**
```
✅ FundManagement deployed to: 0x...
✅ ProjectRegistry deployed to: 0x...
✅ AnonymousTenderSystem deployed to: 0x...
✅ ApprovalWorkflow deployed to: 0x...
✅ DocumentVerification deployed to: 0x...

🎉 ALL CONTRACTS DEPLOYED SUCCESSFULLY!
```

---

### **STEP 6: Test Your App!** (1 minute)

1. **Switch MetaMask** to "Sepolia Testnet"
2. **Restart frontend:**
   ```powershell
   cd frontend
   npm start
   ```
3. **Open:** http://localhost:3002
4. **Connect Wallet**
5. **Create a test project** 🎉

---

## ✅ DONE!

**Total Time:** 7 minutes ⚡

Your contracts are live on Sepolia testnet!

---

## 🔗 View Your Contracts:

Check `deployment-info.json` for all addresses, then visit:
```
https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
```

---

## 🆘 TROUBLESHOOTING:

### "Cannot find module hardhat"
```powershell
npm install hardhat@^2.19.0 --save-dev --legacy-peer-deps
```

### "Insufficient funds"
Get more ETH: https://faucetlink.to/sepolia

### "Private key error"
Make sure:
- .env file is in project root
- No 0x prefix on private key
- No quotes around values

---

## 🎯 ALTERNATIVE: Use Remix (Even Faster!)

If Hardhat issues, use Remix:

1. **Visit:** https://remix.ethereum.org/
2. **Upload** your 5 `.sol` files
3. **Compile** each with 0.8.20
4. **Deploy:**
   - Environment: "Injected Provider - MetaMask"
   - MetaMask connects to Sepolia
   - Click "Deploy" for each
5. **Copy addresses** to `frontend/.env`

**Total Time:** 5 minutes! ✅

---

**Ready to deploy?** Just follow the 6 steps above! 🚀
