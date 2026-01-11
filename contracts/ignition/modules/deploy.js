const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const JAN_1_2025 = 1735689600;

module.exports = buildModule("DeployModule", (m) => {
  // Deploy DecisionLog
  const decisionLog = m.contract("DecisionLog");

  // Get deployer address
  const deployer = m.getAccount(0);

  // Deploy DisciplineVault with backendSystem and decisionLog address
  const vault = m.contract("DisciplineVault", [deployer, decisionLog]);

  // Link DecisionLog to Vault
  m.call(decisionLog, "setVaultAddress", [vault]);

  return { decisionLog, vault };
});