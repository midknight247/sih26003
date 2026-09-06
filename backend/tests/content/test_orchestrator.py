from app.content.orchestrator import SessionOrchestrator
from app.database.models.patient import Interaction

def test_orchestrator_calculates_advancement():
    orchestrator = SessionOrchestrator()
    
    # 1. Simulate 3 consecutive correct actions (100% accuracy)
    mock_logs = [
        Interaction(id="1", is_correct=True, dwell_time_ms=500, action_type="drop", session_id="s1", activity_id="a1", content_id="c1"),
        Interaction(id="2", is_correct=True, dwell_time_ms=600, action_type="drop", session_id="s1", activity_id="a1", content_id="c2"),
        Interaction(id="3", is_correct=True, dwell_time_ms=400, action_type="drop", session_id="s1", activity_id="a1", content_id="c3"),
    ]
    
    result = orchestrator.determine_next_cognitive_task("OBJECT_CATEGORIZATION", mock_logs)
    
    # Assert player shifts cleanly to Reminiscence activity track layout
    assert result["next_activity"] == "REMINISCENCE"
    assert "Transitioning to next sequential task domain" in result["reason"]

def test_orchestrator_triggers_regression_safeguards():
    orchestrator = SessionOrchestrator()
    
    # 2. Simulate high friction blocks (0% accuracy)
    mock_error_logs = [
        Interaction(id="1", is_correct=False, dwell_time_ms=1500, action_type="click", session_id="s1", activity_id="a1", content_id="c1"),
        Interaction(id="2", is_correct=False, dwell_time_ms=2000, action_type="click", session_id="s1", activity_id="a1", content_id="c2"),
        Interaction(id="3", is_correct=False, dwell_time_ms=1800, action_type="click", session_id="s1", activity_id="a1", content_id="c3"),
    ]
    
    result = orchestrator.determine_next_cognitive_task("OBJECT_CATEGORIZATION", mock_error_logs)
    
    assert result["next_activity"] == "OBJECT_CATEGORIZATION"
    assert result["difficulty"] == "low"

