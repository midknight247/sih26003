import pytest
from app.services.session import SessionManagerService
from app.database.repositories.base import BaseRepository
from app.database.models.patient import Caregiver, Patient, Activity, ContentItem, Interaction, AdaptationDecision

def test_complete_telemetry_to_adaptation_audit_flow(db_session):
    repo = BaseRepository(db_session)
    session_service = SessionManagerService(db=db_session)

    # 1. Establish initial conditions directly in our database context layout
    test_cg = Caregiver(id="cg_integrated_01", name="Auditor", email="audit@smriti.in")
    test_pat = Patient(id="pat_integrated_01", caregiver_id="cg_integrated_01", display_name="User Alpha", community="Assamese")
    test_act = Activity(id="act_cat_001", activity_type="OBJECT_CATEGORIZATION", name="Grouping")
    test_item = ContentItem(id="item_cat_001", activity_id="act_cat_001", title="Xorai", language="as", community="Assamese", content_type="TEXT")
    
    db_session.add_all([test_cg, test_pat, test_act, test_item])
    db_session.commit()

    # 2. API Loop Simulation Layer: Initialize a fresh active patient session shell
    session_row = session_service.initialize_session(patient_id="pat_integrated_01")
    assert session_row.id is not None

    # 3. Simulate Frontend Action Payload Stream (First struggle)
    response_1 = session_service.process_interaction_metrics(
        session_id=session_row.id,
        activity_id="act_cat_001",
        content_id="item_cat_001",
        action_type="click",
        dwell_time_ms=1900,
        is_correct=False
    )
    # Flushes transactional query states inside SQLite in-memory tracking layers
    db_session.commit()

    # 4. Simulate Second Struggle (This pushes consecutive struggles to 2, triggering escalation)
    api_response = session_service.process_interaction_metrics(
        session_id=session_row.id,
        activity_id="act_cat_001",
        content_id="item_cat_001",
        action_type="click",
        dwell_time_ms=1900,
        is_correct=False
    )
    db_session.commit()

    # 5. Deep Persistence Layer Verification Loops
    assert api_response["status"] == "interaction_processed"
    assert api_response["action_executed"] == "INCREASE_SUPPORT"
    assert api_response["current_support_level"] == 1

    # Verify interaction rows were recorded inside PostgreSQL / SQLite testing session
    interaction_count = db_session.query(Interaction).filter(Interaction.session_id == session_row.id).count()
    assert interaction_count == 2

    # Verify a descriptive audit decision log row was created for the evaluation panel
    decision_log = db_session.query(AdaptationDecision).filter(AdaptationDecision.session_id == session_row.id).first()
    assert decision_log is not None
    assert decision_log.action == "INCREASE_SUPPORT"
    assert "Two or more consecutive struggles detected" in decision_log.reason
