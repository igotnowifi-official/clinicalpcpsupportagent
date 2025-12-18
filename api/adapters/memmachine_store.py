"""
© 2025 igotnowifi, LLC
Proprietary and confidential.

MemVerge MemMachine Adapter for Patient Logs and Session Management
"""

import threading
from typing import Any, Optional, Dict
import json
import time

# MemMachine SDK import (install with: pip install memmachine-sdk)
try:
    from memmachine import MemMachineClient, MemMachineConfig
    MEMMACHINE_AVAILABLE = True
except ImportError:
    MEMMACHINE_AVAILABLE = False
    MemMachineClient = None
    MemMachineConfig = None


class MemMachineStore:
    """
    Real MemVerge MemMachine adapter for production use.
    Provides distributed, persistent memory store for:
    - Patient intake sessions
    - Patient logs and history
    - Triage results caching
    - Session management with TTL
    
    Features:
    - Distributed across multiple instances
    - Persistent storage
    - High performance
    - Thread-safe operations
    - TTL support
    - Namespace support for multi-tenancy
    """
    
    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(MemMachineStore, cls).__new__(cls)
        return cls._instance

    def __init__(
        self,
        endpoint: Optional[str] = None,
        api_key: Optional[str] = None,
        namespace: str = "clinic_intake"
    ):
        if hasattr(self, "_initialized") and self._initialized:
            return
        
        if not MEMMACHINE_AVAILABLE:
            raise ImportError(
                "MemMachine SDK is not installed. "
                "Install it with: pip install memmachine-sdk"
            )
        
        # Initialize MemMachine client
        config = MemMachineConfig(
            endpoint=endpoint or "http://localhost:8081",  # Default MemMachine endpoint
            api_key=api_key,
            namespace=namespace
        )
        
        self.client = MemMachineClient(config)
        self.namespace = namespace
        self._initialized = True

    def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[int] = None, 
        namespace: str = "default"
    ):
        """
        Set value for key, with optional TTL (seconds).
        
        Args:
            key: Key to store value under
            value: Value to store (must be JSON serializable)
            ttl: Time to live in seconds (optional)
            namespace: Namespace for key isolation
        """
        full_key = self._make_key(namespace, key)
        
        # Serialize value to JSON
        serialized_value = json.dumps(value) if not isinstance(value, str) else value
        
        # Set with TTL if provided
        if ttl:
            self.client.set(full_key, serialized_value, ttl=ttl)
        else:
            self.client.set(full_key, serialized_value)

    def get(
        self, 
        key: str, 
        namespace: str = "default", 
        default: Any = None
    ) -> Any:
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
        
        try:
            value = self.client.get(full_key)
            if value is None:
                return default
            
            # Try to deserialize JSON
            try:
                return json.loads(value)
            except (json.JSONDecodeError, TypeError):
                return value
        except Exception:
            return default

    def delete(self, key: str, namespace: str = "default"):
        """Delete entry if exists."""
        full_key = self._make_key(namespace, key)
        try:
            self.client.delete(full_key)
        except Exception:
            pass  # Ignore errors if key doesn't exist

    def exists(self, key: str, namespace: str = "default") -> bool:
        """Check if key exists and is not expired."""
        full_key = self._make_key(namespace, key)
        try:
            return self.client.exists(full_key)
        except Exception:
            return False

    def get_ttl(self, key: str, namespace: str = "default") -> Optional[int]:
        """Get remaining TTL for a key in seconds."""
        full_key = self._make_key(namespace, key)
        try:
            return self.client.ttl(full_key)
        except Exception:
            return None

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
        
        try:
            all_keys = self.client.keys(f"{prefix}{pattern}")
            # Remove namespace prefix
            return [k[len(prefix):] for k in all_keys if k.startswith(prefix)]
        except Exception:
            return []

    def clear(self, namespace: Optional[str] = None):
        """Remove all keys in namespace or entire store."""
        if namespace is None:
            # Clear all keys in our namespace
            try:
                all_keys = self.client.keys(f"{self.namespace}:*")
                for key in all_keys:
                    self.client.delete(key)
            except Exception:
                pass
        else:
            prefix = f"{namespace}:"
            try:
                keys_to_delete = self.client.keys(f"{prefix}*")
                for key in keys_to_delete:
                    self.client.delete(key)
            except Exception:
                pass

    def increment(self, key: str, amount: int = 1, namespace: str = "default") -> int:
        """Increment a numeric value atomically."""
        full_key = self._make_key(namespace, key)
        try:
            return self.client.increment(full_key, amount)
        except Exception:
            # Fallback: get, increment, set
            current = self.get(key, namespace, 0)
            if not isinstance(current, (int, float)):
                raise ValueError(f"Key {key} contains non-numeric value")
            new_value = current + amount
            self.set(key, new_value, namespace=namespace)
            return new_value

    def get_multi(self, keys: list, namespace: str = "default") -> Dict[str, Any]:
        """Get multiple keys at once."""
        result = {}
        for key in keys:
            value = self.get(key, namespace)
            if value is not None:
                result[key] = value
        return result

    def set_multi(
        self, 
        items: Dict[str, Any], 
        ttl: Optional[int] = None, 
        namespace: str = "default"
    ):
        """Set multiple key-value pairs at once."""
        for key, value in items.items():
            self.set(key, value, ttl, namespace)

    def _make_key(self, namespace: str, key: str) -> str:
        """Create full key with namespace prefix."""
        return f"{self.namespace}:{namespace}:{key}"

    def stats(self) -> Dict[str, Any]:
        """Get store statistics."""
        try:
            all_keys = self.client.keys(f"{self.namespace}:*")
            namespaces = {}
            for full_key in all_keys:
                parts = full_key.split(":", 2)
                if len(parts) >= 3:
                    ns = parts[1]
                    namespaces[ns] = namespaces.get(ns, 0) + 1
            
            return {
                'total_keys': len(all_keys),
                'namespaces': namespaces,
                'memmachine_enabled': True,
                'endpoint': self.client.config.endpoint
            }
        except Exception:
            return {
                'total_keys': 0,
                'namespaces': {},
                'memmachine_enabled': True,
                'endpoint': self.client.config.endpoint if hasattr(self, 'client') else None
            }


# Factory function
_memmachine_store_instance: Optional[MemMachineStore] = None


def get_memmachine_store(
    endpoint: Optional[str] = None,
    api_key: Optional[str] = None,
    namespace: str = "clinic_intake"
) -> MemMachineStore:
    """
    Get singleton instance of MemMachineStore.
    
    Args:
        endpoint: MemMachine server endpoint
        api_key: API key for authentication
        namespace: Base namespace for all keys
        
    Returns:
        MemMachineStore instance
    """
    global _memmachine_store_instance
    if _memmachine_store_instance is None:
        _memmachine_store_instance = MemMachineStore(endpoint, api_key, namespace)
    return _memmachine_store_instance


def reset_memmachine_store():
    """Reset singleton (for testing)"""
    global _memmachine_store_instance
    _memmachine_store_instance = None

