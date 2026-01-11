import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ignition";
import "@nomicfoundation/hardhat-toolbox-viem";
import { config } from "dotenv";

// Load .env from contracts directory
config({ path: './contracts/.env' });

// Đọc biến môi trường
const SEPOLIA_URL = process.env.SEPOLIA_RPC_URL || "";
const SEPOLIA_KEY = process.env.SEPOLIA_PRIVATE_KEY || "";

const networks = {
  // Mạng Local (Bắt buộc type: edr-simulated cho Hardhat v3)
  hardhat: {
    type: "edr-simulated",
  },
};

// Only add sepolia if env vars are set and not empty
if (SEPOLIA_URL && SEPOLIA_KEY && SEPOLIA_URL.trim() !== '' && SEPOLIA_KEY.trim() !== '') {
  networks.sepolia = {
    type: "http",
    url: SEPOLIA_URL,
    accounts: [SEPOLIA_KEY],
  };
}

export default defineConfig({
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts/contracts",
    tests: "./contracts/test",
    scripts: "./contracts/scripts",
    artifacts: "./contracts/artifacts",
    cache: "./contracts/cache",
  },
  networks,
});