"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field
from datetime import datetime


class MessageAttachment(BaseModel):
    attachment_id: str = Field(..., description="Unique id or filename")
    type: str = Field(..., description="File type or category (guide, pdf, image, etc.)")
    name: str = Field(..., description="Display name")
    meta: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Additional metadata (e.g. guide ref)")


class CommunicationRecipient(BaseModel):
    recipient_type: str = Field(..., description="patient | admin | lab | pharmacy | specialist | other")
    contact: str = Field(..., description="Email or other address")
    name: Optional[str] = Field(None, description="Name (optional)")


class MessageDraftGenerateRequest(BaseModel):
    intake_session_token: str = Field(..., description="Session token")
    user_id: str = Field(..., description="Clinician or staff user creating draft")
    context: Dict[str, Any] = Field(..., description="All context for draft: wrapup, guides, actions, etc.")


class MessageDraftGenerateResponse(BaseModel):
    draft_id: str = Field(..., description="Draft message unique id")
    generated_at: datetime = Field(default_factory=datetime.utcnow)
    subject: str = Field(..., description="Recommended subject line")
    body: str = Field(..., description="Draft body text (editable)")
    attachments: List[MessageAttachment] = Field(default_factory=list)
    routing: List[CommunicationRecipient] = Field(default_factory=list)
    audit_event_id: Optional[str] = Field(None, description="Audit event id for draft generation")


class MessageSendRequest(BaseModel):
    draft_id: str = Field(..., description="Outbound message draft id (from generation step)")
    sender_id: str = Field(..., description="User sending the message")
    recipients: List[CommunicationRecipient] = Field(..., description="Recipients and contact info")
    body: str = Field(..., description="Finalized message body as sent")
    attachments: List[MessageAttachment] = Field(default_factory=list)
    meta: Dict[str, Any] = Field(default_factory=dict, description="Extra metadata for routing")
    send_mode: str = Field(default="sent_mock", description="sent_mock (always for MVP)")
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class MessageSendResponse(BaseModel):
    message_id: str = Field(..., description="Sent message unique id")
    status: str = Field(..., description="sent_mock | error")
    sent_at: datetime = Field(default_factory=datetime.utcnow)
    recipients: List[CommunicationRecipient]
    audit_event_id: Optional[str] = Field(None, description="Audit trail event for send")
    info: Optional[Dict[str, Any]] = Field(default_factory=dict)