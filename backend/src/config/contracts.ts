import fs from 'fs';
import path from 'path';

export interface DeploymentConfig {
  network: string;
  decisionLog: string;
  disciplineVault: string;
  treasury: string;
  deployer: string;
  timestamp: number;
}

let deploymentConfig: DeploymentConfig | null = null;

export function loadDeploymentConfig(): DeploymentConfig {
  if (!deploymentConfig) {
    const filePath = path.join(process.cwd(), '..', 'contracts', 'build', 'deployment.json');
    const data = fs.readFileSync(filePath, 'utf-8');
    deploymentConfig = JSON.parse(data) as DeploymentConfig;
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