class AdaptationEngine:
    """
    Mathematical Calibration Engine governing real-time layout support structures
    based purely on observable behavioral interaction footprints.
    """

    def evaluate_adaptation_step(
        self, 
        current_support: int, 
        current_challenge: int,
        consecutive_successes: int, 
        consecutive_struggles: int,
        dwell_time_ms: int, 
        baseline_response_time_ms: int
    ) -> dict:
        reasons = []
        new_support = current_support
        new_challenge = current_challenge
        action = "MAINTAIN"

        # 1. Evaluate Latency Trigger Rule independently
        if dwell_time_ms > (1.8 * baseline_response_time_ms):
            new_support = min(new_support + 1, 2)
            action = "INCREASE_SUPPORT"
            reasons.append(f"Interaction latency ({dwell_time_ms}ms) exceeded baseline threshold.")

        # 2. Evaluate Consecutive Struggles Trigger Rule independently
        if consecutive_struggles >= 2:
            if action != "INCREASE_SUPPORT":
                new_support = min(new_support + 1, 2)
                action = "INCREASE_SUPPORT"
            reasons.append("Two or more consecutive struggles detected.")

        # 3. Handle Optimization Success Rules if no struggle occurred
        if action == "MAINTAIN" and consecutive_successes >= 3:
            new_support = max(new_support - 1, 0)
            action = "DECREASE_SUPPORT" if current_support > 0 else "MAINTAIN"
            reasons.append("Three consecutive standalone successes achieved.")

        # Join reasons using a space delimiter to perfectly contain both rules in one audit string
        final_reason = " ".join(reasons) if reasons else "Session metrics stable within standard tolerance bounds."
        
        return {
            "action": action,
            "new_support_level": new_support,
            "new_challenge_level": new_challenge,
            "reason": final_reason
        }
