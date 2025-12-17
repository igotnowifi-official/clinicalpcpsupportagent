"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, status, Request, Response
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime, timedelta
import uuid

from api.services.audit_logger import get_audit_logger
from api.adapters.memory_store import get_memory_store
from api.config import settings

router = APIRouter()

# Request/response models

class PatientCheckInRequest(BaseModel):
    first_name: str = Field(..., description="Patient first name")
    last_name: str = Field(..., description="Patient last name")
    dob: str = Field(..., description="Date of birth, ISO format")
    patient_id: Optional[str] = Field(None, description="Existing patient_id if known")


class PatientCheckInResponse(BaseModel):
    case_id: str
    patient_id: str
    checked_in_at: datetime
    status: str
    audit_event_id: str


@router.post("/checkin", response_model=PatientCheckInResponse, tags=["Patient"])
async def check_in_patient(
    req: PatientCheckInRequest,
    request: Request,
    response: Response
):
    """
    Patient Check-In Endpoint.
    Always emits an audit event.
    Sets up a case as 'waiting' and persists minimal patient metadata.
    """
    memory_store = get_memory_store()
    audit_logger = get_audit_logger()

    now = datetime.utcnow()
    patient_id = req.patient_id
    if not patient_id:
        # Assign a new patient_id (could switch to DB in the future)
        patient_id = f"pt_{uuid.uuid4().hex[:16]}"
    case_id = f"case_{uuid.uuid4().hex[:16]}"

    # Store in memory (for MVP; should persist in DB later)
    memory_store.set(f"patient:{patient_id}", {
        "patient_id": patient_id,
        "first_name": req.first_name,
        "last_name": req.last_name,
        "dob": req.dob,
        "checked_in_at": now.isoformat(),
        "case_id": case_id,
        "status": "waiting"
    }, ttl=24 * 3600)  # 1 day TTL

    memory_store.set(f"case:{case_id}", {
        "case_id": case_id,
        "patient_id": patient_id,
        "checkin_time": now.isoformat(),
        "status": "waiting"
    }, ttl=24 * 3600)

    audit_event_id = audit_logger.log_event(
        event_type="check_in",
        actor_type="patient",
        actor_id=patient_id,
        session_token=None,
        patient_id=patient_id,
        metadata={
            "case_id": case_id,
            "checkin_time": now.isoformat()
        }
    )

    return PatientCheckInResponse(
        case_id=case_id,
        patient_id=patient_id,
        checked_in_at=now,
        status="waiting",
        audit_event_id=audit_event_id
    )