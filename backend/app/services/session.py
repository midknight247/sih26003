from sqlalchemy.orm import Session as SQLSession
from datetime import datetime
from typing import Dict, Any, List
from app.database.models.patient import Session as DBSession, Interaction, AdaptationState, AdaptationDecision
from app.adaptation.engine import AdaptationEngine

class SessionManagerService:
    """
    Core Business Logic Service for coordinating patient cognitive session stages,
    logging interaction footprints, and executing adaptation engine triggers.
    """
    def __init__(self, db: SQLSession):
        self.db = db
        self.adaptation_engine = AdaptationEngine()

    def initialize_session(self, patient_id: str) -> DBSession:
        """Creates a brand new active session row inside PostgreSQL."""
        new_session = DBSession(
            id=f"sess_{int(datetime.utcnow().timestamp())}",
            patient_id=patient_id,
            started_at=datetime.utcnow(),
            status="ACTIVE"
        )
        self.db.add(new_session)
        self.db.commit()
        self.db.refresh(new_session)
        return new_session

    def process_interaction_metrics(
        self, 
        session_id: str, 
        activity_id: str, 
        content_id: str,
        action_type: str,
        dwell_time_ms: int,
        is_correct: bool
    ) -> Dict[str, Any]:
        """
        1. Logs the raw interaction event behavior metrics row.
        2. Updates the session's active continuous consecutive success/struggle state tracking matrix.
        3. Invokes the Adaptation Engine calculations to see if visual hint assistance level needs scaling.
        """
        now = datetime.utcnow()
        # 1. Write the interaction footprint to the table
        new_interaction = Interaction(
            id=f"int_{now.strftime('%Y%m%d%H%M%S%f')}_{dwell_time_ms}",
            session_id=session_id,
            activity_id=activity_id,
            content_id=content_id,
            action_type=action_type,
            dwell_time_ms=dwell_time_ms,
            is_correct=is_correct
        )
        self.db.add(new_interaction)

        # 2. Fetch or initialize the active continuous tracking metrics map state boundary row
        state_record = self.db.query(AdaptationState).filter(
            AdaptationState.session_id == session_id,
            AdaptationState.activity_id == activity_id
        ).first()

        if not state_record:
            state_record = AdaptationState(
                id=f"state_{session_id}_{activity_id}",
                session_id=session_id,
                activity_id=activity_id,
                support_level=0,
                challenge_level=0,
                consecutive_successes=0,
                consecutive_struggles=0,
                baseline_response_time_ms=1000
            )
            self.db.add(state_record)

        # Update running consecutive performance counts dynamically
        if is_correct:
            state_record.consecutive_successes += 1
            state_record.consecutive_struggles = 0
        else:
            state_record.consecutive_struggles += 1
            state_record.consecutive_successes = 0

        # 3. Fire the mathematical Adaptation Engine evaluation rules
        engine_eval = self.adaptation_engine.evaluate_adaptation_step(
            current_support=state_record.support_level,
            current_challenge=state_record.challenge_level,
            consecutive_successes=state_record.consecutive_successes,
            consecutive_struggles=state_record.consecutive_struggles,
            dwell_time_ms=dwell_time_ms,
            baseline_response_time_ms=state_record.baseline_response_time_ms
        )

        # 4. If a delta shift is declared, write the historical presentation log trail map for judges
        if engine_eval["action"] != "MAINTAIN":
            decision_log = AdaptationDecision(
                id=f"dec_{int(datetime.utcnow().timestamp())}",
                session_id=session_id,
                activity_id=activity_id,
                interaction_id=new_interaction.id,
                previous_support_level=state_record.support_level,
                new_support_level=engine_eval["new_support_level"],
                previous_challenge_level=state_record.challenge_level,
                new_challenge_level=engine_eval["new_challenge_level"],
                action=engine_eval["action"],
                reason=engine_eval["reason"]
            )
            self.db.add(decision_log)

        # Commit state updates safely to table boundaries
        state_record.support_level = engine_eval["new_support_level"]
        state_record.challenge_level = engine_eval["new_challenge_level"]
        
        self.db.commit()

        return {
            "status": "interaction_processed",
            "action_executed": engine_eval["action"],
            "reason_generated": engine_eval["reason"],
            "current_support_level": state_record.support_level
        }

    def complete_patient_session(self, session_id: str, final_status: str = "COMPLETED") -> Dict[str, str]:
        """Locks the active session state record on completion parameters."""
        session = self.db.query(DBSession).filter(DBSession.id == session_id).first()
        if session:
            session.ended_at = datetime.utcnow()
            session.status = final_status
            self.db.commit()
            return {"status": "session_terminated", "session_id": session_id, "final_state": final_status}
        return {"status": "error", "message": "Target session index not found"}
