"""
© 2025 igotnowifi, LLC
Proprietary and confidential.

Example usage of KnowledgeBaseAdapter and MockMemoryStore
"""

from api.adapters.knowledge_base import get_knowledge_base_adapter, reset_knowledge_base_adapter
from api.adapters.memory_store import get_memory_store, reset_memory_store


# =============================================================================
# EXAMPLE 1: Knowledge Base Adapter - Excel Mode (Development)
# =============================================================================

def example_excel_mode():
    """Example using Excel file for development"""
    print("="*70)
    print("EXAMPLE 1: Knowledge Base Adapter - Excel Mode")
    print("="*70)
    
    # Initialize with Excel file
    kb = get_knowledge_base_adapter(
        excel_path="data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx",
        use_neo4j=False
    )
    
    # Get intake questionnaire
    intake_q = kb.get_intake_questionnaire(mode="full")
    print(f"\nIntake questionnaire: {len(intake_q)} questions")
    print(intake_q.head())
    
    # Get conditions
    conditions = kb.get_conditions()
    print(f"\nConditions: {len(conditions)} total")
    print(conditions[['condition_id', 'name', 'severity']].head())
    
    # Get symptoms
    symptoms = kb.get_symptoms()
    print(f"\nSymptoms: {len(symptoms)} total")
    print(symptoms[['symptom_id', 'name', 'category']].head())
    
    # Get branching rules
    branches = kb.get_branch_rules()
    print(f"\nBranch rules: {len(branches)} total")
    print(branches.head())


# =============================================================================
# EXAMPLE 2: Knowledge Base Adapter - Neo4j Mode (Production)
# =============================================================================

def example_neo4j_mode():
    """Example using Neo4j graph database"""
    print("\n" + "="*70)
    print("EXAMPLE 2: Knowledge Base Adapter - Neo4j Mode")
    print("="*70)
    
    # Reset singleton for this example
    reset_knowledge_base_adapter()
    
    # Initialize with Neo4j
    kb = get_knowledge_base_adapter(
        use_neo4j=True,
        neo4j_uri="neo4j+s://4d2a70ea.databases.neo4j.io",
        neo4j_user="neo4j",
        neo4j_password="your_password",  # Use env var in production
        neo4j_database="neo4j"
    )
    
    # Same interface as Excel mode!
    conditions = kb.get_conditions()
    print(f"\nConditions from Neo4j: {len(conditions)} total")
    
    # But now we can use graph queries!
    if len(conditions) > 0:
        condition_id = conditions.iloc[0]['condition_id']
        print(f"\nQuerying condition: {condition_id}")
        
        # Get full condition with relationships
        full_condition = kb.query_condition_with_relationships(condition_id)
        
        print(f"\nCondition: {full_condition['condition']['name']}")
        print(f"  Labs: {len(full_condition['labs'])}")
        print(f"  Medications: {len(full_condition['medications'])}")
        print(f"  Actions: {len(full_condition['actions'])}")
        print(f"  Guides: {len(full_condition['guides'])}")
        print(f"  Supporting symptoms: {len(full_condition['supporting_symptoms'])}")
        
        # Get symptoms for condition
        symptoms = kb.query_symptoms_for_condition(condition_id)
        print(f"\nSymptoms supporting this condition:")
        for symptom in symptoms[:5]:
            print(f"  - {symptom['name']} (weight: {symptom['weight']})")


# =============================================================================
# EXAMPLE 3: Memory Store - Basic Operations
# =============================================================================

def example_memory_store_basic():
    """Example of basic memory store operations"""
    print("\n" + "="*70)
    print("EXAMPLE 3: Memory Store - Basic Operations")
    print("="*70)
    
    mem = get_memory_store()
    
    # Set and get
    mem.set("patient:123", {"name": "John Doe", "age": 45})
    patient = mem.get("patient:123")
    print(f"\nStored patient: {patient}")
    
    # Set with TTL
    mem.set("session:abc123", {"user_id": "clinician_1", "started_at": "2025-12-17"}, ttl=3600)
    session = mem.get("session:abc123")
    print(f"\nSession (expires in {mem.get_ttl('session:abc123')}s): {session}")
    
    # Increment counter
    mem.set("intake:completed_today", 0)
    mem.increment("intake:completed_today")
    mem.increment("intake:completed_today")
    mem.increment("intake:completed_today")
    count = mem.get("intake:completed_today")
    print(f"\nIntakes completed today: {count}")
    
    # Check existence
    exists = mem.exists("patient:123")
    print(f"\nPatient 123 exists: {exists}")
    
    # Get all keys
    keys = mem.keys("patient:*")
    print(f"\nAll patient keys: {keys}")


