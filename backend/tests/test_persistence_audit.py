import pytest
from app.database.repositories.base import BaseRepository
from app.database.models.patient import Activity, ContentItem

def test_repository_enforces_regional_and_visibility_filters(db_session):
    repo = BaseRepository(db_session)
    
    # Pre-seed test activity tracker
    test_act = Activity(id="act_audit_01", activity_type="AUDIT_TEST", name="Audit Activity")
    db_session.add(test_act)
    db_session.commit()

    # Pre-seed diverse content parameters: valid localized item vs hidden item vs wrong community item
    item_valid = ContentItem(id="i_01", activity_id="act_audit_01", title="Assamese Xorai", language="as", community="Assamese", content_type="TEXT", is_hidden=False, is_active=True)
    item_hidden = ContentItem(id="i_02", activity_id="act_audit_01", title="Reported Asset", language="as", community="Assamese", content_type="TEXT", is_hidden=True, is_active=True)
    item_wrong_comm = ContentItem(id="i_03", activity_id="act_audit_01", title="Mizo Fabric", language="lus", community="Mizo", content_type="TEXT", is_hidden=False, is_active=True)

    db_session.add_all([item_valid, item_hidden, item_wrong_comm])
    db_session.commit()

    # Run query filter pass matching Assamese criteria constraints
    active_items = repo.get_active_content_items(activity_id="act_audit_01", language="as", community="Assamese")

    # Verification: Only 1 item must resolve. Hidden and out-of-boundary parameters must be blocked.
    assert len(active_items) == 1
    assert active_items[0].id == "i_01"
