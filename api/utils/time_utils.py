"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from datetime import datetime, timedelta, timezone
from typing import Optional

def utcnow_isoformat() -> str:
    """
    Returns current UTC time as ISO8601 string with 'Z' suffix.
    """
    return datetime.utcnow().replace(tzinfo=timezone.utc).isoformat().replace("+00:00", "Z")

def parse_isoformat(dt_str: str) -> Optional[datetime]:
    """
    Parses an ISO8601 UTC string ('2025-01-01T12:30:00Z') into a datetime.
    Returns None if parsing fails.
    """
    try:
        if dt_str.endswith("Z"):
            dt_str = dt_str[:-1] + "+00:00"
        return datetime.fromisoformat(dt_str)
    except Exception:
        return None

def add_minutes(dt: datetime, minutes: int) -> datetime:
    """
    Returns a datetime with N minutes added.
    """
    return dt + timedelta(minutes=minutes)

def to_user_friendly(dt: datetime) -> str:
    """
    Returns a string in 'YYYY-MM-DD HH:MM' format in local timezone.
    """
    return dt.astimezone().strftime("%Y-%m-%d %H:%M")

def seconds_until(dt: datetime) -> int:
    """
    Returns the number of seconds until the given datetime (from now, UTC).
    Negative if already past.
    """
    return int((dt - datetime.utcnow().replace(tzinfo=None)).total_seconds())