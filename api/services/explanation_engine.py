"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Dict, Any, Optional
from api.adapters.knowledge_base import get_knowledge_base_adapter
from api.models.triage import ConditionProbability

class ExplanationEngine:
    """
    Generates audit-friendly clinical explanations for each step in triage.
    Every explanation is factual, source-linked, and can be presented 
    on the clinician dashboard (but never to patients).
    No generative AI is present here—reasoning is rule-based/mocked for the MVP.
    """

    def __init__(self, knowledge_pack_path: str):
        self.kb = get_knowledge_base_adapter(knowledge_pack_path)

    def explain_condition_probability(
        self,
        condition_prob: ConditionProbability,
        patient_symptoms: List[str],
        triggered_red_flags: List[str],
        pmh: List[str],
        issue_cards: List[Dict[str, Any]],
        medications: List[str],
        allergies: List[str],
    ) -> Dict[str, Any]:
        """
        Returns a description dictionary explaining why this condition's probability and confidence were assigned.
        Includes pointers to rules, symptoms, and standard sources from the knowledge pack.
        """
        condition_id = condition_prob.condition_id
        cond_row = self.kb.get_conditions()
        cond_row = cond_row[cond_row["condition_id"] == condition_id]
        explanation = {
            "condition_id": condition_id,
            "condition_name": condition_prob.condition_name,
            "matched_symptoms": [],
            "matched_supports": [],
            "matched_issues": [],
            "matched_red_flags": [],
            "confidence_label": condition_prob.confidence_label,
            "references": [],
            "notes": [],
        }

        if cond_row.empty:
            explanation["notes"].append("No source row in knowledge pack.")
            return explanation
        cond_row = cond_row.iloc[0]
        key_symptoms = str(cond_row.get("key_symptoms") or "").split(";")
        supports = str(cond_row.get("supports") or "").split(";")
        red_flags = str(cond_row.get("red_flags") or "").split(";")

        # Match key symptoms
        explanation["matched_symptoms"] = list(sorted(set(key_symptoms) & set(patient_symptoms)))

        # Match supports
        explanation["matched_supports"] = list(sorted(set(supports) & set(pmh)))

        # Match issues (issue card body regions/descriptions)
        issue_matches = []
        for ic in issue_cards:
            desc = ic.get("description", "").lower()
            if condition_prob.condition_name.lower() in desc:
                issue_matches.append(desc)
        explanation["matched_issues"] = issue_matches

        # Matched red flags (if any were present and in this condition's list)
        explanation["matched_red_flags"] = list(sorted(set(red_flags) & set(triggered_red_flags)))
        if explanation["matched_red_flags"]:
            explanation["notes"].append("Red flag(s) for this condition were triggered.")

        # Confidence label logic explanation
        explanation["notes"].append(
            f"Confidence is {condition_prob.confidence_label} based on probability {condition_prob.probability:.2f}."
        )

        # References to condition sheet row and mappings
        explanation["references"].append({
            "sheet": "conditions",
            "row_index": int(getattr(cond_row, 'name', -1)),  # pandas name is row index
            "key_symptoms": key_symptoms,
            "supports": supports,
            "red_flags": red_flags,
        })
        # Meds/allergies mapped for demo
        if medications:
            explanation["notes"].append(f"Medications counted: {', '.join(medications)}")
        if allergies:
            explanation["notes"].append(f"Allergies present: {', '.join(allergies)}")

        return explanation

    def explain_anomaly(
        self, anomaly_type: str, context: Dict[str, Any]
    ) -> str:
        """
        Generates a simple human-readable message for a detected intake anomaly or contradiction.
        """
        if anomaly_type == "prefer_not_to_say":
            return (
                "Multiple items marked 'prefer not to say.' Prompt patient or review with clinician."
            )
        elif anomaly_type == "vitals_missing":
            return "No vitals entered and not marked unknown. Prompt for vitals or reason."
        elif anomaly_type == "contradiction":
            return f"Clinical contradiction in data: {context.get('details','Unknown contradiction')}"
        else:
            return f"Uncategorized anomaly: {anomaly_type}"

    def explain_assistant_action(
        self,
        action: Dict[str, Any]
    ) -> str:
        """
        Explains why an assistant action was triggered, mapped to branch rules and assistant ui maps.
        """
        field = action.get("triggered_by") or action.get("action_id")
        desc = action.get("description")
        return f"Assistant Action for field '{field}': {desc}"

    def explain_followup_question(
        self,
        question: Dict[str, Any]
    ) -> str:
        """
        Explains the rationale for asking a follow-up question (for clinician review).
        """
        field_id = question.get("question_id")
        description = question.get("description")
        return f"Suggested follow-up question ('{field_id}'): {description}"