# =============================================================================
# EXAMPLE 4: Memory Store - Namespaces
# =============================================================================

def example_memory_store_namespaces():
    """Example using namespaces for multi-tenancy"""
    print("\n" + "="*70)
    print("EXAMPLE 4: Memory Store - Namespaces")
    print("="*70)
    
    mem = get_memory_store()
    
    # Store data in different namespaces (e.g., different clinics)
    mem.set("patient:123", {"name": "John Doe"}, namespace="clinic_a")
    mem.set("patient:123", {"name": "Jane Smith"}, namespace="clinic_b")
    mem.set("patient:456", {"name": "Bob Johnson"}, namespace="clinic_a")
    
    # Retrieve from specific namespaces
    patient_a = mem.get("patient:123", namespace="clinic_a")
    patient_b = mem.get("patient:123", namespace="clinic_b")
    
    print(f"\nClinic A - Patient 123: {patient_a}")
    print(f"Clinic B - Patient 123: {patient_b}")
    
    # Get all patients in clinic A
    keys_a = mem.keys("patient:*", namespace="clinic_a")
    print(f"\nAll patients in Clinic A: {keys_a}")
    
    # Clear a specific namespace
    mem.clear(namespace="clinic_b")
    print(f"\nCleared Clinic B namespace")
    
    # Stats
    stats = mem.stats()
    print(f"\nMemory store stats: {stats}")


# =============================================================================
# EXAMPLE 5: Memory Store - Session Management
# =============================================================================

def example_memory_store_sessions():
    """Example of session management with TTL"""
    print("\n" + "="*70)
    print("EXAMPLE 5: Memory Store - Session Management")
    print("="*70)
    
    mem = get_memory_store()
    
    # Create patient questionnaire session (30 min TTL)
    session_token = "q_abc123xyz"
    session_data = {
        "patient_id": "patient_789",
        "questionnaire_type": "full",
        "started_at": "2025-12-17T10:30:00",
        "answers": {},
        "status": "in_progress"
    }
    mem.set(f"questionnaire_session:{session_token}", session_data, ttl=1800, namespace="sessions")
    
    print(f"\nCreated questionnaire session: {session_token}")
    print(f"TTL: {mem.get_ttl(f'questionnaire_session:{session_token}', namespace='sessions')} seconds")
    
    # Update session with answers
    session = mem.get(f"questionnaire_session:{session_token}", namespace="sessions")
    session["answers"]["chief_concern"] = "Headache for 3 days"
    session["status"] = "answering"
    mem.set(f"questionnaire_session:{session_token}", session, ttl=1800, namespace="sessions")
    
    print(f"\nUpdated session: {session}")
    
    # Check if session still valid
    if mem.exists(f"questionnaire_session:{session_token}", namespace="sessions"):
        print("\nSession is valid")
    else:
        print("\nSession expired or not found")


# =============================================================================
# EXAMPLE 6: Memory Store - Caching Query Results
# =============================================================================

