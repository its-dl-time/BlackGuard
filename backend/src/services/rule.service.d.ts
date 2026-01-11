export type ViolationType = "NONE" | "PANIC_SELL" | "OVERTRADING" | "SHORT_TERMISM" | "PLAN_DEVIATION";
export interface BehaviorEvaluationInput {
    riskScore: number;
    orderType: "buy" | "sell";
    horizon: "short" | "medium" | "long";
    recentActions: number;
    drawdown?: number;
}
export interface BehaviorEvaluationOutput {
    violationProb: number;
    violationType: ViolationType;
    severity: "low" | "medium" | "high";
    cooldownMinutes: number;
    explanation: string[];
}
export declare class RuleService {
    evaluateBehaviorViolation(input: BehaviorEvaluationInput): BehaviorEvaluationOutput;
    private getExplanation;
}
//# sourceMappingURL=rule.service.d.ts.map