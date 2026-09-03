from app.adaptation.engine import AdaptationEngine

def test_engine_support_escalation_rules():
    engine = AdaptationEngine()
    
    # Simulate a patient hitting two continuous struggle milestones
    result = engine.evaluate_adaptation_step(
        current_support=0,
        current_challenge=0,
        consecutive_successes=0,
        consecutive_struggles=2,
        dwell_time_ms=1200,
        baseline_response_time_ms=1000
    )
    
    assert result["new_support_level"] == 1
    assert result["action"] == "INCREASE_SUPPORT"
    assert "Two or more consecutive struggles detected" in result["reason"]

def test_engine_success_deescalation_rules():
    engine = AdaptationEngine()
    
    # Simulate a patient succeeding continuously
    result = engine.evaluate_adaptation_step(
        current_support=1,
        current_challenge=0,
        consecutive_successes=3,
        consecutive_struggles=0,
        dwell_time_ms=800,
        baseline_response_time_ms=1000
    )
    
    assert result["new_support_level"] == 0
    assert result["action"] == "DECREASE_SUPPORT"
