export interface CommitmentInput {
    userId: string;
    strategyId: string;
    horizon: 'long';
    commitmentText: string;
}
export interface ViolationEvent {
    userId: string;
    violationType: 'NONE' | 'PANIC_SELL' | 'OVERTRADING' | 'SHORT_TERMISM' | 'PLAN_DEVIATION';
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
}
export declare class BlockchainAdapter {
    private blockchainService;
    constructor();
    registerCommitment(input: CommitmentInput): Promise<{
        txHash: string;
    }>;
    enforceViolation(event: ViolationEvent): Promise<{
        txHash: string;
        penaltyAmount: string;
    }>;
}
//# sourceMappingURL=blockchain.adapter.d.ts.map