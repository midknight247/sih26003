from sqlalchemy.orm import Session
from typing import List, Optional
from app.database.models.patient import Caregiver, Patient, Session as DBSession, AdaptationState, ContentItem

class BaseRepository:
    def __init__(self, db: Session):
        self.db = db

    # --- Caregiver Operations ---
    def get_caregiver_by_email(self, email: str) -> Optional[Caregiver]:
        """Parameterized lookup to fetch a caregiver profile by unique email."""
        return self.db.query(Caregiver).filter(Caregiver.email == email).first()

    def save_caregiver(self, caregiver: Caregiver) -> Caregiver:
        """Persists or updates a caregiver profile row inside the table layers."""
        self.db.add(caregiver)
        self.db.commit()
        self.db.refresh(caregiver)
        return caregiver

    # --- Patient Operations ---
    def get_patient_by_id(self, patient_id: str) -> Optional[Patient]:
        """Parameterized search to retrieve a specific masked patient profile."""
        return self.db.query(Patient).filter(Patient.id == patient_id).first()

    def get_patients_by_caregiver(self, caregiver_id: str) -> List[Patient]:
        """Retrieves all active patient sub-profiles mapped to a supervisor account index."""
        return self.db.query(Patient).filter(Patient.caregiver_id == caregiver_id).all()

    def save_patient(self, patient: Patient) -> Patient:
        """Persists a new masked profile configuration straight to disk maps."""
        self.db.add(patient)
        self.db.commit()
        self.db.refresh(patient)
        return patient

    # --- Metric Analytical Back-Look Filters ---
    def get_patient_baseline_latency(self, session_id: str, activity_id: str) -> int:
        """
        Queries the running adaptation state tracking record to retrieve 
        the patient's baseline response threshold target parameter.
        """
        state_record = self.db.query(AdaptationState).filter(
            AdaptationState.session_id == session_id,
            AdaptationState.activity_id == activity_id
        ).first()
        return state_record.baseline_response_time_ms if state_record else 1000

    # --- Content Separation & Visibility Filters (Audit Compliance) ---
    def get_active_content_items(self, activity_id: str, language: str, community: str) -> List[ContentItem]:
        """
        Retrieves localized regional content assets. Excludes items flagged as
        hidden/reported, enforcing strict linguistic and cultural tagging boundaries.
        """
        return self.db.query(ContentItem).filter(
            ContentItem.activity_id == activity_id,
            ContentItem.language == language,
            ContentItem.community == community,
            ContentItem.is_active == True,
            ContentItem.is_hidden == False
        ).all()

    def update_session_status_record(self, session_id: str, status: str, ended_at: Optional[any] = None) -> Optional[DBSession]:
        """Atomically updates operational session status state maps (ACTIVE, COMPLETED, ABANDONED)."""
        session = self.db.query(DBSession).filter(DBSession.id == session_id).first()
        if session:
            session.status = status
            if ended_at:
                session.ended_at = ended_at
            self.db.commit()
            self.db.refresh(session)
        return session
