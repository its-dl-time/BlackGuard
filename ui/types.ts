export type HorizonType = 'short' | 'long';
export type OrderType = 'buy' | 'sell';
export type Language = 'EN' | 'VI';

// VN30 Universe
export const VN30_TICKERS = [
  'ACB', 'BCM', 'BID', 'BVH', 'CTG', 'FPT', 'GAS', 'GVR', 'HDB', 'HPG',
  'MBB', 'MSN', 'MWG', 'PLX', 'POW', 'SAB', 'SHB', 'SSB', 'SSI', 'STB',
  'TCB', 'TPB', 'VCB', 'VHM', 'VIB', 'VIC', 'VJC', 'VNM', 'VPB', 'VRE'
];

export type Persona = 'CONSERVATIVE' | 'BALANCED' | 'AGGRESSIVE';

export enum StrategyId {
  BUY_HOLD = 'BUY_HOLD',
  MOMENTUM = 'MOMENTUM',
  MEAN_REVERSION = 'MEAN_REVERSION',
  TREND_FOLLOWING = 'TREND_FOLLOWING'
}

export interface Plan {
  strategyId: StrategyId;
  horizon: HorizonType;
  commitment?: string;
  orderType: OrderType;
  amount: string;
  stocks: string[];
}

export interface GlobalSettings {
  language: Language;
  persona: Persona;
}

export interface Risk {
  id: string;
  score: number; // 0-100
  regime: 'Stable' | 'Caution' | 'Critical';
  explanation: string;
}

// Navigation Tabs
export enum Tab {
  PLAN = 'Plan',
  RISK = 'Risk',
  LOG = 'Decision Log',
  SETTINGS = 'Settings',
}

export interface DecisionLogEntry {
  id: string;
  timestamp: string;
  stocks: string[];
  strategy: string;
  riskScore: number;
  explanation: string;
}
