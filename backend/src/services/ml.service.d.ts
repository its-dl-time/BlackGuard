export interface MLInput {
    strategy: string;
    market: string;
    orderType: string;
}
export interface MLOutput {
    risk_score: number;
}
export declare class MLService {
    private scriptPath;
    private timeoutMs;
    constructor(scriptPath?: string, timeoutMs?: number);
    getRiskScore(input: MLInput): Promise<number>;
    private callPythonScript;
}
//# sourceMappingURL=ml.service.d.ts.map