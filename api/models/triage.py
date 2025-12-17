"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class ConditionProbability(BaseModel):
    condition_id: str = Field(..., description="Condition ID from knowledge pack")
    condition_name: str = Field(..., description="Human-readable name")
    probability: float = Field(..., description="Normalized probability, 0.0–1.0")
    confidence_label: str = Field(
        ..., description="high | medium | low"
    )
    triggered_red_flag: Optional[bool] = Field(
        default=False,
        description="Flag as True if this is a red-flag/urgent match"
    )
    suppressed_due_to_red_flag: Optional[bool] = Field(
        default=False,
        description="If True, not prioritized due to red flag override"
    )
    notes: Optional[str] = Field(
        None, description="Optional system-generated notes (e.g. 'Low symptom match', etc.)"
    )


class AssistantAction(BaseModel):
    action_id: str = Field(..., description="Assistant action ID")
    description: str = Field(..., description="Action explanation")
    completed: bool = Field(default=False)
    triggered_by: str = Field(..., description="What missing field or rule triggered this action")
    ui_component: Optional[str] = Field(
        None, description="UI component to be used (from assistant_action_ui_map)"
    )


class FollowUpQuestion(BaseModel):
    question_id: str = Field(..., description="From intake_branch_rules/followup sheet")
    description: str = Field(..., description="Follow-up question wording")
    field_type: str = Field(..., description="string/choice/boolean/etc.")
    answer: Optional[Any] = None
    required: bool = Field(default=True)


class TriageSummary(BaseModel):
    acuity: str = Field(..., description="urgent | routine | deferred | followup")
    summary: str = Field(..., description="Automated summary for clinical use")
    red_flags: List[str] = Field(default_factory=list, description="List of flagged red flag IDs")
    major_anomalies: List[str] = Field(default_factory=list, description="Detected contradictions or anomalies")


class SuggestionItem(BaseModel):
    suggestion_type: str = Field(..., description="labs | referrals | meds | actions | guides")
    suggestion_id: str = Field(..., description="Mapped to knowledge pack")
    description: str = Field(..., description="Human-readable suggestion")
    relevant_condition_id: Optional[str] = Field(None, description="If specific to a suggested diagnosis")


class TriageResult(BaseModel):
    intake_session_token: str = Field(..., description="Session token")
    triage_id: str = Field(..., description="Triage event unique ID")
    timestamp: datetime = Field(default_factory=datetime.utcnow)

    # Always presented for clinicians
    top_5_conditions: List[ConditionProbability] = Field(..., description="Top 5 conditions with probabilities")
    
    # Assistant/actions/follow-up logic (clinical staff/clinician only)
    assistant_actions: List[AssistantAction] = Field(default_factory=list, description="Assistant actions needed")
    followup_questions: List[FollowUpQuestion] = Field(default_factory=list, description="Follow-up questions, if low confidence or missing data")
    
    triage_summary: TriageSummary = Field(..., description="Automated triage summary, incl. anomalies")
    suggestions: List[SuggestionItem] = Field(default_factory=list, description="Labs, referrals, med categories, actions, guides")
    wrapup: Optional[Dict[str, Any]] = Field(default_factory=dict, description="For clinical wrap-up section")
    patient_communication_draft: Optional[str] = Field(default=None, description="System-generated draft for patient (no probabilities or sensitive data)")
    audit_event_id: Optional[str] = None