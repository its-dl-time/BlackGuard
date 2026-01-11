import fs from 'fs';
import path from 'path';
let deploymentConfig = null;
export function loadDeploymentConfig() {
    if (!deploymentConfig) {
        const filePath = path.join(process.cwd(), '..', 'contracts', 'build', 'deployment.json');
        const data = fs.readFileSync(filePath, 'utf-8');
        deploymentConfig = JSON.parse(data);
    }
    return deploymentConfig;
}
export function getContracts() {
    const config = loadDeploymentConfig();
    return {
        network: config.network,
        decisionLog: config.decisionLog,
        disciplineVault: config.disciplineVault,
        treasury: config.treasury,
    };
}
//# sourceMappingURL=contracts.js.map