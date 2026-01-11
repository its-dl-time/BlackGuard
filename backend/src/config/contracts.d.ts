export interface DeploymentConfig {
    network: string;
    decisionLog: string;
    disciplineVault: string;
    treasury: string;
    deployer: string;
    timestamp: number;
}
export declare function loadDeploymentConfig(): DeploymentConfig;
export declare function getContracts(): {
    network: string;
    decisionLog: string;
    disciplineVault: string;
    treasury: string;
};
//# sourceMappingURL=contracts.d.ts.map