export class RuleService {
    evaluateBehaviorViolation(input) {
        const { riskScore, orderType, horizon, recentActions } = input;
        // Violation probability = riskScore
        const violationProb = riskScore;
        // Determine violation type
        let violationType = "NONE";
        if (riskScore >= 0.75 && orderType === "sell" && horizon === "long") {
            violationType = "PANIC_SELL";
        }
        else if (riskScore >= 0.6 && recentActions >= 5 && horizon === "short") {
            violationType = "OVERTRADING";
        }
        else if (riskScore >= 0.5 && horizon === "short" && orderType === "sell") {
            violationType = "SHORT_TERMISM";
        }
        else if (riskScore >= 0.4) {
            violationType = "PLAN_DEVIATION";
        }
        // Severity based on riskScore
        let severity;
        if (violationProb < 0.4)
            severity = "low";
        else if (violationProb < 0.7)
            severity = "medium";
        else
            severity = "high";
        // Cooldown logic
        let cooldownMinutes;
        if (riskScore < 0.4)
            cooldownMinutes = 0;
        else if (riskScore < 0.6)
            cooldownMinutes = 15;
        else if (riskScore < 0.8)
            cooldownMinutes = 30;
        else
            cooldownMinutes = 60;
        // Explanation
        const explanation = this.getExplanation(violationType);
        return {
            violationProb,
            violationType,
            severity,
            cooldownMinutes,
            explanation,
        };
    }
    getExplanation(violationType) {
        switch (violationType) {
            case "PANIC_SELL":
                return [
                    "This action shows signs of panic selling.",
                    "Your current decision deviates from a long-term strategy due to short-term market pressure.",
                    "Historical evidence suggests such behavior increases long-term loss probability.",
                ];
            case "OVERTRADING":
                return [
                    "This indicates overtrading behavior.",
                    "Frequent short-term actions can lead to increased transaction costs and emotional fatigue.",
                    "Consider pausing to reflect on your overall strategy.",
                ];
            case "SHORT_TERMISM":
                return [
                    "This reflects short-term focus in decision-making.",
                    "Selling assets quickly may overlook long-term potential.",
                    "Behavioral studies show short-termism often leads to suboptimal outcomes.",
                ];
            case "PLAN_DEVIATION":
                return [
                    "This action deviates from your planned investment approach.",
                    "Sticking to a consistent plan helps mitigate behavioral biases.",
                    "Review your original strategy to ensure alignment with long-term goals.",
                ];
            case "NONE":
            default:
                return [
                    "No significant behavioral violation detected.",
                    "Your action aligns with low-risk decision-making.",
                    "Continue monitoring for consistent, disciplined trading.",
                ];
        }
    }
}
//# sourceMappingURL=rule.service.js.map