import { BlockchainService } from './blockchain.service.js';
export class BlockchainAdapter {
    blockchainService;
    constructor() {
        this.blockchainService = new BlockchainService();
    }
    async registerCommitment(input) {
        return await this.blockchainService.registerCommitment(input);
    }
    async enforceViolation(event) {
        const severityMap = {
            LOW: 'low',
            MEDIUM: 'medium',
            HIGH: 'high',
        };
        return await this.blockchainService.enforceViolation({
            userId: event.userId,
            violationType: event.violationType,
            riskScore: 0.5, // Not needed on-chain, but required by interface
            severity: severityMap[event.severity],
        });
    }
}
//# sourceMappingURL=blockchain.adapter.js.map