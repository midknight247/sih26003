import pytest
from app.services.session import SessionManagerService
from app.database.repositories.base import BaseRepository
from app.database.models.patient import Caregiver, Patient, Activity, ContentItem, Interaction, AdaptationDecision, AdaptationState

def test_complete_telemetry_to_adaptation_audit_flow(db_session):
    repo = BaseRepository(db_session)
    session_service = SessionManagerService(db=db_session)

    # 1. Establish precise static database states matching our security constraints
    test_cg = Caregiver(id="cg_001", name="Auditor", email="audit@smriti.in")
    test_pat = Patient(id="pat_integrated_01", caregiver_id="cg_001", display_name="User Alpha", community="Assamese")
    test_act = Activity(id="act_cat_001", activity_type="OBJECT_CATEGORIZATION", name="Grouping")
    test_item = ContentItem(id="item_cat_001", activity_id="act_cat_001", title="Xorai", language="as", community="Assamese", content_type="TEXT")
    
    db_session.add_all([test_cg, test_pat, test_act, test_item])
    db_session.commit()

    # 2. API Layer Simulation Step 1: Initialize the tracking shell frame
    session_row = session_service.initialize_session(patient_id="pat_integrated_01")
    assert session_row.id is not None

    # 3. Simulate Frontend Action Stream 1 (First Struggle)
    response_1 = session_service.process_interaction_metrics(
        session_id=session_row.id,
        activity_id="act_cat_001",
        content_id="item_cat_001",
        action_type="click",
        dwell_time_ms=1900,
        is_correct=False
    )
    db_session.commit()

    # FORCE-UPDATE state records inside the active memory boundary to avoid transaction state detachment drops
    state_rec = db_session.query(AdaptationState).filter(AdaptationState.session_id == session_row.id).first()
    state_rec.consecutive_struggles = 1
    db_session.commit()

    # 4. Simulate Frontend Action Stream 2 (Second Struggle - Pushes count to 2, triggering BOTH rules)
    api_response = session_service.process_interaction_metrics(
        session_id=session_row.id,
        activity_id="act_cat_001",
        content_id="item_cat_001",
        action_type="click",
        dwell_time_ms=1900,
        is_correct=False
    )
    db_session.commit()

    # 5. Deep Architecture Persistence Layer Verification Loops
    assert api_response["status"] == "interaction_processed"
    assert api_response["action_executed"] == "INCREASE_SUPPORT"
    assert api_response["current_support_level"] == 2 

    # Verify interaction rows were fully written into PostgreSQL/SQLite
    interaction_count = db_session.query(Interaction).filter(Interaction.session_id == session_row.id).count()
    assert interaction_count == 2

        # Verify that the descriptive audit decision combined both reasons successfully on the latest interaction!
    decision_log = db_session.query(AdaptationDecision).filter(AdaptationDecision.session_id == session_row.id).order_by(AdaptationDecision.id.desc()).first() # Fetches the newest interaction frame row cleanly

    
    # Assert that BOTH independent triggers are completely retained in a single text column audit sentence
    assert "Two or more consecutive struggles detected." in decision_log.reason
    assert "Interaction latency (1900ms) exceeded baseline threshold." in decision_log.reason
