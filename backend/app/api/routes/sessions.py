from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session as SQLSession
from pydantic import BaseModel
from app.database.connection import get_db
from app.services.session import SessionManagerService

router = APIRouter(prefix="/sessions", tags=["Interactive Patient Sessions"])

# --- Inbound Validation Schemas ---
class SessionInitializeRequest(BaseModel):
    patient_id: str

class InteractionTelemetryPayload(BaseModel):
    activity_id: str
    content_id: str
    action_type: str
    dwell_time_ms: int
    is_correct: bool

class SessionTerminateRequest(BaseModel):
    final_status: str = "COMPLETED"  # COMPLETED or ABANDONED


# --- Core Operational API Endpoints ---
@router.post("/", status_code=status.HTTP_201_CREATED)
def start_new_patient_session(payload: SessionInitializeRequest, db: SQLSession = Depends(get_db)):
    """Initializes an isolated persistent track context inside PostgreSQL."""
    try:
        service = SessionManagerService(db)
        session_record = service.initialize_session(patient_id=payload.patient_id)
        return {
            "status": "initialized",
            "session_id": session_record.id,
            "started_at": session_record.started_at
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Session instantiation loop failure: {str(e)}")


@router.post("/{session_id}/interactions", status_code=status.HTTP_200_OK)
def log_interaction_telemetry(session_id: str, payload: InteractionTelemetryPayload, db: SQLSession = Depends(get_db)):
    """
    Ingests live user interaction footprints and triggers the Adaptation Engine.
    Returns the real-time scoring adjustments alongside clear explanation reasons.
    """
    try:
        service = SessionManagerService(db)
        result = service.process_interaction_metrics(
            session_id=session_id,
            activity_id=payload.activity_id,
            content_id=payload.content_id,
            action_type=payload.action_type,
            dwell_time_ms=payload.dwell_time_ms,
            is_correct=payload.is_correct
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Telemetry capture processing error: {str(e)}")


@router.post("/{session_id}/terminate", status_code=status.HTTP_200_OK)
def end_active_patient_session(session_id: str, payload: SessionTerminateRequest, db: SQLSession = Depends(get_db)):
    """Finalizes and stamps the closure of an active monitoring window."""
    service = SessionManagerService(db)
    result = service.complete_patient_session(session_id=session_id, final_status=payload.final_status)
    if result["status"] == "error":
        raise HTTPException(status_code=404, detail=result["message"])
    return result
