import hre from "hardhat";
import { createPublicClient, createWalletClient, http, formatEther } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { sepolia } from "viem/chains";
import fs from "fs";
import path from "path";

async function main() {
    console.log("🚀 STARTING DEPLOYMENT...");

    // 1. Lấy thông tin ví & Client
    const account = privateKeyToAccount(process.env.SEPOLIA_PRIVATE_KEY as `0x${string}`);

    const publicClient = createPublicClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
    });

    const walletClient = createWalletClient({
        chain: sepolia,
        transport: http(process.env.SEPOLIA_RPC_URL),
        account,
    });

    const deployer = account;
    console.log(`👨‍💻 Deployer: ${deployer.address}`);

    const balance = await publicClient.getBalance({ address: deployer.address });
    console.log(`💰 Balance:  ${formatEther(balance)} ETH`);

    // 2. Xác định địa chỉ Backend (Admin) - deployer là platform owner
    const backendAddress = deployer.address;

    console.log(`🤖 Backend Admin set to: ${backendAddress}`);

    // ===========================================
    // A. DEPLOY DECISION LOG
    // ===========================================
    console.log("\n📦 [1/3] Deploying DecisionLog...");

    const decisionLogArtifact = await hre.artifacts.readArtifact("DecisionLog");
    const decisionLogHash = await walletClient.deployContract({
        abi: decisionLogArtifact.abi,
        bytecode: decisionLogArtifact.bytecode as `0x${string}`,
        args: [],
    });
    const decisionLogReceipt = await publicClient.waitForTransactionReceipt({ hash: decisionLogHash });
    const decisionLogAddress = decisionLogReceipt.contractAddress!;
    console.log(`✅ DecisionLog deployed: ${decisionLogAddress}`);

    // ===========================================
    // B. DEPLOY DISCIPLINE VAULT
    // ===========================================
    console.log("\n📦 [2/3] Deploying DisciplineVault...");

    const vaultArtifact = await hre.artifacts.readArtifact("DisciplineVault");
    const vaultHash = await walletClient.deployContract({
        abi: vaultArtifact.abi,
        bytecode: vaultArtifact.bytecode as `0x${string}`,
        args: [backendAddress, decisionLogAddress],
    });
    const vaultReceipt = await publicClient.waitForTransactionReceipt({ hash: vaultHash });
    const vaultAddress = vaultReceipt.contractAddress!;
    console.log(`✅ DisciplineVault deployed: ${vaultAddress}`);

    // ===========================================
    // C. KẾT NỐI (HANDSHAKE)
    // ===========================================
    console.log("\n🔄 [3/3] Linking Contracts...");

    const linkHash = await walletClient.writeContract({
        address: decisionLogAddress,
        abi: decisionLogArtifact.abi,
        functionName: "setVaultAddress",
        args: [vaultAddress],
    });
    await publicClient.waitForTransactionReceipt({ hash: linkHash });

    console.log("🎉 SUCCESS! Deployment Complete.");
    console.log("-------------------------------------");
    console.log(`👉 DecisionLog:     ${decisionLogAddress}`);
    console.log(`👉 DisciplineVault: ${vaultAddress}`);
    console.log("-------------------------------------");

    // ===========================================
    // D. WRITE DEPLOYMENT JSON
    // ===========================================
    console.log("\n📄 Writing deployment JSON...");

    const deploymentData = {
        network: "sepolia",
        decisionLog: decisionLogAddress,
        disciplineVault: vaultAddress,
        treasury: process.env.TREASURY_ADDRESS,
        deployer: deployer.address,
        timestamp: Math.floor(Date.now() / 1000)
    };

    const buildDir = path.join(process.cwd(), 'contracts', 'build');
    if (!fs.existsSync(buildDir)) {
        fs.mkdirSync(buildDir, { recursive: true });
    }

    fs.writeFileSync(path.join(buildDir, 'deployment.json'), JSON.stringify(deploymentData, null, 2));

    console.log(`✅ Deployment JSON written to: ${path.join(buildDir, 'deployment.json')}`);
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error("\n❌ DEPLOY ERROR:", error);
        process.exit(1);
    });