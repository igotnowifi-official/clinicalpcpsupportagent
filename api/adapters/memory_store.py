"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import threading
import time
from typing import Any, Optional

class MockMemoryStore:
    """
    Mock, swappable adapter for MemVerge MemMachine.
    Simulates a clinic-safe, non-distributed, in-memory key-value store with TTL support.
    Interface matches real memory adapter for future swap.
    Singleton behavior enforced.
    """
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MockMemoryStore, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self._store = {}
        self._expiry = {}
        self._initialized = True

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        """
        Set value for key, with optional TTL (seconds).
        """
        with self._lock:
            self._store[key] = value
            if ttl is not None:
                self._expiry[key] = time.time() + ttl
            elif key in self._expiry:
                del self._expiry[key]

    def get(self, key: str) -> Optional[Any]:
        """
        Get value for key, return None if missing or expired.
        """
        with self._lock:
            if key in self._expiry:
                if time.time() >= self._expiry[key]:
                    # Key expired
                    del self._store[key]
                    del self._expiry[key]
                    return None
            return self._store.get(key, None)

    def delete(self, key: str):
        """
        Delete entry if exists.
        """
        with self._lock:
            if key in self._store:
                del self._store[key]
            if key in self._expiry:
                del self._expiry[key]

    def clear(self):
        """
        Remove all keys (for testing/admin use only).
        """
        with self._lock:
            self._store.clear()
            self._expiry.clear()

# Factory function for singleton instance
_memory_store_instance: Optional[MockMemoryStore] = None

def get_memory_store() -> MockMemoryStore:
    global _memory_store_instance
    if _memory_store_instance is None:
        _memory_store_instance = MockMemoryStore()
    return _memory_store_instance