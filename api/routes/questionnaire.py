"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, Query
from typing import Dict, Any, Optional
from api.adapters.knowledge_base import get_knowledge_base_adapter
from api.config import settings

router = APIRouter()

@router.get("/intake", tags=["Questionnaire"])
async def get_intake_questionnaire(
    mode: str = Query("full", description="Intake questionnaire mode: 'full' or 'telehealth'")
):
    """
    Returns the exact intake questionnaire from knowledge pack.
    Branching and rendering are determined by the frontend using these definitions.
    """
    kb = get_knowledge_base_adapter(settings.KNOWLEDGE_PACK_PATH)
    try:
        if mode not in ("full", "telehealth"):
            raise HTTPException(status_code=400, detail="mode must be 'full' or 'telehealth'")
        df = kb.get_intake_questionnaire(mode=mode)
        records = df.to_dict(orient="records")
        return {"mode": mode, "questionnaire": records}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error loading questionnaire: {ex}")

@router.get("/branch_rules", tags=["Questionnaire"])
async def get_branch_rules():
    """
    Returns intake_branch_rules as defined in the knowledge pack.
    Used for frontend branching logic and assistant triggers.
    """
    kb = get_knowledge_base_adapter(settings.KNOWLEDGE_PACK_PATH)
    try:
        df = kb.get_branch_rules()
        records = df.to_dict(orient="records")
        return {"branch_rules": records}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error loading branch rules: {ex}")

@router.get("/symptom_map", tags=["Questionnaire"])
async def get_symptom_map():
    """
    Returns the intake_q_symptom_map as defined in the knowledge pack.
    Maps questionnaire items to symptoms for inference.
    """
    kb = get_knowledge_base_adapter(settings.KNOWLEDGE_PACK_PATH)
    try:
        df = kb.get_symptom_map()
        records = df.to_dict(orient="records")
        return {"symptom_map": records}
    except Exception as ex:
        raise HTTPException(status_code=500, detail=f"Error loading symptom map: {ex}")