def example_memory_store_caching():
    """Example of caching expensive operations"""
    print("\n" + "="*70)
    print("EXAMPLE 6: Memory Store - Caching Query Results")
    print("="*70)
    
    mem = get_memory_store()
    
    def get_differential_diagnosis(symptoms: list, use_cache: bool = True):
        """Simulate expensive differential diagnosis calculation"""
        cache_key = f"differential:{':'.join(sorted(symptoms))}"
        
        if use_cache:
            # Check cache first
            cached = mem.get(cache_key, namespace="cache")
            if cached:
                print("  → Returning cached result")
                return cached
        
        # Simulate expensive calculation
        print("  → Calculating differential diagnosis...")
        import time
        time.sleep(0.1)  # Simulate work
        
        result = {
            "symptoms": symptoms,
            "top_conditions": [
                {"condition_id": "condition_1", "probability": 0.75},
                {"condition_id": "condition_2", "probability": 0.60},
                {"condition_id": "condition_3", "probability": 0.45}
            ],
            "calculated_at": time.time()
        }
        
        # Cache for 5 minutes
        mem.set(cache_key, result, ttl=300, namespace="cache")
        
        return result
    
    symptoms = ["fever", "cough", "fatigue"]
    
    print(f"\nFirst call (no cache):")
    result1 = get_differential_diagnosis(symptoms)
    print(f"Result: {result1['top_conditions'][0]}")
    
    print(f"\nSecond call (from cache):")
    result2 = get_differential_diagnosis(symptoms)
    print(f"Result: {result2['top_conditions'][0]}")


# =============================================================================
# EXAMPLE 7: Combined Usage - Real Workflow
# =============================================================================

def example_combined_workflow():
    """Example of combined KB + Memory usage in real workflow"""
    print("\n" + "="*70)
    print("EXAMPLE 7: Combined Usage - Real Clinical Workflow")
    print("="*70)
    
    kb = get_knowledge_base_adapter(
        excel_path="data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx",
        use_neo4j=False
    )
    mem = get_memory_store()
    
    # Step 1: Patient checks in
    patient_id = "patient_999"
    case_id = "case_20251217_001"
    
    mem.set(f"case:{case_id}", {
        "patient_id": patient_id,
        "status": "waiting",
        "checked_in_at": "2025-12-17T10:00:00"
    }, namespace="cases")
    
    print(f"\n1. Patient checked in: {case_id}")
    
    # Step 2: Staff issues questionnaire
    questionnaire = kb.get_intake_questionnaire(mode="full")
    session_token = f"q_{case_id}"
    
    mem.set(f"questionnaire:{session_token}", {
        "case_id": case_id,
        "questions": questionnaire.to_dict('records'),
        "answers": {},
        "status": "issued"
    }, ttl=3600, namespace="sessions")
    
    print(f"2. Questionnaire issued: {len(questionnaire)} questions")
    
    # Step 3: Patient completes questionnaire
    session = mem.get(f"questionnaire:{session_token}", namespace="sessions")
    session["answers"] = {
        "chief_concern": "Headache",
        "sym_headache": True,
        "sym_fever": False,
        "duration": "3 days"
    }
    session["status"] = "completed"
    mem.set(f"questionnaire:{session_token}", session, namespace="sessions")
    
    print(f"3. Questionnaire completed")
    
    # Step 4: Map symptoms and get conditions
    symptom_map = kb.get_symptom_map()
    answered_symptoms = [k for k, v in session["answers"].items() if k.startswith("sym_") and v]
    
    print(f"4. Identified symptoms: {answered_symptoms}")
    
    # Step 5: Store case data for clinician review
    case_data = mem.get(f"case:{case_id}", namespace="cases")
    case_data["questionnaire_answers"] = session["answers"]
    case_data["status"] = "ready_for_review"
    mem.set(f"case:{case_id}", case_data, namespace="cases")
    
    print(f"5. Case ready for clinician review")
    
    # Step 6: Clinician retrieves case
    clinician_case = mem.get(f"case:{case_id}", namespace="cases")
    print(f"\n6. Clinician reviewing case:")
    print(f"   Chief concern: {clinician_case['questionnaire_answers']['chief_concern']}")
    print(f"   Status: {clinician_case['status']}")


# =============================================================================
# RUN EXAMPLES
# =============================================================================

if __name__ == "__main__":
    # Run Excel mode example
    example_excel_mode()
    
    # Uncomment to run Neo4j example (requires valid credentials)
    # example_neo4j_mode()
    
    # Run memory store examples
    example_memory_store_basic()
    example_memory_store_namespaces()
    example_memory_store_sessions()
    example_memory_store_caching()
    
    # Run combined workflow
    example_combined_workflow()
    
    print("\n" + "="*70)
    print("All examples completed!")
    print("="*70)