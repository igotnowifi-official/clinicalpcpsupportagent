"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Dict, Any

def validate_tier1_completion(response: Any, required_fields: List[str]) -> List[str]:
    """
    Validates that all required Tier 1 fields are completed (not None, non-empty).
    Returns a list of missing or invalid field names.
    Handles both patient and telehealth intake modes.
    """
    missing = []
    for field in required_fields:
        val = getattr(response, field, None)
        if field == "issue_cards":
            if not val or len(val) == 0:
                missing.append(field)
        elif field == "symptoms":
            # Must have at least one present symptom
            if not val or len(val) == 0 or not any(getattr(sym, "present", False) for sym in val):
                missing.append(field)
        elif field == "consent_acknowledged":
            if not val:
                missing.append(field)
        elif field == "vitals":
            if not val or (
                hasattr(val, "unknown") and getattr(val, "unknown") is not True
                and not any(getattr(val, attr) for attr in ["temperature", "heart_rate", "respiratory_rate", "blood_pressure_systolic", "blood_pressure_diastolic", "oxygen_saturation", "height_cm", "weight_kg", "bmi"])
            ):
                missing.append(field)
        elif val is None or (isinstance(val, str) and not val):
            missing.append(field)
    return missing

def validate_red_flags(response: Any, red_flag_ids: List[str]) -> List[str]:
    """
    Checks if any red flags (by id) are present in the intake response.
    Returns a list of triggered red flag ids.
    """
    triggered = []
    if hasattr(response, "red_flags"):
        for rf in getattr(response, "red_flags", []):
            if hasattr(rf, "red_flag_id") and hasattr(rf, "present"):
                if rf.present and rf.red_flag_id in red_flag_ids:
                    triggered.append(rf.red_flag_id)
    return triggered

def validate_tier2_prompts(response: Any, checklist: List[Dict[str, Any]]) -> List[str]:
    """
    Validates Tier 2 completion (for assistant prompting).
    Returns missing Tier 2 field names as list.
    The checklist is a list of dicts from clinician_validation_checklist.
    """
    missing = []
    for item in checklist:
        if str(item.get("tier_level")) != "2":
            continue
        field = item.get("field_id")
        required = bool(item.get("required", True))
        if required:
            val = getattr(response, field, None)
            if not val or (isinstance(val, list) and len(val) == 0):
                missing.append(field)
    return missing