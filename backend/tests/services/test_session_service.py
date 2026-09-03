from app.services.session import SessionManagerService
from app.database.models.patient import Caregiver, Patient, Activity, ContentItem

def test_session_manager_workflow(db_session):
    # 1. Pre-seed mock requirements directly onto the current test thread canvas
    test_cg = Caregiver(id="cg_service_01", name="Dr. Smith", email="smith@care.com")
    test_pat = Patient(id="pat_service_01", caregiver_id="cg_service_01", display_name="Subject A", community="General")
    test_act = Activity(id="act_service_01", activity_type="TEST_CAT", name="Sorting")
    test_item = ContentItem(id="item_service_01", activity_id="act_service_01", title="Asset 1", language="en", community="General", content_type="TEXT")
    
    db_session.add_all([test_cg, test_pat, test_act, test_item])
    db_session.commit()

    service = SessionManagerService(db=db_session)
    
    # 2. Run Session Initialization Pass
    session_row = service.initialize_session(patient_id="pat_service_01")
    assert session_row.id is not None
    assert session_row.status == "ACTIVE"

    # 3. Simulate two continuous struggles to trigger an Adaptation Decision shift trail row
    for _ in range(2):
        response = service.process_interaction_metrics(
            session_id=session_row.id,
            activity_id="act_service_01",
            content_id="item_service_01",
            action_type="click",
            dwell_time_ms=1500,
            is_correct=False
        )

    # 4. Assert calculations scaled assistance levels and logged audit metrics
    assert response["action_executed"] == "INCREASE_SUPPORT"
    assert response["current_support_level"] == 1
    assert "Two or more consecutive struggles detected" in response["reason_generated"]
