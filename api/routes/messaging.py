"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from fastapi import APIRouter, HTTPException, status, Request
from typing import Optional
from datetime import datetime

from api.models.message import (
    MessageDraftGenerateRequest,
    MessageDraftGenerateResponse,
    MessageSendRequest,
    MessageSendResponse,
)
from api.adapters.memory_store import get_memory_store
from api.services.message_generator import get_message_generator
from api.services.audit_logger import get_audit_logger

router = APIRouter()


@router.post("/draft", response_model=MessageDraftGenerateResponse, tags=["Messaging"])
async def generate_draft_message(
    req: MessageDraftGenerateRequest,
    request: Request
):
    """
    Generate (but do not send) a draft outbound message for the patient (and admin copy).
    Draft must obey clinic policy: no probabilities, no sensitive substance unless included by clinician,
    and always has return precautions.
    Emits an audit event.
    """
    msg_generator = get_message_generator()
    draft = msg_generator.generate_patient_message_draft(req)
    return draft

@router.post("/send", response_model=MessageSendResponse, tags=["Messaging"])
async def send_message(
    req: MessageSendRequest,
    request: Request
):
    """
    Mock send the finalized message (records event, does not actually send email/SMS).
    Always emits an audit event and stores nothing in prod systems for the MVP.
    """
    msg_generator = get_message_generator()
    resp = msg_generator.send_message(req)
    return resp