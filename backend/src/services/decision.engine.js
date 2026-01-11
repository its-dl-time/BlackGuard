import { MLService } from './ml.service.js';
import { RuleService } from './rule.service.js';
import { CoolOffService } from './cooldown.service.js';
export class DecisionEngine {
    mlService;
    ruleService;
    coolOffService;
    constructor() {
        this.mlService = new MLService();
        this.ruleService = new RuleService();
        this.coolOffService = new CoolOffService();
    }
    async evaluateOrderIntent(input) {
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
            horizon: 'long', // Hardcoded for demo
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
        let decision;
        if (ruleResult.severity === 'high' && cooldownStatus.active) {
            decision = 'BLOCKED';
        }
        else if (ruleResult.violationType !== 'NONE') {
            decision = 'WARN';
        }
        else {
            decision = 'ALLOW';
        }
        return {
            decision,
            riskScore,
            violation: {
                type: ruleResult.violationType,
                severity: ruleResult.severity.toUpperCase(),
            },
            cooldown: {
                active: cooldownStatus.active,
                minutes: cooldownStatus.cooldownMinutes,
            },
            explanation: ruleResult.explanation,
        };
    }
}
//# sourceMappingURL=decision.engine.js.map