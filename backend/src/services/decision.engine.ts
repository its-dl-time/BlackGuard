import { MLService } from './ml.service.js';
import { RuleService } from './rule.service.js';
import { CoolOffService } from './cooldown.service.js';

export interface OrderIntentInput {
  userId: string;
  orderType: 'buy' | 'sell';
  amount: number;
  strategyId: string;
}

export interface ViolationInfo {
  type: 'NONE' | 'PANIC_SELL' | 'OVERTRADING' | 'SHORT_TERMISM' | 'PLAN_DEVIATION';
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface OrderIntentOutput {
  decision: 'BLOCKED' | 'WARN' | 'ALLOW';
  riskScore: number;
  violation: ViolationInfo;
  cooldown: {
    active: boolean;
    minutes: number;
  };
  explanation: string[];
}

export class DecisionEngine {
  private mlService: MLService;
  private ruleService: RuleService;
  private coolOffService: CoolOffService;

  constructor() {
    this.mlService = new MLService();
    this.ruleService = new RuleService();
    this.coolOffService = new CoolOffService();
  }

  async evaluateOrderIntent(input: OrderIntentInput): Promise<OrderIntentOutput> {
    const { userId, orderType, amount, strategyId } = input;

    // Step 1: ML Scoring
    const mlInput = {
      strategy: strategyId,
      market: 'vn30', // Hardcoded for demo
      orderType,
    };
    const riskScore = await this.mlService.getRiskScore(mlInput);

    // Step 2: Rule Engine
    const ruleInput = {
      riskScore,
      orderType,
      horizon: 'long' as "short" | "medium" | "long", // Hardcoded for demo
      recentActions: 3, // Hardcoded for demo
    };
    const ruleResult = this.ruleService.evaluateBehaviorViolation(ruleInput);

    // Step 3: Cooldown Engine
    const cooldownInput = {
      riskScore,
      violationType: ruleResult.violationType,
      severity: ruleResult.severity,
      userId,
    };
    this.coolOffService.startCoolOff(cooldownInput);
    const cooldownStatus = this.coolOffService.getCoolOffStatus(userId);

    // Step 4: Final Decision
    let decision: 'BLOCKED' | 'WARN' | 'ALLOW';
    if (ruleResult.severity === 'high' && cooldownStatus.active) {
      decision = 'BLOCKED';
    } else if (ruleResult.violationType !== 'NONE') {
      decision = 'WARN';
    } else {
      decision = 'ALLOW';
    }

    return {
      decision,
      riskScore,
      violation: {
        type: ruleResult.violationType,
        severity: ruleResult.severity.toUpperCase() as 'LOW' | 'MEDIUM' | 'HIGH',
      },
      cooldown: {
        active: cooldownStatus.active,
        minutes: cooldownStatus.cooldownMinutes,
      },
      explanation: ruleResult.explanation,
    };
  }
}