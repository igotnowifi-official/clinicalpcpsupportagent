"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, Request
from typing import Optional
from datetime import datetime
import uuid

from api.models.assistant_action import (
    AssistantActionApplyRequest,
    AssistantActionApplyResponse,
)
from api.models.intake import IntakeSession, IntakeQuestionnaireResponse
from api.services.audit_logger import get_audit_logger
from api.adapters.memory_store import get_memory_store
from api.models.triage import TriageResult
from api.services.triage_engine import TriageEngine
from api.config import settings

router = APIRouter()

# Singleton for triage engine
_triage_engine_instance: Optional[TriageEngine] = None

def get_triage_engine() -> TriageEngine:
    global _triage_engine_instance
    if _triage_engine_instance is None:
        _triage_engine_instance = TriageEngine(settings.KNOWLEDGE_PACK_PATH)
    return _triage_engine_instance

@router.post("/apply", response_model=AssistantActionApplyResponse, tags=["Assistant"])
async def apply_assistant_action(
    req: AssistantActionApplyRequest,
    request: Request
):
    """
    Endpoint for clinical staff to complete an assistant action.
    Validates inputs, updates intake session, and re-triages session instantly.
    All actions are auditable and trigger re-triage events.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()
    triage_engine = get_triage_engine()

    session_token = req.intake_session_token
    session = memory_store.get(f"intake_session:{session_token}")
    if not session or not session.get("intake_data"):
        raise HTTPException(status_code=404, detail="Intake session or intake data not found.")

    # Load intake_data and update fields as per assistant action
    intake_data = IntakeQuestionnaireResponse(**session["intake_data"])
    inputs = req.inputs or {}

    # For strictness, check if the action_id maps to a known field (field update)
    action_field_id = req.action_id.replace("assistant_", "", 1)
    if hasattr(intake_data, action_field_id):
        # Overwrite field, store original to 'overrides' in intake_data
        original_val = getattr(intake_data, action_field_id)
        if not hasattr(intake_data, "overrides") or intake_data.overrides is None:
            intake_data.overrides = {}
        intake_data.overrides[action_field_id] = original_val
        setattr(intake_data, action_field_id, inputs.get(action_field_id))
    else:
        # If not a direct field, refuse unless "fieldless" (e.g., custom/manual/notes)
        raise HTTPException(status_code=400, detail=f"Assistant action not mapped to known intake field: {action_field_id}")

    # Update audit trail for intake
    now = datetime.utcnow()
    if not hasattr(intake_data, "audit_trail") or intake_data.audit_trail is None:
        intake_data.audit_trail = []
    intake_data.audit_trail.append({
        "at": now.isoformat(),
        "event_type": "assistant_action_apply",
        "action_id": req.action_id,
        "applied_by": req.applied_by,
        "inputs": inputs
    })

    # Save updated intake back to session
    session["intake_data"] = intake_data.dict()
    memory_store.set(f"intake_session:{session_token}", session, ttl=settings.TOKEN_EXPIRE_MINUTES * 60)

    # Audit event: assistant_action_apply
    audit_event_id = audit_logger.log_event(
        event_type="assistant_action_apply",
        actor_type="staff",
        actor_id=req.applied_by,
        session_token=session_token,
        patient_id=intake_data.patient_id,
        metadata={
            "inputs": inputs,
            "action_id": req.action_id
        }
    )

    # Instantly re-triage after update
    triage_result = triage_engine.run(
        intake_data,
        previous_triage_id=None,
        actor_type="staff",
        actor_id=req.applied_by
    )

    # Attach new audit event to response
    resp = AssistantActionApplyResponse(
        action_id=req.action_id,
        applied=True,
        re_triage_triggered=True,
        triage_id=triage_result.triage_id,
        missing_fields=None,
        audit_event_id=audit_event_id,
        message="Action applied and triage updated."
    )
    return resp