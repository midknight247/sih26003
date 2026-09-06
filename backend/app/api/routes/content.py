from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as SQLSession
from typing import List
from app.database.connection import get_db
from app.database.repositories.base import BaseRepository
from app.database.models.patient import ContentItem, Session as DBSession

router = APIRouter(prefix="/content", tags=["Localized Content Governance"])

@router.get("/activity/{activity_id}", status_code=status.HTTP_200_OK)
def get_localized_activity_content(
    activity_id: str,
    session_id: str,
    db: SQLSession = Depends(get_db)
):
    """
    Audit Compliance Route: Resolves an active session to read the running patient's
    preferred language and community metrics, then uses the repository to serve
    only active, unhidden, and culturally aligned content items.
    """
    repo = BaseRepository(db)
    
    # 1. Look up the active session shell to find the assigned patient mapping
    session_record = db.query(DBSession).filter(DBSession.id == session_id).first()
    if not session_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content Routing Failure: Active session configuration frame not found."
        )
        
    # 2. Extract the patient's language and community metadata bounds
    patient = session_record.patient
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Content Routing Failure: Associated patient profile metrics not detected."
        )

    # 3. Query the expanded repository layer to enforce strict visibility governance
    active_content = repo.get_active_content_items(
        activity_id=activity_id,
        language=patient.preferred_language,
        community=patient.community
    )
    
    # Format and return the filtered schema rows to the frontend
    return [
        {
            "id": item.id,
            "activity_id": item.activity_id,
            "title": item.title,
            "content_metadata": item.content_metadata,
            "is_active": item.is_active
        }
        for item in active_content
    ]
