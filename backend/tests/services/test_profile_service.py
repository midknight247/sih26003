import re
from typing import Dict, Any
from fastapi import HTTPException, status
from app.database.repositories.base import BaseRepository
from app.database.models.patient import Patient

class ProfileBusinessService:
    """
    Coordinates caregiver and patient sub-profile actions. Enforces identity 
    masking rules and prevents clinical diagnostic fields from leaking into the MVP bounds.
    """
    def __init__(self, repo: BaseRepository):
        self.repo = repo

    def process_patient_registration(self, payload: Dict[str, Any]) -> Patient:
        """
        Enforces strict masking guidelines: Sanitizes input fields and strips 
        potentially diagnostic text metadata before persisting to PostgreSQL.
        """
        display_name = payload.get("display_name", "").strip()
        caregiver_id = payload.get("caregiver_id", "").strip()
        community = payload.get("community", "").strip()
        preferred_language = payload.get("preferred_language", "en").strip()

        # 1. Validation check for required data parameters
        if not display_name or not caregiver_id:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Validation Error: Missing absolute display profile alias name or structural caregiver link."
            )

        # 2. Strict Privacy Filtering: Scan for banned clinical phrases (ICD-10 markers, dementia degrees)
        banned_terms_regex = re.compile(
            r"\b(dementia|alzheimer|cognitive decay|severity|stage \d|mild|severe|clinical|score)\b", 
            re.IGNORECASE
        )
        if banned_terms_regex.search(display_name) or banned_terms_regex.search(community):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Security Constraint Violation: Absolute profile metadata cannot contain clinical inference data points."
            )

        # 3. Generate clean masked instance record data maps matching frozen specifications
        patient_instance = Patient(
            id=f"pat_{int(display_name.__hash__() & 0xFFFF):04d}", # Seed an absolute obfuscated tracking key index
            caregiver_id=caregiver_id,
            display_name=display_name,
            preferred_language=preferred_language,
            community=community
        )

        return self.repo.save_patient(patient_instance)


class AuthorizationValidator:
    """
    Enforces strict data boundaries ensuring caregivers can only view or modify 
    patient files mapped directly to their supervisor account index.
    """
    def __init__(self, repo: BaseRepository):
        self.repo = repo

    def verify_caregiver_patient_access(self, caregiver_id: str, patient_id: str) -> None:
        """Thoroughly checks cross-table mappings to block cross-account leaks."""
        patient_record = self.repo.get_patient_by_id(patient_id)
        if not patient_record:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resource Retrieval Failure: Target patient profile not detected."
            )
        if patient_record.caregiver_id != caregiver_id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access Denied: Cross-account data operations are strictly prohibited."
            )
