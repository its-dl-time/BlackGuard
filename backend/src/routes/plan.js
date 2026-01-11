import express from 'express';
import { BlockchainAdapter } from '../services/blockchain.adapter.js';
const blockchainAdapter = new BlockchainAdapter();
export const createPlanHandler = async (req, res) => {
    try {
        const { userId, strategyId, horizon, commitmentText } = req.body;
        if (!userId || !strategyId || !horizon || !commitmentText) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await blockchainAdapter.registerCommitment({
            userId,
            strategyId,
            horizon,
            commitmentText,
        });
        res.json({
            status: 'COMMITTED',
            txHash: result.txHash,
        });
    }
    catch (error) {
        console.error('Error creating plan:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=plan.js.map