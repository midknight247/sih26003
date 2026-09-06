from fastapi import HTTPException, status
from app.database.repositories.base import BaseRepository

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
