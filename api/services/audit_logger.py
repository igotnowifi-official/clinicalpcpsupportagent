"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import json
import threading
import uuid
from datetime import datetime
from pathlib import Path
from typing import Optional, Dict, Any

from api.config import settings

class AuditLogger:
    """
    Immutable, append-only audit logger.
    Ensures every sensitive/actionable workflow is tracked per compliance spec.
    Uses a local file in MVP, upgradable to external tamper-evident log.
    Thread-safe.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(AuditLogger, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self.log_path = Path(settings.AUDIT_LOG_PATH)
        self.immutable = bool(settings.AUDIT_IMMUTABLE)
        self._initialized = True

    def log_event(
        self,
        event_type: str,
        actor_type: str,
        actor_id: Optional[str],
        session_token: Optional[str],
        patient_id: Optional[str],
        metadata: Optional[Dict[str, Any]] = None
    ) -> str:
        """
        Write an audit event. Returns audit_event_id.
        Fields:
            event_type: standardized event code (see workflow spec)
            actor_type: patient | staff | clinician | admin | system
            actor_id: user id (if any)
            session_token: intake or session token if action relates to a session
            patient_id: if action relates to a patient record
            metadata: freeform event metadata for search/compliance
        """
        audit_event_id = str(uuid.uuid4())
        ts = datetime.utcnow().isoformat() + "Z"
        event = {
            "audit_event_id": audit_event_id,
            "timestamp": ts,
            "event_type": event_type,
            "actor_type": actor_type,
            "actor_id": actor_id,
            "session_token": session_token,
            "patient_id": patient_id,
            "metadata": metadata or {},
        }
        line = json.dumps(event, separators=(",", ":")) + "\n"
        with self._lock:
            with self.log_path.open("a", encoding="utf-8") as f:
                f.write(line)
        return audit_event_id

    def get_events_for_session(self, session_token: str) -> list:
        events = []
        if not self.log_path.exists():
            return []
        with self._lock, self.log_path.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    if obj.get("session_token") == session_token:
                        events.append(obj)
                except Exception:
                    continue
        return events

    def get_events_for_patient(self, patient_id: str) -> list:
        events = []
        if not self.log_path.exists():
            return []
        with self._lock, self.log_path.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    if obj.get("patient_id") == patient_id:
                        events.append(obj)
                except Exception:
                    continue
        return events

    def get_event_by_id(self, audit_event_id: str) -> Optional[dict]:
        if not self.log_path.exists():
            return None
        with self._lock, self.log_path.open("r", encoding="utf-8") as f:
            for line in f:
                try:
                    obj = json.loads(line)
                    if obj.get("audit_event_id") == audit_event_id:
                        return obj
                except Exception:
                    continue
        return None

    def clear_log(self) -> None:
        """Wipe the audit log (only for development/testing, never in production)."""
        if self.immutable:
            raise PermissionError("Audit logs are immutable in compliance mode.")
        with self._lock:
            self.log_path.write_text("")

# Singleton factory
_audit_logger_instance: Optional[AuditLogger] = None

def get_audit_logger() -> AuditLogger:
    global _audit_logger_instance
    if _audit_logger_instance is None:
        _audit_logger_instance = AuditLogger()
    return _audit_logger_instance