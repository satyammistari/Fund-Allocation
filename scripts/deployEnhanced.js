const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    console.log("🚀 Deploying Enhanced Municipal Fund System...\n");

    const [deployer] = await hre.ethers.getSigners();
    console.log("📋 Deploying with account:", deployer.address);
    const balance = await hre.ethers.provider.getBalance(deployer.address);
    console.log("💰 Account balance:", hre.ethers.utils.formatEther(balance), "ETH\n");

    // Deploy contracts in order
    console.log("⏳ Step 1/4: Deploying DocumentVerification...");
    const DocumentVerification = await hre.ethers.getContractFactory("DocumentVerification");
    const documentVerification = await DocumentVerification.deploy();
    await documentVerification.deployed();
    const docVerificationAddress = documentVerification.address;
    console.log("✅ DocumentVerification deployed to:", docVerificationAddress);

    console.log("\n⏳ Step 2/4: Deploying ProjectRegistry...");
    const ProjectRegistry = await hre.ethers.getContractFactory("ProjectRegistry");
    const projectRegistry = await ProjectRegistry.deploy();
    await projectRegistry.deployed();
    const projectRegistryAddress = projectRegistry.address;
    console.log("✅ ProjectRegistry deployed to:", projectRegistryAddress);

    console.log("\n⏳ Step 3/4: Deploying ApprovalWorkflow...");
    const ApprovalWorkflow = await hre.ethers.getContractFactory("ApprovalWorkflow");
    const approvalWorkflow = await ApprovalWorkflow.deploy(projectRegistryAddress);
    await approvalWorkflow.deployed();
    const approvalWorkflowAddress = approvalWorkflow.address;
    console.log("✅ ApprovalWorkflow deployed to:", approvalWorkflowAddress);

    console.log("\n⏳ Step 4/4: Deploying FundManagement...");
    const FundManagement = await hre.ethers.getContractFactory("FundManagement");
    const fundManagement = await FundManagement.deploy(projectRegistryAddress);
    await fundManagement.deployed();
    const fundManagementAddress = fundManagement.address;
    console.log("✅ FundManagement deployed to:", fundManagementAddress);

    console.log("\n🔧 Setting up roles and permissions...");
    
    // Grant roles
    const AUTHORITY_ROLE = await projectRegistry.AUTHORITY_ROLE();
    await projectRegistry.grantRole(AUTHORITY_ROLE, approvalWorkflowAddress);
    console.log("✅ Granted AUTHORITY_ROLE to ApprovalWorkflow");

    await fundManagement.grantRole(AUTHORITY_ROLE, approvalWorkflowAddress);
    console.log("✅ Granted AUTHORITY_ROLE to FundManagement");

    // Register initial authority (deployer for testing)
    await approvalWorkflow.registerAuthority(deployer.address);
    console.log("✅ Registered deployer as initial authority");

    console.log("\n📄 Saving deployment information...");

    // Save contract addresses
    const deploymentInfo = {
        network: hre.network.name,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            DocumentVerification: docVerificationAddress,
            ProjectRegistry: projectRegistryAddress,
            ApprovalWorkflow: approvalWorkflowAddress,
            FundManagement: fundManagementAddress
        }
    };

    const frontendDir = path.join(__dirname, "..", "frontend", "src", "contracts");
    if (!fs.existsSync(frontendDir)) {
        fs.mkdirSync(frontendDir, { recursive: true });
    }

    // Save addresses
    fs.writeFileSync(
        path.join(frontendDir, "addresses.json"),
        JSON.stringify(deploymentInfo, null, 2)
    );
    console.log("✅ Saved contract addresses to frontend/src/contracts/addresses.json");

    // Save ABIs
    const contracts = [
        { name: "DocumentVerification", artifact: "DocumentVerification" },
        { name: "ProjectRegistry", artifact: "ProjectRegistry" },
        { name: "ApprovalWorkflow", artifact: "ApprovalWorkflow" },
        { name: "FundManagement", artifact: "FundManagement" }
    ];

    for (const contract of contracts) {
        const artifact = await hre.artifacts.readArtifact(contract.artifact);
        fs.writeFileSync(
            path.join(frontendDir, `${contract.name}.json`),
            JSON.stringify(artifact.abi, null, 2)
        );
        console.log(`✅ Saved ${contract.name} ABI`);
    }

    console.log("\n" + "=".repeat(70));
    console.log("   DEPLOYMENT COMPLETE!");
    console.log("=".repeat(70));
    console.log("\n📍 Contract Addresses:");
    console.log("   DocumentVerification:", docVerificationAddress);
    console.log("   ProjectRegistry:     ", projectRegistryAddress);
    console.log("   ApprovalWorkflow:    ", approvalWorkflowAddress);
    console.log("   FundManagement:      ", fundManagementAddress);
    console.log("\n🔗 Network:", hre.network.name);
    
    if (hre.network.name !== "hardhat" && hre.network.name !== "localhost") {
        console.log("🔍 View on Explorer:");
        const explorerUrl = hre.network.name === "mumbai" 
            ? "https://mumbai.polygonscan.com/address/"
            : "https://polygonscan.com/address/";
        console.log("   DocumentVerification:", explorerUrl + docVerificationAddress);
        console.log("   ProjectRegistry:     ", explorerUrl + projectRegistryAddress);
        console.log("   ApprovalWorkflow:    ", explorerUrl + approvalWorkflowAddress);
        console.log("   FundManagement:      ", explorerUrl + fundManagementAddress);
    }

    console.log("\n📋 Next Steps:");
    console.log("   1. Update frontend .env with contract addresses");
    console.log("   2. Register additional authorities using ApprovalWorkflow");
    console.log("   3. Start the frontend application");
    console.log("   4. Test the complete workflow");
    console.log("\n✨ Deployment complete!\n");
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
