# Adapters Documentation

© 2025 igotnowifi, LLC - Proprietary and confidential

## Overview

The adapters package provides swappable data layer implementations for the clinical support system. These adapters enable seamless switching between development (mock/Excel) and production (Neo4j/MemVerge) backends without changing application code.

## Architecture Principles

1. **Fixed Interface**: All adapters provide a consistent API regardless of backend
2. **Singleton Pattern**: Prevents multiple connections and ensures data consistency
3. **Thread-Safe**: All operations are thread-safe for concurrent access
4. **Drop-in Replacement**: Switch backends by changing initialization parameters only

## Knowledge Base Adapter

### Purpose

Provides access to clinical knowledge including conditions, symptoms, red flags, questionnaires, and their relationships.

### Modes

#### Excel Mode (Development)
```python
from api.adapters import get_knowledge_base_adapter

kb = get_knowledge_base_adapter(
    excel_path="data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx",
    use_neo4j=False
)
```

#### Neo4j Mode (Production)
```python
kb = get_knowledge_base_adapter(
    use_neo4j=True,
    neo4j_uri="neo4j+s://your-instance.databases.neo4j.io",
    neo4j_user="neo4j",
    neo4j_password="your_password",
    neo4j_database="neo4j"
)
```

### API Methods

#### Basic Data Access
```python
# Get questionnaires
intake_q = kb.get_intake_questionnaire(mode="full")  # or "telehealth"
branch_rules = kb.get_branch_rules()
symptom_map = kb.get_symptom_map()

# Get clinical entities
conditions = kb.get_conditions()
symptoms = kb.get_symptoms()
red_flags = kb.get_red_flags()
actions = kb.get_actions()
guides = kb.get_guides()
labs = kb.get_labs()
specialists = kb.get_specialists()
medications = kb.get_medications()
templates = kb.get_templates()

# Get assistant data
assistant_actions = kb.get_assistant_actions()
ui_map = kb.get_assistant_action_ui_map()
validation_checklist = kb.get_validation_checklist()
```

#### Graph Queries (Neo4j Only)
```python
# Get condition with all relationships
full_condition = kb.query_condition_with_relationships("posture_related_headache")
# Returns: {condition, labs, medications, actions, guides, referrals, ...}

# Get symptoms supporting a condition
symptoms = kb.query_symptoms_for_condition("posture_related_headache")
# Returns: [{symptom_id, name, weight, notes}, ...]

# Get red flags triggered by a symptom
red_flags = kb.query_red_flags_for_symptom("chest_pain")
# Returns: [{redflag_id, name, urgency, notes}, ...]
```

#### Utility Methods
```python
# Reload data from source
kb.reload()

# Close connections
kb.close()
```

### Data Structure

All methods return pandas DataFrames with the following schemas:

**Conditions**: `condition_id`, `name`, `severity`, `description`

**Symptoms**: `symptom_id`, `name`, `category`

**Red Flags**: `redflag_id`, `name`, `urgency`

**Actions**: `action_id`, `name`, `category`, `notes`

**Guides**: `guide_id`, `title`, `filename`, `category`, `description`

**Labs**: `lab_id`, `name`

**Specialists**: `specialist_id`, `name`

**Medications**: `med_id`, `name`, `category`, `notes`

**Intake Questions**: `question_id`, `section`, `question_text`, `question_type`, `required`, `tier`, `maps_to`, `notes`

## Memory Store Adapter

### Purpose

Provides in-memory key-value storage with TTL support for sessions, caching, and temporary data.

### Initialization

```python
from api.adapters import get_memory_store

# Basic (in-memory only)
mem = get_memory_store()

# With persistence
mem = get_memory_store(persist_path="data/memory_store.pkl")
```

### API Methods

#### Basic Operations
```python
# Set value
mem.set("key", value, ttl=3600, namespace="default")

# Get value
value = mem.get("key", namespace="default", default=None)

# Delete
mem.delete("key", namespace="default")

# Check existence
exists = mem.exists("key", namespace="default")

# Get TTL
remaining = mem.get_ttl("key", namespace="default")  # Returns seconds or None
```

#### Bulk Operations
```python
# Get multiple keys
values = mem.get_multi(["key1", "key2", "key3"], namespace="default")

# Set multiple keys
mem.set_multi({"key1": "val1", "key2": "val2"}, ttl=1800, namespace="default")
```

#### Numeric Operations
```python
# Atomic increment
new_value = mem.increment("counter", amount=1, namespace="default")
```

#### Key Management
```python
# List keys with pattern
keys = mem.keys("patient:*", namespace="default")

# Clear namespace
mem.clear(namespace="clinic_a")

# Clear all
mem.clear()
```

