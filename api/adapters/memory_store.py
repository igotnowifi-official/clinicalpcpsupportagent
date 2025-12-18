"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import threading
import time
import json
import pickle
from typing import Any, Optional, Dict
from pathlib import Path


class MockMemoryStore:
    """
    Mock, swappable adapter for MemVerge MemMachine.
    Simulates a clinic-safe, non-distributed, in-memory key-value store with TTL support.
    Interface matches real memory adapter for future swap.
    Singleton behavior enforced.
    
    Features:
    - Thread-safe operations
    - TTL (time-to-live) support
    - Optional persistence to disk
    - Namespace support for multi-tenancy
    """
    
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MockMemoryStore, cls).__new__(cls)
        return cls._instance

    def __init__(self, persist_path: Optional[str] = None):
        if hasattr(self, "_initialized") and self._initialized:
            return
        
        self._store: Dict[str, Any] = {}
        self._expiry: Dict[str, float] = {}
        self._persist_path = Path(persist_path) if persist_path else None
        self._initialized = True
        
        # Load persisted data if available
        if self._persist_path and self._persist_path.exists():
            self._load_from_disk()

    def set(self, key: str, value: Any, ttl: Optional[int] = None, namespace: str = "default"):
        """
        Set value for key, with optional TTL (seconds).
        
        Args:
            key: Key to store value under
            value: Value to store (must be serializable)
            ttl: Time to live in seconds (optional)
            namespace: Namespace for key isolation (default: "default")
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            self._store[full_key] = value
            
            if ttl is not None:
                self._expiry[full_key] = time.time() + ttl
            elif full_key in self._expiry:
                del self._expiry[full_key]
            
            if self._persist_path:
                self._save_to_disk()

    def get(self, key: str, namespace: str = "default", default: Any = None) -> Any:
        """
        Get value for key, return default if missing or expired.
        
        Args:
            key: Key to retrieve
            namespace: Namespace to search in
            default: Default value if key not found
            
        Returns:
            Stored value or default
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            # Check expiry
            if full_key in self._expiry:
                if time.time() >= self._expiry[full_key]:
                    # Key expired
                    del self._store[full_key]
                    del self._expiry[full_key]
                    if self._persist_path:
                        self._save_to_disk()
                    return default
            
            return self._store.get(full_key, default)

    def delete(self, key: str, namespace: str = "default"):
        """
        Delete entry if exists.
        
        Args:
            key: Key to delete
            namespace: Namespace to search in
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            if full_key in self._store:
                del self._store[full_key]
            if full_key in self._expiry:
                del self._expiry[full_key]
            
            if self._persist_path:
                self._save_to_disk()

    def exists(self, key: str, namespace: str = "default") -> bool:
        """
        Check if key exists and is not expired.
        
        Args:
            key: Key to check
            namespace: Namespace to search in
            
        Returns:
            True if key exists and is not expired
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            if full_key in self._expiry:
                if time.time() >= self._expiry[full_key]:
                    # Key expired
                    del self._store[full_key]
                    del self._expiry[full_key]
                    if self._persist_path:
                        self._save_to_disk()
                    return False
            
            return full_key in self._store

    def get_ttl(self, key: str, namespace: str = "default") -> Optional[int]:
        """
        Get remaining TTL for a key in seconds.
        
        Args:
            key: Key to check
            namespace: Namespace to search in
            
        Returns:
            Remaining seconds or None if no TTL set or key doesn't exist
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            if full_key not in self._store:
                return None
            
            if full_key not in self._expiry:
                return None
            
            remaining = self._expiry[full_key] - time.time()
            return max(0, int(remaining))

    def keys(self, pattern: str = "*", namespace: str = "default") -> list:
        """
        Get all keys matching pattern in namespace.
        
        Args:
            pattern: Pattern to match (supports * wildcard)
            namespace: Namespace to search in
            
        Returns:
            List of matching keys (without namespace prefix)
        """
        prefix = f"{namespace}:"
        
        with self._lock:
            # Clean up expired keys first
            current_time = time.time()
            expired = [k for k, exp in self._expiry.items() if current_time >= exp]
            for k in expired:
                if k in self._store:
                    del self._store[k]
                del self._expiry[k]
            
            # Find matching keys
            matching = []
            for full_key in self._store.keys():
                if not full_key.startswith(prefix):
                    continue
                
                key = full_key[len(prefix):]
                
                if pattern == "*":
                    matching.append(key)
                elif "*" in pattern:
                    # Simple wildcard matching
                    pattern_parts = pattern.split("*")
                    if all(part in key for part in pattern_parts if part):
                        matching.append(key)
                elif key == pattern:
                    matching.append(key)
            
            return matching

    def clear(self, namespace: Optional[str] = None):
        """
        Remove all keys in namespace or entire store.
        
        Args:
            namespace: Namespace to clear (None = clear all)
        """
        with self._lock:
            if namespace is None:
                self._store.clear()
                self._expiry.clear()
            else:
                prefix = f"{namespace}:"
                keys_to_delete = [k for k in self._store.keys() if k.startswith(prefix)]
                for k in keys_to_delete:
                    del self._store[k]
                    if k in self._expiry:
                        del self._expiry[k]
            
            if self._persist_path:
                self._save_to_disk()

    def increment(self, key: str, amount: int = 1, namespace: str = "default") -> int:
        """
        Increment a numeric value atomically.
        
        Args:
            key: Key to increment
            amount: Amount to increment by
            namespace: Namespace to use
            
        Returns:
            New value after increment
        """
        full_key = self._make_key(namespace, key)
        
        with self._lock:
            current = self._store.get(full_key, 0)
            if not isinstance(current, (int, float)):
                raise ValueError(f"Key {key} contains non-numeric value")
            
            new_value = current + amount
            self._store[full_key] = new_value
            
            if self._persist_path:
                self._save_to_disk()
            
            return new_value

    def get_multi(self, keys: list, namespace: str = "default") -> Dict[str, Any]:
        """
        Get multiple keys at once.
        
        Args:
            keys: List of keys to retrieve
            namespace: Namespace to search in
            
        Returns:
            Dictionary of key-value pairs (excludes missing/expired keys)
        """
        result = {}
        for key in keys:
            value = self.get(key, namespace)
            if value is not None:
                result[key] = value
        return result

    def set_multi(self, items: Dict[str, Any], ttl: Optional[int] = None, namespace: str = "default"):
        """
        Set multiple key-value pairs at once.
        
        Args:
            items: Dictionary of key-value pairs to set
            ttl: TTL to apply to all keys
            namespace: Namespace to use
        """
        for key, value in items.items():
            self.set(key, value, ttl, namespace)

    def _make_key(self, namespace: str, key: str) -> str:
        """Create full key with namespace prefix"""
        return f"{namespace}:{key}"

    def _save_to_disk(self):
        """Persist store to disk"""
        if not self._persist_path:
            return
        
        try:
            self._persist_path.parent.mkdir(parents=True, exist_ok=True)
            with open(self._persist_path, 'wb') as f:
                pickle.dump({
                    'store': self._store,
                    'expiry': self._expiry
                }, f)
        except Exception as e:
            print(f"Warning: Failed to persist memory store: {e}")

    def _load_from_disk(self):
        """Load persisted store from disk"""
        try:
            with open(self._persist_path, 'rb') as f:
                data = pickle.load(f)
                self._store = data.get('store', {})
                self._expiry = data.get('expiry', {})
                
                # Clean up expired keys
                current_time = time.time()
                expired = [k for k, exp in self._expiry.items() if current_time >= exp]
                for k in expired:
                    if k in self._store:
                        del self._store[k]
                    del self._expiry[k]
        except Exception as e:
            print(f"Warning: Failed to load persisted memory store: {e}")

    def stats(self) -> Dict[str, Any]:
        """
        Get store statistics.
        
        Returns:
            Dictionary with store stats
        """
        with self._lock:
            namespaces = {}
            for full_key in self._store.keys():
                if ':' in full_key:
                    ns = full_key.split(':', 1)[0]
                    namespaces[ns] = namespaces.get(ns, 0) + 1
            
            return {
                'total_keys': len(self._store),
                'keys_with_ttl': len(self._expiry),
                'namespaces': namespaces,
                'persist_enabled': self._persist_path is not None
            }


# Factory function for singleton instance
_memory_store_instance: Optional[MockMemoryStore] = None


def get_memory_store(persist_path: Optional[str] = None) -> MockMemoryStore:
    """
    Get singleton instance of MockMemoryStore.
    
    Args:
        persist_path: Optional path to persist store data
        
    Returns:
        MockMemoryStore instance
    """
    global _memory_store_instance
    if _memory_store_instance is None:
        _memory_store_instance = MockMemoryStore(persist_path)
    return _memory_store_instance


def reset_memory_store():
    """Reset singleton (for testing)"""
    global _memory_store_instance
    _memory_store_instance = None