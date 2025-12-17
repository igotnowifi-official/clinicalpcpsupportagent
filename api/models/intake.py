"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field


# -------------------
# Issue Card for body map issue/region reporting
# -------------------
class IssueCard(BaseModel):
    issue_id: str = Field(..., description="Unique identifier for this issue on this intake")
    region_id: str = Field(
        ...,
        description="Body region (from body_front.svg or body_back.svg region id)"
    )
    description: str = Field(..., description="Patient-entered or clinician-scribed description")
    pain_score: Optional[int] = Field(
        None, ge=0, le=10, description="Pain score 0-10"
    )
    functional_impact: str = Field(
        ...,
        description="Functional impact: none/mild/moderate/severe",
        regex="^(none|mild|moderate|severe)$"
    )
    onset: str = Field(
        ...,
        description="Onset timing: today/days/weeks/months"
    )
    course: str = Field(
        ...,
        description="Course: improving/worsening/unchanged"
    )
    triggers: Optional[str] = Field(
        None, description="Optional free-text: triggers"
    )
    relief_factors: Optional[str] = Field(
        None, description="Optional free-text: relief factors"
    )


# ----------------------
# Vitals section (clinic-grade or 'Unknown')
# ----------------------
class Vitals(BaseModel):
    temperature: Optional[float] = Field(None, description="Degrees Celsius")
    heart_rate: Optional[int] = Field(None, description="bpm")
    respiratory_rate: Optional[int] = Field(None, description="per min")
    blood_pressure_systolic: Optional[int] = Field(None, description="mmHg")
    blood_pressure_diastolic: Optional[int] = Field(None, description="mmHg")
    oxygen_saturation: Optional[int] = Field(None, description="percent")
    height_cm: Optional[float] = Field(None, description="cm")
    weight_kg: Optional[float] = Field(None, description="kg")
    bmi: Optional[float] = Field(None, description="auto-calculated, or null")
    unknown: Optional[bool] = Field(
        None, description="Checked when vitals are not available"
    )


# ---------------------
# Symptom checklist and followups (from questionnaire)
# ---------------------
class SymptomEntry(BaseModel):
    symptom_id: str
    present: Optional[bool] = None
    severity: Optional[str] = None
    duration: Optional[str] = None
    notes: Optional[str] = None


# ----------------------
# Past medical, medications, allergies, family history, social history
# ----------------------
class MedicationsEntry(BaseModel):
    med_name: str
    med_class: str
    reason: Optional[str] = None


class AllergyEntry(BaseModel):
    allergen: str
    reaction: Optional[str] = None


class FamilyHistoryEntry(BaseModel):
    relation: str
    condition: str


class SocialHistory(BaseModel):
    tobacco: Optional[str] = None
    alcohol: Optional[str] = None
    drugs: Optional[str] = None
    occupation: Optional[str] = None
    stressors: Optional[str] = None
    exercise: Optional[str] = None


# ---------------------
# Red flag screening
# ---------------------
class RedFlagScreening(BaseModel):
    red_flag_id: str
    present: bool
    notes: Optional[str] = None


# ------------------------
# Intake Questionnaire Response (Clinic or Telehealth Mode)
# ------------------------
class IntakeQuestionnaireResponse(BaseModel):
    session_token: str = Field(..., description="Intake session unique token")
    patient_id: str = Field(..., description="Unique patient id")
    issued_by: str = Field(..., description="User id of staff or clinician who issued")
    intake_mode: str = Field(
        ...,
        description="full (in-clinic) or telehealth (telehealth-short)"
    )
    started_at: datetime = Field(..., description="Timestamp session start")
    submitted_at: Optional[datetime] = Field(None, description="If completed, submission time")
    entered_by: Optional[str] = Field(
        None, description="User id for manual intake (eg, clinician telehealth entry)"
    )
    reported_by: Optional[str] = Field(
        None, description="Patient or proxy (always set)"
    )

    # Tier 1
    chief_concern: str = Field(..., description="Chief complaint or reason for visit")
    issue_cards: List[IssueCard] = Field(
        ..., description="Body map or location-specific issue cards"
    )
    symptoms: List[SymptomEntry] = Field(
        ..., description="System-based symptom checklist"
    )
    red_flags: List[RedFlagScreening] = Field(
        ..., description="Early red flag screening"
    )
    consent_acknowledged: bool = Field(..., description="Consent/disclaimer check")
    medications: List[MedicationsEntry] = Field(..., description="Patient meds or blank")
    allergies: List[AllergyEntry] = Field(..., description="Patient allergies or blank")
    vitals: Vitals = Field(..., description="Clinic vital signs or explicit 'Unknown'")
    # Tier 2
    pmh: List[str] = Field(..., description="Past Medical History items")
    symptom_durations: Dict[str, Optional[str]] = Field(
        ..., description="For each symptom/issue, duration (days/weeks/months/years/unknown)"
    )
    functional_impacts: Dict[str, Optional[str]] = Field(
        ..., description="For each symptom/issue, functional impact string"
    )
    social_history: SocialHistory = Field(..., description="Social/risk history fields")
    # Tier 3
    ros: Optional[Dict[str, bool]] = Field(
        default_factory=dict, description="Review of systems: symptom_id → present"
    )
    family_history: Optional[List[FamilyHistoryEntry]] = Field(
        default_factory=list, description="Family history items"
    )
    occupation: Optional[str] = None
    additional_notes: Optional[str] = None  # Optional free text
    # Meta/audit
    last_modified: datetime = Field(default_factory=datetime.utcnow)
    source: str = Field(
        default="patient", description="patient | staff | clinician"
    )
    overrides: Optional[Dict[str, Any]] = Field(
        default_factory=dict, description="If any staff/clinician corrections or overrides"
    )
    audit_trail: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list, description="Action-audit events for this intake"
    )


# ------------------------
# Intake session object as stored in DB (to enforce status)
# ------------------------
class IntakeSession(BaseModel):
    session_token: str = Field(..., description="Unique session token")
    patient_id: str = Field(..., description="Unique patient id")
    status: str = Field(
        ..., description="waiting | questionnaire_issued | in_progress | submitted | completed"
    )
    issued_by: str = Field(..., description="User id (staff or clinician)")
    intake_mode: str = Field(..., description="full | telehealth")
    started_at: datetime = Field(default_factory=datetime.utcnow)
    submitted_at: Optional[datetime] = None
    expires_at: Optional[datetime] = None
    intake_data: Optional[IntakeQuestionnaireResponse] = None
    entered_by: Optional[str] = None
    reported_by: Optional[str] = None
    # For audit
    audit_trail: Optional[List[Dict[str, Any]]] = Field(
        default_factory=list, description="Audit log for this session"
    )


# ----------------------------
# Intake Submission Response for API
# ----------------------------
class IntakeSubmissionStatus(BaseModel):
    session_token: str
    patient_id: str
    submitted_at: datetime
    status: str = Field(..., description="accepted | rejected | error")
    missing_fields: Optional[List[str]] = None
    assistant_actions_required: Optional[List[str]] = None
    audit_event_id: Optional[str] = None