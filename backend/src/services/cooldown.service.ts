export interface CoolOffInput {
  riskScore: number; // 0 → 1
  violationType: "NONE" | "PANIC_SELL" | "OVERTRADING" | "SHORT_TERMISM" | "PLAN_DEVIATION";
  severity: "low" | "medium" | "high";
  userId: string;
}

export interface CoolOffState {
  userId: string;
  startedAt: number; // unix timestamp (ms)
  expiresAt: number; // unix timestamp (ms)
  active: boolean;
}

export interface CoolOffStatus {
  active: boolean;
  remainingSeconds: number;
  cooldownMinutes: number;
}

export class CoolOffService {
  private coolOffStates: Map<string, CoolOffState> = new Map();

  startCoolOff(input: CoolOffInput): CoolOffState {
    const { riskScore, violationType, userId } = input;

    // Base cooldown from riskScore
    let cooldownMinutes: number;
    if (riskScore < 0.4) {
      cooldownMinutes = 0;
    } else if (riskScore < 0.6) {
      cooldownMinutes = 15;
    } else if (riskScore < 0.8) {
      cooldownMinutes = 30;
    } else {
      cooldownMinutes = 60;
    }

    // Adjust based on violationType
    if (violationType === "PANIC_SELL") {
      cooldownMinutes = Math.max(cooldownMinutes, 60);
    } else if (violationType === "OVERTRADING") {
      cooldownMinutes = Math.max(cooldownMinutes, 30);
    } else if (violationType === "SHORT_TERMISM") {
      cooldownMinutes = Math.max(cooldownMinutes, 30);
    } else if (violationType === "PLAN_DEVIATION") {
      cooldownMinutes = Math.max(cooldownMinutes, 15);
    } else if (violationType === "NONE") {
      cooldownMinutes = 0;
    }

    const now = Date.now();
    const expiresAt = now + cooldownMinutes * 60 * 1000;

    const state: CoolOffState = {
      userId,
      startedAt: now,
      expiresAt,
      active: cooldownMinutes > 0,
    };

    this.coolOffStates.set(userId, state);
    return state;
  }

  getCoolOffStatus(userId: string): CoolOffStatus {
    const state = this.coolOffStates.get(userId);
    if (!state) {
      return { active: false, remainingSeconds: 0, cooldownMinutes: 0 };
    }

    const now = Date.now();
    if (now >= state.expiresAt) {
      state.active = false;
      return { active: false, remainingSeconds: 0, cooldownMinutes: 0 };
    }

    const remainingMs = state.expiresAt - now;
    const remainingSeconds = Math.ceil(remainingMs / 1000);
    const cooldownMinutes = Math.ceil(remainingSeconds / 60);

    return {
      active: true,
      remainingSeconds,
      cooldownMinutes,
    };
  }
}