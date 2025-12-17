"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import threading
import time
from typing import Any, Optional, Dict, List


class MockMemoryStoreForTest:
    """
    Pure test/mock memory store adapter.
    Not for pilot/clinic use.
    - No background expiry.
    - Supports key/value with optional TTL.
    - Exposes all keys for test introspection.
    - Logs all set/delete operations for audit in test context.
    Thread safe, but does NOT implement distributed/multiprocess coordination.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MockMemoryStoreForTest, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self._store: Dict[str, Any] = {}
        self._expiry: Dict[str, float] = {}
        self._audit_log: List[Dict[str, Any]] = []
        self._initialized = True

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        with self._lock:
            self._store[key] = value
            if ttl is not None:
                self._expiry[key] = time.time() + ttl
            elif key in self._expiry:
                del self._expiry[key]
            self._audit_log.append({
                "op": "SET",
                "key": key,
                "value": value,
                "ttl": ttl,
                "ts": time.time()
            })

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._expiry:
                if time.time() >= self._expiry[key]:
                    self._audit_log.append({
                        "op": "EXPIRE",
                        "key": key,
                        "ts": time.time()
                    })
                    del self._store[key]
                    del self._expiry[key]
                    return None
            val = self._store.get(key, None)
            self._audit_log.append({
                "op": "GET",
                "key": key,
                "returned": val,
                "ts": time.time()
            })
            return val

    def delete(self, key: str):
        with self._lock:
            existed = key in self._store
            if existed:
                del self._store[key]
            if key in self._expiry:
                del self._expiry[key]
            self._audit_log.append({
                "op": "DEL",
                "key": key,
                "found": existed,
                "ts": time.time()
            })

    def clear(self):
        with self._lock:
            deleted_keys = list(self._store.keys())
            self._store.clear()
            self._expiry.clear()
            self._audit_log.append({
                "op": "CLEAR",
                "deleted_keys": deleted_keys,
                "ts": time.time()
            })

    def keys(self) -> List[str]:
        with self._lock:
            current_keys = list(self._store.keys())
            self._audit_log.append({
                "op": "KEYS",
                "return": current_keys,
                "ts": time.time()
            })
            return current_keys

    def get_audit_log(self) -> List[Dict[str, Any]]:
        with self._lock:
            return list(self._audit_log)

# Factory for test harnesses
_mock_test_memory_store_instance: Optional[MockMemoryStoreForTest] = None

def get_mock_memory_store_for_test() -> MockMemoryStoreForTest:
    global _mock_test_memory_store_instance
    if _mock_test_memory_store_instance is None:
        _mock_test_memory_store_instance = MockMemoryStoreForTest()
    return _mock_test_memory_store_instance