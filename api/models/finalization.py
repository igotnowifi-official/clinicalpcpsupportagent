"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class WrapUpPlan(BaseModel):
    final_diagnosis_id: Optional[str] = Field(
        None, description="Condition_id from knowledge pack if selected"
    )
    final_diagnosis_text: Optional[str] = Field(
        None, description="Free-text override or additional info"
    )
    labs: List[str] = Field(default_factory=list, description="Lab category ids from knowledge pack")
    referrals: List[str] = Field(default_factory=list, description="Referral ids/from guides sheet")
    med_categories: List[str] = Field(default_factory=list, description="Medication category suggestions (no dosing)")
    actions: List[str] = Field(default_factory=list, description="Other actions")
    guides: List[str] = Field(default_factory=list, description="IDS for patient-education guides")
    followup_timing: Optional[str] = Field(
        None, description="Follow-up timing instructions"
    )
    followup_instructions: Optional[str] = Field(
        None, description="Detailed follow-up or return precautions"
    )
    additional_notes: Optional[str] = Field(
        None, description="Clinician notes (not sent to patient unless included in comm.)"
    )
    attachments: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list, description="Attachment meta for comm. (guides, uploads, files)"
    )
    patient_message_draft: Optional[str] = Field(
        None, description="Drafted (but not final) outbound communication to patient"
    )


class ClinicalWrapUpRequest(BaseModel):
    intake_session_token: str = Field(..., description="Session token")
    user_id: str = Field(..., description="Clinician id finalizing plan")
    wrapup_plan: WrapUpPlan = Field(..., description="Plan for finalization")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ClinicalWrapUpResponse(BaseModel):
    intake_session_token: str = Field(..., description="Session token")
    status: str = Field(..., description="finalized | error")
    finalized_at: Optional[datetime] = Field(default_factory=datetime.utcnow)
    audit_event_id: Optional[str] = Field(None, description="Audit event id for compliance")
    comm_draft: Optional[str] = Field(None, description="Final draft of patient communication, attachments if any")
    additional_info: Optional[Dict[str, Any]] = Field(default_factory=dict)