from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database.connection import get_db
from app.database.models.patient import Patient as DBPatient
from app.database.models.patient import Caregiver as DBCaregiver

router = APIRouter(prefix="/patients", tags=["Patient Profiles"])

# --- Bulletproof Pydantic Inbound Data Validation Contracts ---
class PatientCreateRequest(BaseModel):
    alias_name: str
    cognitive_tier_baseline: str = "medium"
    caregiver_id: str

class PatientResponseSchema(BaseModel):
    id: str
    caregiver_id: str
    alias_name: str
    cognitive_tier_baseline: str
    is_active: bool

    class Config:
        from_attributes = True

class CaregiverCreateRequest(BaseModel):
    id: str
    email: str
    hashed_password: str
    full_name: str


# --- Core Operational API Route Endpoint Action Controllers ---
@router.post("/", response_model=PatientResponseSchema, status_code=status.HTTP_201_CREATED)
def create_patient_profile(payload: PatientCreateRequest, db: Session = Depends(get_db)):
    # 1. Enforce strict data schema validation constraint rules manually
    caregiver_exists = db.query(DBCaregiver).filter(DBCaregiver.id == payload.caregiver_id).first()
    if not caregiver_exists:
        raise HTTPException(
            status_code=400, 
            detail=f"Foreign Key Error: Caregiver ID '{payload.caregiver_id}' does not exist inside our records yet."
        )

    # 2. Mutate state records seamlessly straight into PostgreSQL engine maps
    new_patient = DBPatient(
        id=f"pat_{int(db.query(DBPatient).count() + 1):03d}",
        caregiver_id=payload.caregiver_id,
        alias_name=payload.alias_name,
        cognitive_tier_baseline=payload.cognitive_tier_baseline,
        is_active=True
    )
    
    db.add(new_patient)
    db.commit()
    db.refresh(new_patient)
    return new_patient


@router.post("/caregivers", status_code=status.HTTP_201_CREATED)
def create_testing_caregiver(payload: CaregiverCreateRequest, db: Session = Depends(get_db)):
    # Check if duplicate email/id exists to block table thread crashes
    existing = db.query(DBCaregiver).filter(DBCaregiver.id == payload.id).first()
    if existing:
        return {"status": "Caregiver already exists", "id": existing.id}

    new_cg = DBCaregiver(
        id=payload.id,
        email=payload.email,
        hashed_password=payload.hashed_password,
        full_name=payload.full_name
    )
    db.add(new_cg)
    db.commit()
    return {"status": "Caregiver account initialized", "id": new_cg.id}


@router.get("/", response_model=List[PatientResponseSchema])
def get_all_patients_registry(db: Session = Depends(get_db)):
    return db.query(DBPatient).all()
