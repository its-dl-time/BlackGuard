import { GoogleGenAI, Type, Schema } from "@google/genai";
import { Plan, Risk, Persona, StrategyId } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

/**
 * Heuristic function to generate a "Mock" risk score based on inputs
 * This ensures the UI feels responsive and logical even without a live API key.
 */
const calculateMockRisk = (plan: Plan, persona: Persona): number => {
  let baseScore = 30; // Start at stable

  // 1. Strategy Impact
  if (plan.strategyId === StrategyId.MOMENTUM) baseScore += 25;
  if (plan.strategyId === StrategyId.MEAN_REVERSION) baseScore += 35; // Higher risk
  if (plan.strategyId === StrategyId.TREND_FOLLOWING) baseScore += 20;

  // 2. Persona Impact
  // A conservative person doing a risky strategy = HIGHER RISK SCORE (behavioral mismatch)
  if (persona === 'CONSERVATIVE') {
      if (plan.strategyId !== StrategyId.BUY_HOLD) baseScore += 20; // Penalty for mismatch
  } else if (persona === 'AGGRESSIVE') {
      baseScore -= 10; // Comfortable with risk
  }

  // 3. Asset Volatility Simulation (Simple)
  // Assume stocks with 'V' or 'M' are slightly more volatile in this mock logic
  const volatileCount = plan.stocks.filter(s => s.startsWith('V') || s.startsWith('M')).length;
  baseScore += volatileCount * 3;

  // 4. Horizon Impact
  if (plan.horizon === 'short') baseScore += 15; // Short term is generally riskier

  // Clamp 0-100
  return Math.min(Math.max(baseScore, 5), 95);
};

export const GeminiService = {
  /**
   * Analyzes a user's plan considering their persona and strategy.
   */
  async analyzeRisks(plan: Plan, persona: Persona): Promise<Risk> {
    
    // --- MOCK FALLBACK LOGIC ---
    // If no API key is present OR if we want to simulate fast response for demo
    if (!apiKey) {
      console.warn("No API Key provided. Using Heuristic Mock Engine.");
      
      await new Promise(resolve => setTimeout(resolve, 1200)); // Fake network delay

      const score = calculateMockRisk(plan, persona);
      let regime: 'Stable' | 'Caution' | 'Critical';
      let explanation = "";

      if (score <= 40) {
        regime = 'Stable';
        explanation = `Your selection of ${plan.stocks.length} assets aligns well with the ${plan.strategyId} strategy under a ${persona} profile. Volatility exposure is manageable.`;
      } else if (score <= 70) {
        regime = 'Caution';
        explanation = `Moderate risk detected. The ${plan.strategyId} strategy requires discipline. Given your ${persona} profile, ensure you stick to stop-loss rules for these assets.`;
      } else {
        regime = 'Critical';
        explanation = `High behavioral risk! A ${persona} investor engaging in short-term ${plan.strategyId} with these assets may face significant emotional stress. Reconsider allocation.`;
      }

      return {
        id: `risk-${Date.now()}`,
        score,
        regime,
        explanation
      };
    }
    // ---------------------------

    const modelId = "gemini-3-flash-preview";
    const prompt = `
      You are Blackguard, a behavioral finance risk engine.
      
      User Persona: ${persona}
      Strategy: ${plan.strategyId}
      Horizon: ${plan.horizon}
      Assets: ${plan.stocks.join(', ')}
      Order: ${plan.orderType}
      Commitment: ${plan.commitment || "None"}

      Task: Analyze the behavioral risk of this trade.
      
      Rules:
      1. Return a Risk Score between 0 and 100.
      2. Assign a Regime based STRICTLY on the score:
         - 0-40: "Stable"
         - 41-70: "Caution"
         - 71-100: "Critical"
      3. Explanation must be calm, reflective, and non-judgmental. Mention the persona's influence subtly.
      4. DO NOT mention internal error codes.
    `;

    const riskSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        score: { type: Type.INTEGER },
        regime: { type: Type.STRING, enum: ['Stable', 'Caution', 'Critical'] },
        explanation: { type: Type.STRING }
      },
      required: ['score', 'regime', 'explanation']
    };

    try {
      const response = await ai.models.generateContent({
        model: modelId,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: riskSchema,
          thinkingConfig: { thinkingBudget: 0 }
        }
      });

      const text = response.text;
      if (!text) throw new Error("Empty response from AI");
      
      const riskData = JSON.parse(text);
      
      return {
        ...riskData,
        id: `risk-${Date.now()}`
      };

    } catch (error) {
      console.error("Gemini Analysis Failed:", error);
      // Fallback to mock if API fails
      const score = calculateMockRisk(plan, persona);
      return {
        id: `risk-${Date.now()}`,
        score,
        regime: score <= 40 ? 'Stable' : score <= 70 ? 'Caution' : 'Critical',
        explanation: "API Unreachable. Estimated risk based on heuristic inputs."
      };
    }
  },

  async generateConsequence(plan: Plan, risk: Risk): Promise<{ penalty: string, narrative: string }> {
     return {
         penalty: "Log entry created.",
         narrative: "Decision recorded."
     }
  }
};