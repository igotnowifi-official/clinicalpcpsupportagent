"""
© 2025 igotnowifi, LLC
Proprietary and confidential.

Adapters package - Swappable data layer for knowledge base and memory.
"""

from .knowledge_base import (
    KnowledgeBaseAdapter,
    get_knowledge_base_adapter,
    reset_knowledge_base_adapter
)

from .memory_store import (
    MockMemoryStore,
    get_memory_store,
    reset_memory_store
)

__all__ = [
    # Knowledge Base
    'KnowledgeBaseAdapter',
    'get_knowledge_base_adapter',
    'reset_knowledge_base_adapter',
    
    # Memory Store
    'MockMemoryStore',
    'get_memory_store',
    'reset_memory_store',
]