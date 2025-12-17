"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import uuid
import secrets
from datetime import datetime, timedelta
from typing import Tuple

def generate_session_token(prefix: str = "q") -> str:
    """
    Generates a randomized session token with prefix (default 'q' for questionnaire).
    """
    return f"{prefix}_{uuid.uuid4().hex[:20]}"

def generate_pin(length: int = 6) -> str:
    """
    Generates a numeric staff PIN of specified length.
    """
    return ''.join(secrets.choice("0123456789") for _ in range(length))

def generate_expiry(minutes: int = 20) -> datetime:
    """
    Returns a datetime with the specified number of minutes from now (UTC).
    """
    return datetime.utcnow() + timedelta(minutes=minutes)

def validate_token(token: str, expected_prefix: str = "q") -> bool:
    """
    Checks token format and prefix for lightweight validation.
    """
    return token.startswith(f"{expected_prefix}_") and len(token) > len(expected_prefix) + 2 + 10