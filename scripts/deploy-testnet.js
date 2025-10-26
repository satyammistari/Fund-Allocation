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
    console.log("🔗 View on Explorer:", getExplorerUrl(network.chainId, fundManagement.address) + "\n");

    // 2. Deploy ProjectRegistry
    console.log("2️⃣ Deploying ProjectRegistry...");
    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.deployed();
    deployedContracts.ProjectRegistry = projectRegistry.address;
    console.log("✅ ProjectRegistry deployed to:", projectRegistry.address);
    console.log("🔗 View on Explorer:", getExplorerUrl(network.chainId, projectRegistry.address) + "\n");

    // 3. Deploy AnonymousTenderSystem
    console.log("3️⃣ Deploying AnonymousTenderSystem...");
    const AnonymousTenderSystem = await hre.ethers.getContractFactory("AnonymousTenderSystem");
    const tenderSystem = await AnonymousTenderSystem.deploy();
    await tenderSystem.deployed();
    deployedContracts.AnonymousTenderSystem = tenderSystem.address;
    console.log("✅ AnonymousTenderSystem deployed to:", tenderSystem.address);
    console.log("🔗 View on Explorer:", getExplorerUrl(network.chainId, tenderSystem.address) + "\n");

    // 4. Deploy ApprovalWorkflow
    console.log("4️⃣ Deploying ApprovalWorkflow...");
    const ApprovalWorkflow = await hre.ethers.getContractFactory("ApprovalWorkflow");
    const approvalWorkflow = await ApprovalWorkflow.deploy();
    await approvalWorkflow.deployed();
    deployedContracts.ApprovalWorkflow = approvalWorkflow.address;
    console.log("✅ ApprovalWorkflow deployed to:", approvalWorkflow.address);
    console.log("🔗 View on Explorer:", getExplorerUrl(network.chainId, approvalWorkflow.address) + "\n");

    // 5. Deploy DocumentVerification
    console.log("5️⃣ Deploying DocumentVerification...");
    const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
    const documentVerification = await DocumentVerification.deploy();
    await documentVerification.deployed();
    deployedContracts.DocumentVerification = documentVerification.address;
    console.log("✅ DocumentVerification deployed to:", documentVerification.address);
    console.log("🔗 View on Explorer:", getExplorerUrl(network.chainId, documentVerification.address) + "\n");

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
      chainId: network.chainId.toString(),
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
      REACT_APP_CHAIN_ID: network.chainId.toString(),
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

    const frontendEnvPath = "frontend/.env";
    if (fs.existsSync(frontendEnvPath)) {
      fs.appendFileSync(frontendEnvPath, envContent);
      console.log("✅ Contract addresses added to frontend/.env\n");
    } else {
      console.log("⚠️  frontend/.env not found. Create it manually with these values:\n");
      console.log(envContent);
    }

    console.log("🔐 NEXT STEPS:");
    console.log("1. Verify contracts on block explorer (optional)");
    console.log("2. Restart your frontend to load new addresses");
    console.log("3. Switch MetaMask to", network.name, "network");
    console.log("4. Test your application with real testnet!\n");

    // Test basic functionality
    console.log("🧪 Testing Basic Functionality...\n");

    console.log("Test 1: Creating a test project...");
    const tx1 = await projectRegistry.createProject(
      "Test Road Construction",
      "5km road renovation project",
      "Mumbai, Maharashtra",
      hre.ethers.utils.parseEther("100"),
      Math.floor(Date.now() / 1000),
      Math.floor(Date.now() / 1000) + 86400 * 30,
      "QmTestHash123456789"
    );
    await tx1.wait();
    console.log("✅ Project created! TX:", tx1.hash);
    console.log("🔗 View TX:", getExplorerUrl(network.chainId, tx1.hash, 'tx') + "\n");

    const project = await projectRegistry.getProject(1);
    console.log("📊 Project Name:", project.name);
    console.log("💰 Project Budget:", hre.ethers.utils.formatEther(project.budget), "ETH");
    console.log("📍 Location:", project.location + "\n");

    console.log("Test 2: Creating fund for project...");
    const tx2 = await fundManagement.createFund(1, hre.ethers.utils.parseEther("100"));
    await tx2.wait();
    console.log("✅ Fund created! TX:", tx2.hash);
    console.log("🔗 View TX:", getExplorerUrl(network.chainId, tx2.hash, 'tx') + "\n");

    const fund = await fundManagement.getFundDetails(1);
    console.log("💰 Fund Total Budget:", hre.ethers.utils.formatEther(fund.totalBudget), "ETH");
    console.log("✅ Fund Active:", fund.isActive + "\n");

    console.log("=".repeat(70));
    console.log("🎊 DEPLOYMENT COMPLETE AND VERIFIED!");
    console.log("=".repeat(70) + "\n");

    console.log("📝 VERIFICATION COMMANDS:");
    console.log("─".repeat(70));
    for (const [name, address] of Object.entries(deployedContracts)) {
      console.log(`npx hardhat verify --network ${network.name} ${address}`);
    }
    console.log("─".repeat(70) + "\n");

  } catch (error) {
    console.error("\n❌ DEPLOYMENT FAILED:", error.message);
    console.error("\nFull error:", error);
    throw error;
  }
}

// Helper function to get block explorer URL
function getExplorerUrl(chainId, addressOrTx, type = 'address') {
  const explorers = {
    1: 'https://etherscan.io',
    5: 'https://goerli.etherscan.io',
    11155111: 'https://sepolia.etherscan.io',
    137: 'https://polygonscan.com',
    80001: 'https://mumbai.polygonscan.com',
    31337: 'http://localhost:8545',
  };

  const baseUrl = explorers[chainId] || explorers[11155111];
  return `${baseUrl}/${type}/${addressOrTx}`;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
