from typing import Dict, Any, List
from app.database.models.patient import Interaction

class SessionOrchestrator:
    """
    Automated Content Routing Loop Processor.
    Evaluates recent behavioral footprints to calculate complexity thresholds 
    and dynamically route the patient to the next correct task environment.
    """
    
    def __init__(self, target_success_rate: float = 0.70):
        self.target_success_rate = target_success_rate
        # Core chronological progression pipeline for the MVP activity tracks
        self.activity_sequence = ["OBJECT_CATEGORIZATION", "REMINISCENCE", "PAIRS_MATCHING", "ROUTINE_SEQUENCING"]

    def determine_next_cognitive_task(
        self, 
        current_activity_type: str, 
        recent_interactions: List[Interaction]
    ) -> Dict[str, Any]:
        """
        Analyzes performance metrics to calculate the next step target vector.
        Returns the target activity designation and recommended structural difficulty metadata.
        """
        if not recent_interactions:
            return {"next_activity": current_activity_type, "difficulty": "medium"}

        # Calculate accuracy footprint trends natively
        total_actions = len(recent_interactions)
        correct_actions = sum(1 for log in recent_interactions if log.is_correct)
        accuracy_rate = correct_actions / total_actions if total_actions > 0 else 1.0

        # Find our current placement vector within the sequence array
        try:
            current_index = self.activity_sequence.index(current_activity_type)
        except ValueError:
            current_index = 0

        # Routing Directive 1: Smooth progression rule if performance matches expectations
        if total_actions >= 3 and accuracy_rate >= self.target_success_rate:
            if current_index < len(self.activity_sequence) - 1:
                next_activity = self.activity_sequence[current_index + 1]
                return {
                    "next_activity": next_activity,
                    "difficulty": "medium",
                    "reason": f"Accuracy rate ({int(accuracy_rate*100)}%) passed safety index benchmarks. Transitioning to next sequential task domain."
                }
            else:
                return {
                    "next_activity": current_activity_type,
                    "difficulty": "high",
                    "reason": "Max sequence reached with high performance footprint. Scaling baseline challenge parameter metrics upward."
                }

        # Routing Directive 2: Regression safety guard to prevent patient frustration spikes
        elif total_actions >= 3 and accuracy_rate < 0.40:
            return {
                "next_activity": current_activity_type,
                "difficulty": "low",
                "reason": f"High cognitive friction identified (Accuracy: {int(accuracy_rate*100)}%). Dropping task complexity to restore comfort baseline."
            }

        # Default fallback rule path: Maintain active task layout coordinates
        return {
            "next_activity": current_activity_type,
            "difficulty": "medium",
            "reason": "Session metrics stable within standard tolerance bounds. Continuous collection ongoing."
        }
