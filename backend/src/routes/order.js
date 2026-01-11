import express from 'express';
import { DecisionEngine } from '../services/decision.engine.js';
import { BlockchainAdapter } from '../services/blockchain.adapter.js';
const decisionEngine = new DecisionEngine();
const blockchainAdapter = new BlockchainAdapter();
export const orderIntentHandler = async (req, res) => {
    try {
        const { userId, orderType, amount, strategyId } = req.body;
        if (!userId || !orderType || !amount || !strategyId) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        const result = await decisionEngine.evaluateOrderIntent({
            userId,
            orderType,
            amount,
            strategyId,
        });
        res.json(result);
    }
    catch (error) {
        console.error('Error processing order intent:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
export const orderConfirmHandler = async (req, res) => {
    try {
        const { userId, confirm } = req.body;
        if (!userId || confirm !== true) {
            return res.status(400).json({ error: 'Invalid request' });
        }
        // For demo, assume latest violation from intent (in real app, store in session/DB)
        const violationEvent = {
            userId,
            violationType: 'PANIC_SELL',
            severity: 'HIGH',
        };
        const result = await blockchainAdapter.enforceViolation(violationEvent);
        res.json({
            status: 'PENALTY_APPLIED',
            txHash: result.txHash,
            penalty: result.penaltyAmount,
        });
    }
    catch (error) {
        console.error('Error confirming order:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
//# sourceMappingURL=order.js.map