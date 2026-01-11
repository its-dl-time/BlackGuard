import express from 'express';
import { MLService } from '../services/ml.service.js';
import { RuleService } from '../services/rule.service.js';
import { CoolOffService } from '../services/cooldown.service.js';
import { BlockchainService } from '../services/blockchain.service.js';

const mlService = new MLService();
const ruleService = new RuleService();
const coolOffService = new CoolOffService();
const blockchainService = new BlockchainService();

export const orderIntentHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, orderType, amount, strategyId } = req.body;

    if (!userId || !orderType || !amount || !strategyId) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Derive inputs for ML (hardcoded for demo, in real app infer from DB)
    const mlInput = {
      strategy: strategyId,
      market: 'vn30', // Example
      orderType,
    };
    const riskScore = await mlService.getRiskScore(mlInput);

    // Derive inputs for rule (hardcoded for demo)
    const ruleInput = {
      riskScore,
      orderType,
      horizon: 'long' as "short" | "medium" | "long", // Example
      recentActions: 3, // Example
    };
    const ruleResult = ruleService.evaluateBehaviorViolation(ruleInput);

    // Start cooldown
    const cooldownInput = {
      riskScore,
      violationType: ruleResult.violationType,
      severity: ruleResult.severity,
      userId,
    };
    coolOffService.startCoolOff(cooldownInput);
    const cooldownStatus = coolOffService.getCoolOffStatus(userId);

    res.json({
      riskScore,
      violationType: ruleResult.violationType,
      cooldown: {
        active: cooldownStatus.active,
        minutes: cooldownStatus.cooldownMinutes,
      },
      explanation: ruleResult.explanation,
    });
  } catch (error) {
    console.error('Error processing order intent:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const orderConfirmHandler = async (req: express.Request, res: express.Response) => {
  try {
    const { userId, confirm } = req.body;

    if (!userId || confirm !== true) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    // For demo, assume latest from intent (in real app, store in session/DB)
    const riskScore = 0.85;
    const violationType = 'PANIC_SELL';
    const severity = 'high';

    const result = await blockchainService.enforceViolation({
      userId,
      violationType,
      riskScore,
      severity,
    });

    res.json({
      status: 'PENALTY_APPLIED',
      txHash: result.txHash,
      penalty: result.penaltyAmount,
    });
  } catch (error) {
    console.error('Error confirming order:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};