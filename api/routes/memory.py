from fastapi import APIRouter, HTTPException
from typing import Optional, Dict, List, Any
from pydantic import BaseModel

from api.services.memmachine_client import memmachine_client

router = APIRouter()

class DashboardPreferences(BaseModel):
    sortBy: Optional[str] = None
    showStates: Optional[List[str]] = None

class DraftStyle(BaseModel):
    tone: Optional[str] = None
    length: Optional[str] = None

class ClinicianPreferences(BaseModel):
    dashboard_preferences: Optional[DashboardPreferences] = None
    draft_style: Optional[DraftStyle] = None
    # Allow extra fields for flexibility
    class Config:
        extra = "allow"

@router.get("/clinician/{clinician_id}/preferences", response_model=ClinicianPreferences, tags=["Memory"])
async def get_clinician_preferences(clinician_id: str):
    """
    Get clinician preferences from MemMachine (non-PHI).
    """
    preferences = memmachine_client.get_memory(
        namespace="clinician_preferences",
        subject_id=clinician_id,
        key="preferences"
    )
    
    if preferences is None:
        # Return empty preferences if not found or error (fail open)
        return ClinicianPreferences()
    
    return preferences

@router.post("/clinician/{clinician_id}/preferences", response_model=ClinicianPreferences, tags=["Memory"])
async def update_clinician_preferences(clinician_id: str, preferences: ClinicianPreferences):
    """
    Update clinician preferences in MemMachine.
    """
    memmachine_client.upsert_memory(
        namespace="clinician_preferences",
        subject_id=clinician_id,
        key="preferences",
        value=preferences.dict(exclude_unset=True)
    )
    
    return preferences
