"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, status, Request
from typing import Optional
from datetime import datetime
import uuid

from api.models.intake import IntakeSession, IntakeQuestionnaireResponse
from api.models.triage import TriageResult
from api.services.triage_engine import TriageEngine
from api.services.audit_logger import get_audit_logger
from api.adapters.memory_store import get_memory_store
from api.config import settings

router = APIRouter()

# Singleton engine instance for now (per process, hot-reloads with gunicorn reload)
_triage_engine_instance: Optional[TriageEngine] = None

def get_triage_engine() -> TriageEngine:
    global _triage_engine_instance
    if _triage_engine_instance is None:
        _triage_engine_instance = TriageEngine(settings.KNOWLEDGE_PACK_PATH)
    return _triage_engine_instance

@router.post("/run", response_model=TriageResult, tags=["Triage"])
async def run_triage(
    req: dict,
    request: Request
):
    """
    Perform triage reasoning on submitted intake.
    Always emits audit event and returns top 5 differential (clinician), 
    assistant actions, and suggestions.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()
    triage_engine = get_triage_engine()

    session_token = req.get("intake_session_token") or req.get("session_token")
    if not session_token:
        raise HTTPException(status_code=400, detail="Missing intake_session_token")
    session = memory_store.get(f"intake_session:{session_token}")
    if not session or not session.get("intake_data"):
        raise HTTPException(status_code=404, detail="No intake data to triage.")

    intake_data = IntakeQuestionnaireResponse(**session["intake_data"])

    triage_result = triage_engine.run(
        intake_data,
        previous_triage_id=None,
        actor_type=req.get("actor_type"),
        actor_id=req.get("actor_id"),
    )

    audit_event_id = audit_logger.log_event(
        event_type="re-triage" if req.get("is_rerun") else "triage",
        actor_type=req.get("actor_type", "clinician"),
        actor_id=req.get("actor_id"),
        session_token=session_token,
        patient_id=intake_data.patient_id,
        metadata={
            "triage_id": triage_result.triage_id,
            "timestamp": triage_result.timestamp.isoformat()
        }
    )

    triage_result.audit_event_id = audit_event_id

    return triage_result