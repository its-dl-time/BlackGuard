import { BlockchainService } from './blockchain.service.js';

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

export class BlockchainAdapter {
  private blockchainService: BlockchainService;

  constructor() {
    this.blockchainService = new BlockchainService();
  }

  async registerCommitment(input: CommitmentInput): Promise<{ txHash: string }> {
    return await this.blockchainService.registerCommitment(input);
  }

  async enforceViolation(event: ViolationEvent): Promise<{ txHash: string; penaltyAmount: string }> {
    const severityMap = {
      LOW: 'low' as const,
      MEDIUM: 'medium' as const,
      HIGH: 'high' as const,
    };
    return await this.blockchainService.enforceViolation({
      userId: event.userId,
      violationType: event.violationType,
      riskScore: 0.5, // Not needed on-chain, but required by interface
      severity: severityMap[event.severity],
    });
  }
}