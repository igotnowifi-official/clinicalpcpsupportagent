"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, status, Request, Response, Depends
from typing import Optional, List
from datetime import datetime, timedelta
import uuid

from api.models.intake import (
    IntakeQuestionnaireResponse,
    IntakeSubmissionStatus,
    IntakeSession,
)
from api.adapters.memory_store import get_memory_store
from api.services.audit_logger import get_audit_logger
from api.config import settings

router = APIRouter()

# Utility: Generate session tokens for issued questionnaires
def _generate_session_token():
    return f"q_{uuid.uuid4().hex[:20]}"

@router.post("/issue", response_model=IntakeSession, tags=["Staff"])
async def issue_questionnaire(
    request: Request,
    body: dict
):
    """
    Staff issues a questionnaire (full or telehealth-short).
    Creates an intake session, returns token and metadata.
    Emits audit event.
    """
    if "patient_id" not in body:
        raise HTTPException(status_code=400, detail="Missing patient_id")
    if "issued_by" not in body:
        raise HTTPException(status_code=400, detail="Missing issued_by (staff user id)")
    if "intake_mode" not in body or body["intake_mode"] not in ("full", "telehealth"):
        raise HTTPException(status_code=400, detail="intake_mode must be 'full' or 'telehealth'")

    session_token = _generate_session_token()
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()
    started_at = datetime.utcnow()
    expires_at = started_at + timedelta(minutes=settings.TOKEN_EXPIRE_MINUTES)

    session_obj = IntakeSession(
        session_token=session_token,
        patient_id=body["patient_id"],
        status="questionnaire_issued",
        issued_by=body["issued_by"],
        intake_mode=body["intake_mode"],
        started_at=started_at,
        expires_at=expires_at,
        submitted_at=None,
        intake_data=None,
        entered_by=None,
        reported_by=None,
        audit_trail=[]
    )

    memory_store.set(f"intake_session:{session_token}", session_obj.dict(), ttl=settings.TOKEN_EXPIRE_MINUTES * 60)
    audit_event_id = audit_logger.log_event(
        event_type="issue_questionnaire",
        actor_type="staff",
        actor_id=body["issued_by"],
        session_token=session_token,
        patient_id=body["patient_id"],
        metadata={
            "intake_mode": body["intake_mode"]
        }
    )
    # Append audit to in-memory session
    session_obj.audit_trail.append({
        "at": started_at.isoformat(),
        "event_type": "issue_questionnaire",
        "audit_event_id": audit_event_id
    })

    memory_store.set(f"intake_session:{session_token}", session_obj.dict(), ttl=settings.TOKEN_EXPIRE_MINUTES * 60)

    return session_obj

@router.get("/session/{session_token}", response_model=IntakeSession, tags=["Staff", "Patient"])
async def get_intake_session(
    session_token: str
):
    """
    Retrieve an intake session (meta + status only).
    """
    memory_store = get_memory_store()
    session = memory_store.get(f"intake_session:{session_token}")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    return IntakeSession(**session)

@router.post("/submit", response_model=IntakeSubmissionStatus, tags=["Patient"])
async def submit_intake(
    resp: IntakeQuestionnaireResponse,
    request: Request
):
    """
    Patient submits intake questionnaire. Completion and compliance enforced.
    Triggers audit event.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()
    submitted_at = datetime.utcnow()
    session_token = resp.session_token

    # Retrieve session
    session = memory_store.get(f"intake_session:{session_token}")
    if not session:
        raise HTTPException(status_code=404, detail="Session not found or expired")
    session_obj = IntakeSession(**session)
    # Validate tier-1 completion (clinical enforcement)
    missing_fields = []
    tier1_fields = [
        "chief_concern",
        "issue_cards",
        "symptoms",
        "red_flags",
        "consent_acknowledged",
        "medications",
        "allergies",
        "vitals"
    ]
    for field in tier1_fields:
        val = getattr(resp, field, None)
        if field == "issue_cards":
            if not val or len(val) == 0:
                missing_fields.append(field)
        elif field == "symptoms":
            if not val or len(val) == 0 or not any(getattr(sym, "present", False) for sym in val):
                missing_fields.append(field)
        elif val is None or (isinstance(val, str) and not val):
            missing_fields.append(field)
        elif field == "consent_acknowledged" and val is False:
            missing_fields.append(field)

    if missing_fields:
        status_str = "rejected"
    else:
        status_str = "accepted"
        # Mark submitted in session
        session_obj.status = "submitted"
        session_obj.submitted_at = submitted_at
        session_obj.intake_data = resp.dict()
        # Set in memory with same TTL so staff/clinicians can review
        memory_store.set(f"intake_session:{session_token}", session_obj.dict(), ttl=settings.TOKEN_EXPIRE_MINUTES * 60)

    audit_event_id = audit_logger.log_event(
        event_type="questionnaire_submit",
        actor_type="patient",
        actor_id=resp.patient_id,
        session_token=session_token,
        patient_id=resp.patient_id,
        metadata={
            "submitted_at": submitted_at.isoformat(),
            "missing_fields": missing_fields
        }
    )

    return IntakeSubmissionStatus(
        session_token=session_token,
        patient_id=resp.patient_id,
        submitted_at=submitted_at,
        status=status_str,
        missing_fields=missing_fields if missing_fields else None,
        assistant_actions_required=None,
        audit_event_id=audit_event_id
    )