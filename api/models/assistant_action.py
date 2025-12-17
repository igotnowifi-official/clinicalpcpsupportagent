"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime

class AssistantActionApplyRequest(BaseModel):
    intake_session_token: str = Field(..., description="Associated intake session token")
    action_id: str = Field(..., description="Assistant action unique ID (per session/triage)")
    inputs: Dict[str, Any] = Field(..., description="Key-value dict of required inputs for this action")
    applied_by: str = Field(..., description="User id of clinical staff/clinician applying the action")
    timestamp: Optional[datetime] = Field(default_factory=datetime.utcnow)
    notes: Optional[str] = Field(None, description="Optional notes or rationale")


class AssistantActionApplyResponse(BaseModel):
    action_id: str = Field(..., description="Assistant action unique ID")
    applied: bool = Field(..., description="True if applied successfully")
    re_triage_triggered: bool = Field(..., description="True if triage re-run was triggered")
    triage_id: Optional[str] = Field(None, description="New triage event id (if re-triaged)")
    missing_fields: Optional[list] = Field(default_factory=list)
    audit_event_id: Optional[str] = Field(None, description="Audit event id for compliance")
    message: Optional[str] = Field(None, description="Additional system message to user")