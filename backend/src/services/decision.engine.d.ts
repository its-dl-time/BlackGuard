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
export declare class DecisionEngine {
    private mlService;
    private ruleService;
    private coolOffService;
    constructor();
    evaluateOrderIntent(input: OrderIntentInput): Promise<OrderIntentOutput>;
}
//# sourceMappingURL=decision.engine.d.ts.map