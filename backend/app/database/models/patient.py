from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, DateTime, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from app.database.connection import Base

# ==========================================
# 1. CAREGIVERS TABLE
# ==========================================
class Caregiver(Base):
    __tablename__ = "caregivers"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    patients = relationship("Patient", back_populates="caregiver", cascade="all, delete-orphan")


# ==========================================
# 2. PATIENTS TABLE
# ==========================================
class Patient(Base):
    __tablename__ = "patients"

    id = Column(String, primary_key=True, index=True)
    caregiver_id = Column(String, ForeignKey("caregivers.id", ondelete="CASCADE"), nullable=False, index=True)
    display_name = Column(String, nullable=False)
    preferred_language = Column(String, default="en", nullable=False)
    community = Column(String, nullable=False)  # Cultural tag tracking rule
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    caregiver = relationship("Caregiver", back_populates="patients")
    sessions = relationship("Session", back_populates="patient", cascade="all, delete-orphan")


# ==========================================
# 3. ACTIVITIES TABLE
# ==========================================
class Activity(Base):
    __tablename__ = "activities"

    id = Column(String, primary_key=True, index=True)
    activity_type = Column(String, unique=True, nullable=False, index=True)  # OBJECT_CATEGORIZATION, etc.
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    content_items = relationship("ContentItem", back_populates="activity", cascade="all, delete-orphan")
    interactions = relationship("Interaction", back_populates="activity")
    adaptation_states = relationship("AdaptationState", back_populates="activity")
    adaptation_decisions = relationship("AdaptationDecision", back_populates="activity")


# ==========================================
# 4. CONTENT_ITEMS TABLE
# ==========================================
class ContentItem(Base):
    __tablename__ = "content_items"

    id = Column(String, primary_key=True, index=True)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    language = Column(String, nullable=False, index=True)
    community = Column(String, nullable=False, index=True)
    content_type = Column(String, nullable=False)  # text, image, audio
    asset_url = Column(Text, nullable=True)
    audio_url = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    is_hidden = Column(Boolean, default=False, nullable=False)
    emotional_risk_level = Column(String, default="low", nullable=False)  # low, medium, high
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    activity = relationship("Activity", back_populates="content_items")
    interactions = relationship("Interaction", back_populates="content_item")


# ==========================================
# 5. SESSIONS TABLE
# ==========================================
class Session(Base):
    __tablename__ = "sessions"

    id = Column(String, primary_key=True, index=True)
    patient_id = Column(String, ForeignKey("patients.id", ondelete="CASCADE"), nullable=False, index=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    ended_at = Column(DateTime, nullable=True)
    status = Column(String, default="ACTIVE", nullable=False)  # ACTIVE, COMPLETED, ABANDONED
    current_activity_id = Column(String, ForeignKey("activities.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    patient = relationship("Patient", back_populates="sessions")
    interactions = relationship("Interaction", back_populates="session", cascade="all, delete-orphan")
    adaptation_states = relationship("AdaptationState", back_populates="session", cascade="all, delete-orphan")
    adaptation_decisions = relationship("AdaptationDecision", back_populates="session", cascade="all, delete-orphan")


# ==========================================
# 6. INTERACTIONS TABLE
# ==========================================
class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    content_id = Column(String, ForeignKey("content_items.id", ondelete="CASCADE"), nullable=False, index=True)
    action_type = Column(String, nullable=False)  # drag, drop, click, timeout
    dwell_time_ms = Column(Integer, nullable=False)
    is_correct = Column(Boolean, nullable=False)
    hint_level = Column(Integer, default=0, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    session = relationship("Session", back_populates="interactions")
    activity = relationship("Activity", back_populates="interactions")
    content_item = relationship("ContentItem", back_populates="interactions")
    adaptation_decisions = relationship("AdaptationDecision", back_populates="interaction")


# ==========================================
# 7. ADAPTATION_STATES TABLE
# ==========================================
class AdaptationState(Base):
    __tablename__ = "adaptation_states"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    support_level = Column(Integer, default=0, nullable=False)
    challenge_level = Column(Integer, default=0, nullable=False)
    consecutive_successes = Column(Integer, default=0, nullable=False)
    consecutive_struggles = Column(Integer, default=0, nullable=False)
    baseline_response_time_ms = Column(Integer, default=0, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    session = relationship("Session", back_populates="adaptation_states")
    activity = relationship("Activity", back_populates="adaptation_states")


# ==========================================
# 8. ADAPTATION_DECISIONS (The Audit Trail)
# ==========================================
class AdaptationDecision(Base):
    __tablename__ = "adaptation_decisions"

    id = Column(String, primary_key=True, index=True)
    session_id = Column(String, ForeignKey("sessions.id", ondelete="CASCADE"), nullable=False, index=True)
    activity_id = Column(String, ForeignKey("activities.id", ondelete="CASCADE"), nullable=False, index=True)
    interaction_id = Column(String, ForeignKey("interactions.id", ondelete="CASCADE"), nullable=False, index=True)
    previous_support_level = Column(Integer, nullable=False)
    new_support_level = Column(Integer, nullable=False)
    previous_challenge_level = Column(Integer, nullable=False)
    new_challenge_level = Column(Integer, nullable=False)
    action = Column(String, nullable=False)  # INCREASE_SUPPORT, DECREASE_SUPPORT, MAINTAIN
    reason = Column(String, nullable=False)  # "Two consecutive struggles detected"
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relational Tree Loops
    session = relationship("Session", back_populates="adaptation_decisions")
    activity = relationship("Activity", back_populates="adaptation_decisions")
    interaction = relationship("Interaction", back_populates="adaptation_decisions")
