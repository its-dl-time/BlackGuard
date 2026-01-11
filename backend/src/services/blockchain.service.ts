import { createWalletClient, createPublicClient, http, keccak256, encodeAbiParameters } from "viem";
import { sepolia } from "viem/chains";
import { getContracts } from "../config/contracts.js";
import dotenv from "dotenv";

dotenv.config();

export interface CommitmentInput {
  userId: string;
  strategyId: string;
  horizon: "long";
  commitmentText: string;
}

export interface ViolationInput {
  userId: string;
  violationType: "NONE" | "PANIC_SELL" | "OVERTRADING" | "SHORT_TERMISM" | "PLAN_DEVIATION";
  riskScore: number;
  severity: "low" | "medium" | "high";
}

export interface CommitmentResult {
  txHash: string;
}

export interface ViolationResult {
  txHash: string;
  penaltyAmount: string;
}

// ABI for DisciplineVault (assuming added methods)
const disciplineVaultAbi = [
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "commitmentHash",
        "type": "bytes32"
      }
    ],
    "name": "registerCommitment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "penalty",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "violationType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "riskScore",
        "type": "uint256"
      }
    ],
    "name": "applyPenalty",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];

export class BlockchainService {
  private walletClient: any;
  private publicClient: any;
  private contracts: any;

  constructor() {
    const rpcUrl = process.env.SEPOLIA_RPC_URL;
    const privateKey = process.env.SEPOLIA_PRIVATE_KEY as `0x${string}`;

    console.log('RPC URL:', rpcUrl);
    console.log('Private Key:', privateKey ? 'Present' : 'Missing');

    if (!rpcUrl || !privateKey) {
      throw new Error("Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY in .env");
    }

    this.publicClient = createPublicClient({
      chain: sepolia,
      transport: http(rpcUrl),
    });

    this.walletClient = createWalletClient({
      chain: sepolia,
      transport: http(rpcUrl),
      account: privateKey,
    });

    this.contracts = getContracts();
  }

  async registerCommitment(input: CommitmentInput): Promise<CommitmentResult> {
    const { userId, strategyId, commitmentText } = input;

    // Hash commitment
    const commitmentHash = keccak256(encodeAbiParameters(
      [{ type: "string" }, { type: "string" }, { type: "string" }],
      [userId, strategyId, commitmentText]
    ));

    // Call DisciplineVault to register commitment
    const txHash = await this.walletClient.writeContract({
      address: this.contracts.disciplineVault,
      abi: disciplineVaultAbi,
      functionName: "registerCommitment",
      args: [commitmentHash],
    });

    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash };
  }

  async enforceViolation(input: ViolationInput): Promise<ViolationResult> {
    const { severity } = input;

    // Calculate penalty (assuming portfolio value is 100% for demo)
    let penaltyPercent: number;
    if (severity === "low") penaltyPercent = 0.1;
    else if (severity === "medium") penaltyPercent = 0.3;
    else penaltyPercent = 0.5;

    const penaltyAmount = `${penaltyPercent}%`;

    // Call DisciplineVault to apply penalty and log violation
    const txHash = await this.walletClient.writeContract({
      address: this.contracts.disciplineVault,
      abi: disciplineVaultAbi,
      functionName: "applyPenalty",
      args: [penaltyPercent * 100, input.violationType, Math.floor(input.riskScore * 100)],
    });

    await this.publicClient.waitForTransactionReceipt({ hash: txHash });

    return { txHash, penaltyAmount };
  }
}