#### Statistics
```python
stats = mem.stats()
# Returns: {total_keys, keys_with_ttl, namespaces, persist_enabled}
```

### Namespaces

Use namespaces for multi-tenancy or logical separation:

```python
# Store in different clinics
mem.set("patient:123", data, namespace="clinic_a")
mem.set("patient:123", data, namespace="clinic_b")

# Sessions namespace
mem.set("session:abc", data, namespace="sessions")

# Cache namespace
mem.set("differential:fever:cough", data, namespace="cache")
```

### Common Patterns

#### Session Management
```python
# Create session with 30-min TTL
mem.set(
    f"session:{token}", 
    {"user_id": "clinician_1", "started_at": "2025-12-17T10:00:00"},
    ttl=1800,
    namespace="sessions"
)

# Check if valid
if mem.exists(f"session:{token}", namespace="sessions"):
    session = mem.get(f"session:{token}", namespace="sessions")
```

#### Caching
```python
def get_data_with_cache(key):
    # Check cache
    cached = mem.get(key, namespace="cache")
    if cached:
        return cached
    
    # Calculate
    data = expensive_operation()
    
    # Cache for 5 minutes
    mem.set(key, data, ttl=300, namespace="cache")
    return data
```

#### Rate Limiting
```python
def check_rate_limit(user_id):
    key = f"rate_limit:{user_id}"
    count = mem.get(key, namespace="limits", default=0)
    
    if count >= 100:
        return False
    
    mem.increment(key, namespace="limits")
    
    # Set TTL on first request
    if count == 0:
        mem.set(key, 1, ttl=3600, namespace="limits")
    
    return True
```

## File Structure

```
backend/
├── adapters/
│   ├── __init__.py              # Package exports
│   ├── knowledge_base.py        # Knowledge base adapter
│   ├── memory_store.py          # Memory store adapter
│   ├── examples.py              # Usage examples
│   └── README.md                # This file
```

## Environment Variables

```bash
# Neo4j Configuration
NEO4J_URI=neo4j+s://your-instance.databases.neo4j.io
NEO4J_USERNAME=neo4j
NEO4J_PASSWORD=your_password
NEO4J_DATABASE=neo4j

# Optional: Memory persistence
MEMORY_STORE_PERSIST_PATH=data/memory_store.pkl
```

## Testing

```python
import pytest
from api.adapters import (
    get_knowledge_base_adapter, 
    reset_knowledge_base_adapter,
    get_memory_store,
    reset_memory_store
)

@pytest.fixture
def kb():
    reset_knowledge_base_adapter()
    kb = get_knowledge_base_adapter(
        excel_path="tests/fixtures/test_knowledge_pack.xlsx",
        use_neo4j=False
    )
    yield kb
    kb.close()

@pytest.fixture
def mem():
    reset_memory_store()
    mem = get_memory_store()
    yield mem
    mem.clear()

def test_get_conditions(kb):
    conditions = kb.get_conditions()
    assert len(conditions) > 0
    assert "condition_id" in conditions.columns

def test_memory_ttl(mem):
    mem.set("test", "value", ttl=1)
    assert mem.exists("test")
    time.sleep(2)
    assert not mem.exists("test")
```

## Migration Path

### From Excel to Neo4j

1. Upload data to Neo4j using provided scripts
2. Change initialization:
   ```python
   # Before
   kb = get_knowledge_base_adapter(excel_path="...", use_neo4j=False)
   
   # After
   kb = get_knowledge_base_adapter(use_neo4j=True)
   ```
3. No other code changes required!
4. Optionally use graph query methods for enhanced functionality

### From Mock Memory to MemVerge

1. Implement MemVerge connector with same interface
2. Update factory function to use MemVerge
3. No application code changes required

## Performance Notes

- **Excel Mode**: Fast for small datasets, loads all data into memory
- **Neo4j Mode**: Scalable, lazy loading, leverages graph relationships
- **Memory Store**: O(1) operations, thread-safe, optional persistence
- **Caching**: Use memory store to cache expensive Neo4j queries

## Best Practices

1. **Always use factory functions** (`get_knowledge_base_adapter`, `get_memory_store`)
2. **Use namespaces** to organize memory store data
3. **Set appropriate TTLs** for session and cache data
4. **Close connections** in production (handled by singleton destructor)
5. **Use graph queries** in Neo4j mode for complex relationship traversal
6. **Cache frequently accessed data** in memory store
7. **Test with both modes** to ensure compatibility

## Support

For questions or issues, contact the development team.