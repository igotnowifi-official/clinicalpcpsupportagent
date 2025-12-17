"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from datetime import datetime
import uuid
from typing import Dict, Any, List, Optional

from api.models.message import (
    MessageDraftGenerateRequest,
    MessageDraftGenerateResponse,
    MessageSendRequest,
    MessageSendResponse,
    MessageAttachment,
    CommunicationRecipient,
)
from api.services.audit_logger import get_audit_logger
from api.config import settings

class MessageGenerator:
    """
    Responsible for generating and sending (mocked) communications,
    including draft patient communications and routing copies to admin/lab/etc.
    Business logic ensures:
      - No probabilities or diagnoses in patient comms unless free text was added by clinician.
      - Always includes return precautions.
      - Sensitive substance details only if manually added.
      - Admin receives CC by default.
    """

    def __init__(self):
        self.audit_logger = get_audit_logger()
        # If needed, additional knowledge may be loaded for guides/templates.

    def generate_patient_message_draft(
        self,
        req: MessageDraftGenerateRequest
    ) -> MessageDraftGenerateResponse:
        """
        Composes a draft message for review before actual send.
        Ensures compliance with product rules.
        """
        context = req.context or {}
        wrapup = context.get("wrapup", {})
        patient_info = context.get("patient_info", {})
        guides: List[Dict[str, Any]] = context.get("guides", [])

        subject = f"Visit Summary from {settings.APP_NAME}"
        body_lines = []
        # Greeting
        body_lines.append(f"Hello {patient_info.get('first_name','')},")
        body_lines.append("")
        # Chief concern
        if "chief_concern" in context:
            body_lines.append(f"Reason for visit: {context['chief_concern']}")
            body_lines.append("")

        # Summarize what was done/reviewed, excluding DX/probability (unless override)
        if "plan" in wrapup:
            plan = wrapup["plan"]
            if plan.get("final_diagnosis_text"):
                body_lines.append(f"Summary: {plan['final_diagnosis_text']}")
                body_lines.append("")
            # Labs, referrals, actions
            if plan.get("labs"):
                labs = ", ".join(plan["labs"])
                body_lines.append(f"Ordered labs: {labs}")
            if plan.get("referrals"):
                refs = ", ".join(plan["referrals"])
                body_lines.append(f"Referrals: {refs}")
            if plan.get("med_categories"):
                meds = ", ".join(plan["med_categories"])
                body_lines.append(f"Medication recommendations: {meds}")
            if plan.get("actions"):
                actions = ", ".join(plan["actions"])
                body_lines.append(f"Clinic actions: {actions}")
            if plan.get("guides"):
                guides = ", ".join(plan["guides"])
                body_lines.append(f"Patient guides provided: {guides}")
            body_lines.append("")
        # Always include return precautions
        return_precautions = (
            wrapup.get("plan", {}).get("followup_instructions")
            or "If you develop new or worsening symptoms, please contact us or go to the emergency department."
        )
        body_lines.append("Return Precautions:")
        body_lines.append(return_precautions)
        body_lines.append("")
        # Footer
        body_lines.append("Thank you for choosing our clinic.")
        body_lines.append("Powered by igotnowifi, LLC")
        body = "\n".join(body_lines)

        # Attachments (provided as guides/files)
        attachments = []
        for g in guides:
            if "attachment_id" in g:
                attachments.append(
                    MessageAttachment(
                        attachment_id=g["attachment_id"],
                        type=g.get("type", "guide"),
                        name=g.get("name", ""),
                        meta=g.get("meta", {})
                    )
                )

        # Recipients: only patient and admin in draft
        routing = [
            CommunicationRecipient(
                recipient_type="patient",
                contact=patient_info.get("email",""),
                name=patient_info.get("first_name","")
            ),
            CommunicationRecipient(
                recipient_type="admin",
                contact=settings.EMAIL_SENDER,
                name="Clinic Admin"
            ),
        ]

        audit_event_id = self.audit_logger.log_event(
            event_type="generate_draft_message",
            actor_type="clinician" if req.user_id else "staff",
            actor_id=req.user_id,
            session_token=req.intake_session_token,
            patient_id=patient_info.get("patient_id"),
            metadata={
                "message_type": "patient_summary",
                "routing": [r.dict() for r in routing]
            }
        )

        return MessageDraftGenerateResponse(
            draft_id=str(uuid.uuid4()),
            generated_at=datetime.utcnow(),
            subject=subject,
            body=body,
            attachments=attachments,
            routing=routing,
            audit_event_id=audit_event_id
        )

    def send_message(
        self,
        req: MessageSendRequest
    ) -> MessageSendResponse:
        """
        Simulates sending a message in MVP mode (sent_mock).
        Will always emit an audit event.
        """
        audit_event_id = self.audit_logger.log_event(
            event_type="send_mock_message",
            actor_type="clinician",
            actor_id=req.sender_id,
            session_token=None,
            patient_id=None,
            metadata={
                "draft_id": req.draft_id,
                "recipients": [r.dict() for r in req.recipients],
                "attachments": [a.dict() for a in req.attachments],
                "send_mode": req.send_mode
            }
        )

        return MessageSendResponse(
            message_id=str(uuid.uuid4()),
            status="sent_mock",
            sent_at=datetime.utcnow(),
            recipients=req.recipients,
            audit_event_id=audit_event_id,
            info={"send_mode": req.send_mode}
        )

# Factory for DI/use in endpoints
_message_generator_instance: Optional[MessageGenerator] = None

def get_message_generator() -> MessageGenerator:
    global _message_generator_instance
    if _message_generator_instance is None:
        _message_generator_instance = MessageGenerator()
    return _message_generator_instance