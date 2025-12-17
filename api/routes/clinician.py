"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import List, Optional
from datetime import datetime
import uuid

from api.adapters.memory_store import get_memory_store
from api.models.intake import IntakeSession, IntakeQuestionnaireResponse
from api.models.triage import TriageResult
from api.services.triage_engine import TriageEngine
from api.services.audit_logger import get_audit_logger
from api.config import settings

router = APIRouter()

# Singleton for triage engine
_triage_engine_instance: Optional[TriageEngine] = None

def get_triage_engine() -> TriageEngine:
    global _triage_engine_instance
    if _triage_engine_instance is None:
        _triage_engine_instance = TriageEngine(settings.KNOWLEDGE_PACK_PATH)
    return _triage_engine_instance

@router.get("/dashboard", response_model=List[IntakeSession], tags=["Clinician"])
async def clinician_dashboard():
    """
    Return all active intake sessions for clinician dashboard view.
    Only sessions with status not 'completed'.
    """
    memory_store = get_memory_store()
    sessions = []
    # Scan all keys for sessions (inefficient for MVP, replace with real DB)
    for key in memory_store._store.keys():
        if key.startswith("intake_session:"):
            session = memory_store.get(key)
            if session and session.get("status") != "completed":
                sessions.append(IntakeSession(**session))
    # Order by started_at descending (most recent first)
    sessions = sorted(sessions, key=lambda s: s.started_at, reverse=True)
    return sessions

@router.get("/review/{session_token}", response_model=IntakeSession, tags=["Clinician"])
async def review_intake_session(session_token: str):
    """
    Retrieve a specific intake session for review.
    """
    memory_store = get_memory_store()
    session = memory_store.get(f"intake_session:{session_token}")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found.")
    return IntakeSession(**session)

@router.post("/edit_answer", response_model=IntakeSession, tags=["Clinician"])
async def edit_intake_answer(
    req: dict
):
    """
    Edit or override a patient's intake answer (clinician-in-the-loop).
    Original and override are both auditable.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()

    session_token = req.get("session_token")
    field = req.get("field")
    new_value = req.get("new_value")
    clinician_id = req.get("clinician_id")
    if not session_token or not field or clinician_id is None:
        raise HTTPException(status_code=400, detail="Missing required field(s).")

    session = memory_store.get(f"intake_session:{session_token}")
    if not session or not session.get("intake_data"):
        raise HTTPException(status_code=404, detail="Session or intake data not found.")

    intake_data = IntakeQuestionnaireResponse(**session["intake_data"])
    original_val = getattr(intake_data, field, None)
    if not hasattr(intake_data, "overrides") or intake_data.overrides is None:
        intake_data.overrides = {}
    intake_data.overrides[field] = original_val
    setattr(intake_data, field, new_value)
    # Add audit
    now = datetime.utcnow()
    if not hasattr(intake_data, "audit_trail") or intake_data.audit_trail is None:
        intake_data.audit_trail = []
    intake_data.audit_trail.append({
        "at": now.isoformat(),
        "event_type": "clinician_edit",
        "field": field,
        "original_val": original_val,
        "override_val": new_value,
        "clinician_id": clinician_id
    })

    session["intake_data"] = intake_data.dict()
    memory_store.set(f"intake_session:{session_token}", session, ttl=settings.TOKEN_EXPIRE_MINUTES * 60)

    audit_logger.log_event(
        event_type="clinician_edits/overrides",
        actor_type="clinician",
        actor_id=clinician_id,
        session_token=session_token,
        patient_id=intake_data.patient_id,
        metadata={
            "field": field,
            "original_val": original_val,
            "override_val": new_value
        }
    )

    return IntakeSession(**session)

@router.post("/last_minute_concerns", response_model=IntakeSession, tags=["Clinician"])
async def add_last_minute_concerns(req: dict):
    """
    Clinician adds last-minute concerns to intake session. Audited and included in wrap-up.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()

    session_token = req.get("session_token")
    concerns = req.get("concerns")
    clinician_id = req.get("clinician_id")
    if session_token is None or clinician_id is None:
        raise HTTPException(status_code=400, detail="Missing required fields.")

    session = memory_store.get(f"intake_session:{session_token}")
    if not session or not session.get("intake_data"):
        raise HTTPException(status_code=404, detail="Session or intake not found.")

    intake_data = IntakeQuestionnaireResponse(**session["intake_data"])
    if not hasattr(intake_data, "additional_notes") or intake_data.additional_notes is None:
        intake_data.additional_notes = ""
    intake_data.additional_notes = (intake_data.additional_notes or "") + f"\n[Last-minute] {concerns}"
    # Audit
    now = datetime.utcnow()
    if not hasattr(intake_data, "audit_trail") or intake_data.audit_trail is None:
        intake_data.audit_trail = []
    intake_data.audit_trail.append({
        "at": now.isoformat(),
        "event_type": "clinician_last_minute_concerns",
        "concerns": concerns,
        "clinician_id": clinician_id
    })
    session["intake_data"] = intake_data.dict()
    memory_store.set(f"intake_session:{session_token}", session, ttl=settings.TOKEN_EXPIRE_MINUTES * 60)

    audit_logger.log_event(
        event_type="clinician_adds_last_minute_concerns",
        actor_type="clinician",
        actor_id=clinician_id,
        session_token=session_token,
        patient_id=intake_data.patient_id,
        metadata={
            "concerns": concerns
        }
    )

    return IntakeSession(**session)