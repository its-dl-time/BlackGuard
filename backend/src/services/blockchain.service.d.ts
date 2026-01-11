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
export declare class BlockchainService {
    private walletClient;
    private publicClient;
    private contracts;
    constructor();
    registerCommitment(input: CommitmentInput): Promise<CommitmentResult>;
    enforceViolation(input: ViolationInput): Promise<ViolationResult>;
}
//# sourceMappingURL=blockchain.service.d.ts.map