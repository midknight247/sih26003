from typing import Dict, Any

class AdaptationEngine:
    """
    Core Mathematical Adaptation Scoring Engine for Smriti.
    Calculates support and challenge level scaling transitions based on 
    direct behavioral interaction footprints, ensuring an automated audit trail.
    """
    
    def __init__(self, max_support: int = 3, max_challenge: int = 3):
        self.max_support = max_support
        self.max_challenge = max_challenge

    def evaluate_adaptation_step(
        self, 
        current_support: int,
        current_challenge: int,
        consecutive_successes: int,
        consecutive_struggles: int,
        dwell_time_ms: int,
        baseline_response_time_ms: int
    ) -> Dict[str, Any]:
        """
        Processes performance milestones to determine level shifts.
        Returns the new state metrics, an action keyword, and a clear presentation reason string.
        """
        new_support = current_support
        new_challenge = current_challenge
        action = "MAINTAIN"
        reason = "Patient performance remains within stable adaptive tolerance boundaries."

        # Rule 1: Escalation Threshold Matrix (Two continuous struggles detected)
        if consecutive_struggles >= 2:
            if current_support < self.max_support:
                new_support = current_support + 1
                new_challenge = max(0, current_challenge - 1)  # Drop challenge if supporting
                action = "INCREASE_SUPPORT"
                reason = f"Two or more consecutive struggles detected. Escalating assistance from Level {current_support} → {new_support}."
            else:
                action = "MAINTAIN"
                reason = f"Consecutive struggles continue, but visual support is already at maximum ceiling (Level {self.max_support})."
        
        # Rule 2: Fatigue / Slow Response Guarding Logic 
        elif dwell_time_ms > (baseline_response_time_ms * 1.8) and baseline_response_time_ms > 0:
            if current_support < self.max_support:
                new_support = current_support + 1
                action = "INCREASE_SUPPORT"
                reason = f"Interaction latency ({dwell_time_ms}ms) exceeded baseline threshold. Pushing supportive hint cue overlay."

        # Rule 3: De-escalation Optimization Loop (Three consecutive standalone successes)
        elif consecutive_successes >= 3:
            if current_support > 0:
                new_support = current_support - 1
                action = "DECREASE_SUPPORT"
                reason = f"Three consecutive standalone successes achieved. Fading supportive visual prompts from Level {current_support} → {new_support}."
            elif new_challenge < self.max_challenge:
                new_challenge = current_challenge + 1
                action = "INCREASE_CHALLENGE"
                reason = f"Patient stable at baseline with consecutive successes. Scaling task complexity from Level {current_challenge} → {new_challenge}."

        return {
            "new_support_level": new_support,
            "new_challenge_level": new_challenge,
            "action": action,
            "reason": reason
        }
