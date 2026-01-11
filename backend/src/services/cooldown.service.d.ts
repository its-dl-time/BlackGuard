export interface CoolOffInput {
    riskScore: number;
    violationType: "NONE" | "PANIC_SELL" | "OVERTRADING" | "SHORT_TERMISM" | "PLAN_DEVIATION";
    severity: "low" | "medium" | "high";
    userId: string;
}
export interface CoolOffState {
    userId: string;
    startedAt: number;
    expiresAt: number;
    active: boolean;
}
export interface CoolOffStatus {
    active: boolean;
    remainingSeconds: number;
    cooldownMinutes: number;
}
export declare class CoolOffService {
    private coolOffStates;
    startCoolOff(input: CoolOffInput): CoolOffState;
    getCoolOffStatus(userId: string): CoolOffStatus;
}
//# sourceMappingURL=cooldown.service.d.ts.map