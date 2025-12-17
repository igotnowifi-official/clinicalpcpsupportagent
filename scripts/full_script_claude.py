"""
© 2025 igotnowifi, LLC
Proprietary and confidential.

Complete Neo4j Data Upload Script
- Loads all nodes from Excel sheets
- Creates all relationships
- Handles constraints and indexes
"""

import pandas as pd
import hashlib
import os
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv
import time

load_dotenv()

# -------------------------
# CONFIG
# -------------------------
EXCEL_PATH = "data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx"
CSV_OUT_DIR = Path("neo4j_csv")

NEO4J_URI = "neo4j+s://4d2a70ea.databases.neo4j.io"
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = "neo4j"

CSV_OUT_DIR.mkdir(exist_ok=True)

# -------------------------
# HELPERS
# -------------------------
def stable_id(sheet: str, row: dict) -> str:
    """Deterministic ID so reruns don't create duplicates"""
    raw = f"{sheet}|" + "|".join(f"{k}:{v}" for k, v in sorted(row.items()))
    return hashlib.sha256(raw.encode()).hexdigest()

def get_primary_key(sheet: str, df: pd.DataFrame) -> str:
    """Determine primary key column for a sheet"""
    candidate = f"{sheet}_id"
    return candidate if candidate in df.columns else "id"

def print_section(title):
    """Print formatted section header"""
    print("\n" + "="*70)
    print(f"  {title}")
    print("="*70)

# -------------------------
# STEP 1: LOAD EXCEL DATA
# -------------------------
print_section("STEP 1: LOADING EXCEL DATA")

print(f"Loading from: {EXCEL_PATH}")
xls = pd.ExcelFile(EXCEL_PATH)

sheet_data = {}
for sheet in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet).fillna("")
    pk = get_primary_key(sheet, df)
    
    if pk not in df.columns:
        df["id"] = [stable_id(sheet, row.to_dict()) for _, row in df.iterrows()]
    
    csv_path = CSV_OUT_DIR / f"{sheet}.csv"
    df.to_csv(csv_path, index=False)
    sheet_data[sheet] = df
    
    print(f"  ✓ {sheet}: {len(df)} rows → {csv_path}")

print(f"\n✅ Loaded {len(sheet_data)} sheets")

# -------------------------
# NEO4J CONNECTION
# -------------------------
print_section("CONNECTING TO NEO4J")

driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

print(f"  URI: {NEO4J_URI}")
print(f"  Database: {NEO4J_DATABASE}")
print(f"  User: {NEO4J_USER}")

try:
    with driver.session(database=NEO4J_DATABASE) as session:
        result = session.run("RETURN 1 as test")
        result.single()
        print("  ✓ Connection successful")
except Exception as e:
    print(f"  ✗ Connection failed: {e}")
    exit(1)

# -------------------------
# STEP 2: CREATE CONSTRAINTS
# -------------------------
print_section("STEP 2: CREATING CONSTRAINTS")

def create_constraint(tx, label, key):
    try:
        tx.run(f"""
            CREATE CONSTRAINT IF NOT EXISTS
            FOR (n:{label})
            REQUIRE n.{key} IS UNIQUE
        """)
    except Exception as e:
        print(f"    ⚠️  Could not create constraint for {label}.{key}: {e}")

with driver.session(database=NEO4J_DATABASE) as session:
    for sheet, df in sheet_data.items():
        label = sheet.replace(" ", "_").title()
        pk = get_primary_key(sheet, df)
        
        print(f"  Creating constraint for :{label}({pk})")
        session.execute_write(create_constraint, label, pk)

print("  ✓ Constraints created")

# -------------------------
# STEP 3: LOAD NODES
# -------------------------
print_section("STEP 3: LOADING NODES")

def ingest_sheet(tx, sheet, df, pk):
    label = sheet.replace(" ", "_").title()
    count = 0
    
    for _, row in df.iterrows():
        props = row.to_dict()
        
        tx.run(f"""
            MERGE (n:{label} {{ {pk}: $pk }})
            SET n += $props
        """,
        pk=props[pk],
        props=props
        )
        count += 1
    
    return count

with driver.session(database=NEO4J_DATABASE) as session:
    total_nodes = 0
    
    for sheet, df in sheet_data.items():
        label = sheet.replace(" ", "_").title()
        pk = get_primary_key(sheet, df)
        
        print(f"  Loading {sheet} → :{label}")
        start_time = time.time()
        
        count = session.execute_write(ingest_sheet, sheet, df, pk)
        
        elapsed = time.time() - start_time
        total_nodes += count
        print(f"    ✓ {count} nodes in {elapsed:.2f}s")

print(f"\n✅ Loaded {total_nodes} total nodes")

# -------------------------
# STEP 4: CREATE RELATIONSHIPS
# -------------------------
print_section("STEP 4: CREATING RELATIONSHIPS")

def create_condition_symptom_relationships(tx, df):
    """Conditions → Symptoms"""
    count = 0
    for _, row in df.iterrows():
        if row.get('condition_id') and row.get('symptom_id'):
            tx.run("""
                MATCH (c:Conditions {condition_id: $condition_id})
                MATCH (s:Symptoms {symptom_id: $symptom_id})
                MERGE (c)-[r:HAS_SYMPTOM]->(s)
                SET r.prevalence = $prevalence,
                    r.severity = $severity
            """,
            condition_id=str(row['condition_id']),
            symptom_id=str(row['symptom_id']),
            prevalence=str(row.get('prevalence', '')),
            severity=str(row.get('severity', ''))
            )
            count += 1
    return count

def create_condition_red_flag_relationships(tx, df):
    """Conditions → Red Flags"""
    count = 0
    for _, row in df.iterrows():
        if row.get('condition_id') and row.get('red_flag_id'):
            tx.run("""
                MATCH (c:Conditions {condition_id: $condition_id})
                MATCH (r:Red_Flags {red_flag_id: $red_flag_id})
                MERGE (c)-[rel:HAS_RED_FLAG]->(r)
                SET rel.urgency = $urgency
            """,
            condition_id=str(row['condition_id']),
            red_flag_id=str(row['red_flag_id']),
            urgency=str(row.get('urgency', ''))
            )
            count += 1
    return count

def create_condition_action_relationships(tx, df):
    """Conditions → Clinical Actions"""
    count = 0
    for _, row in df.iterrows():
        if row.get('condition_id') and row.get('action_id'):
            tx.run("""
                MATCH (c:Conditions {condition_id: $condition_id})
                MATCH (a:Clinical_Actions {action_id: $action_id})
                MERGE (c)-[r:REQUIRES_ACTION]->(a)
                SET r.priority = $priority,
                    r.timing = $timing
            """,
            condition_id=str(row['condition_id']),
            action_id=str(row['action_id']),
            priority=str(row.get('priority', '')),
            timing=str(row.get('timing', ''))
            )
            count += 1
    return count

def create_condition_support_relationships(tx, df):
    """Conditions → Support Resources"""
    count = 0
    for _, row in df.iterrows():
        if row.get('condition_id') and row.get('support_id'):
            tx.run("""
                MATCH (c:Conditions {condition_id: $condition_id})
                MATCH (s:Support_Resources {support_id: $support_id})
                MERGE (c)-[r:HAS_SUPPORT]->(s)
                SET r.recommendation_strength = $strength
            """,
            condition_id=str(row['condition_id']),
            support_id=str(row['support_id']),
            strength=str(row.get('recommendation_strength', ''))
            )
            count += 1
    return count

def create_intake_branch_relationships(tx, df):
    """Intake Questions → Next Questions (branching)"""
    count = 0
    for _, row in df.iterrows():
        if row.get('question_id') and row.get('next_question_id'):
            tx.run("""
                MATCH (q1:Intake_Questionnaire {question_id: $q_id})
                MATCH (q2:Intake_Questionnaire {question_id: $next_q_id})
                MERGE (q1)-[r:BRANCHES_TO]->(q2)
                SET r.trigger_answer = $trigger,
                    r.action_type = $action_type
            """,
            q_id=str(row['question_id']),
            next_q_id=str(row['next_question_id']),
            trigger=str(row.get('trigger_answer', '')),
            action_type=str(row.get('action_type', ''))
            )
            count += 1
    return count

def create_symptom_mapping_relationships(tx, df):
    """Intake Questions → Symptoms"""
    count = 0
    for _, row in df.iterrows():
        if row.get('question_id') and row.get('symptom_id'):
            tx.run("""
                MATCH (q:Intake_Questionnaire {question_id: $q_id})
                MATCH (s:Symptoms {symptom_id: $symptom_id})
                MERGE (q)-[r:MAPS_TO_SYMPTOM]->(s)
                SET r.mapping_strength = $strength
            """,
            q_id=str(row['question_id']),
            symptom_id=str(row['symptom_id']),
            strength=str(row.get('mapping_strength', ''))
            )
            count += 1
    return count

def create_medication_condition_relationships(tx, df):
    """Medication Categories → Conditions"""
    count = 0
    for _, row in df.iterrows():
        if row.get('medication_category_id') and row.get('condition_id'):
            tx.run("""
                MATCH (m:Medication_Categories {medication_category_id: $med_id})
                MATCH (c:Conditions {condition_id: $condition_id})
                MERGE (m)-[r:TREATS]->(c)
                SET r.indication_strength = $strength
            """,
            med_id=str(row['medication_category_id']),
            condition_id=str(row['condition_id']),
            strength=str(row.get('indication_strength', ''))
            )
            count += 1
    return count

def create_guide_condition_relationships(tx, df):
    """Patient Guides → Conditions"""
    count = 0
    for _, row in df.iterrows():
        if row.get('guide_id') and row.get('condition_id'):
            tx.run("""
                MATCH (g:Patient_Guides {guide_id: $guide_id})
                MATCH (c:Conditions {condition_id: $condition_id})
                MERGE (g)-[r:GUIDES_FOR]->(c)
                SET r.relevance = $relevance
            """,
            guide_id=str(row['guide_id']),
            condition_id=str(row['condition_id']),
            relevance=str(row.get('relevance', ''))
            )
            count += 1
    return count

def create_action_ui_mapping_relationships(tx, df):
    """Assistant Actions → UI Components"""
    count = 0
    for _, row in df.iterrows():
        if row.get('action_id') and row.get('ui_component_id'):
            tx.run("""
                MATCH (a:Clinical_Actions {action_id: $action_id})
                CREATE (u:UI_Component {
                    ui_component_id: $ui_id,
                    display_priority: $priority
                })
                MERGE (a)-[r:DISPLAYS_AS]->(u)
            """,
            action_id=str(row['action_id']),
            ui_id=str(row.get('ui_component_id', '')),
            priority=str(row.get('display_priority', ''))
            )
            count += 1
    return count

def create_telehealth_symptom_relationships(tx, df):
    """Telehealth Questions → Symptoms"""
    count = 0
    for _, row in df.iterrows():
        if row.get('question_id') and row.get('symptom_id'):
            tx.run("""
                MATCH (q:Telehealth_Questionnaire {question_id: $q_id})
                MATCH (s:Symptoms {symptom_id: $symptom_id})
                MERGE (q)-[r:ASSESSES]->(s)
            """,
            q_id=str(row['question_id']),
            symptom_id=str(row['symptom_id'])
            )
            count += 1
    return count

# Relationship mapping configuration
relationship_mappings = [
    {
        'sheet': 'condition_symptoms',
        'function': create_condition_symptom_relationships,
        'description': 'Condition → Symptom',
        'rel_type': 'HAS_SYMPTOM'
    },
    {
        'sheet': 'condition_red_flags',
        'function': create_condition_red_flag_relationships,
        'description': 'Condition → Red Flag',
        'rel_type': 'HAS_RED_FLAG'
    },
    {
        'sheet': 'condition_actions',
        'function': create_condition_action_relationships,
        'description': 'Condition → Clinical Action',
        'rel_type': 'REQUIRES_ACTION'
    },
    {
        'sheet': 'condition_supports',
        'function': create_condition_support_relationships,
        'description': 'Condition → Support Resource',
        'rel_type': 'HAS_SUPPORT'
    },
    {
        'sheet': 'intake_branch_rules',
        'function': create_intake_branch_relationships,
        'description': 'Intake Question → Next Question',
        'rel_type': 'BRANCHES_TO'
    },
    {
        'sheet': 'intake_q_symptom_map',
        'function': create_symptom_mapping_relationships,
        'description': 'Intake Question → Symptom',
        'rel_type': 'MAPS_TO_SYMPTOM'
    },
    {
        'sheet': 'medication_condition_map',
        'function': create_medication_condition_relationships,
        'description': 'Medication Category → Condition',
        'rel_type': 'TREATS'
    },
    {
        'sheet': 'guide_condition_map',
        'function': create_guide_condition_relationships,
        'description': 'Patient Guide → Condition',
        'rel_type': 'GUIDES_FOR'
    },
    {
        'sheet': 'assistant_action_ui_map',
        'function': create_action_ui_mapping_relationships,
        'description': 'Assistant Action → UI Component',
        'rel_type': 'DISPLAYS_AS'
    },
    {
        'sheet': 'telehealth_symptom_map',
        'function': create_telehealth_symptom_relationships,
        'description': 'Telehealth Question → Symptom',
        'rel_type': 'ASSESSES'
    }
]

total_relationships = 0

with driver.session(database=NEO4J_DATABASE) as session:
    for mapping in relationship_mappings:
        sheet_name = mapping['sheet']
        
        if sheet_name not in sheet_data:
            print(f"  ⚠️  Sheet '{sheet_name}' not found, skipping {mapping['description']}")
            continue
        
        df = sheet_data[sheet_name]
        if df.empty:
            print(f"  ⚠️  Sheet '{sheet_name}' is empty, skipping {mapping['description']}")
            continue
        
        print(f"  Creating {mapping['rel_type']} relationships")
        print(f"    {mapping['description']} (sheet: {sheet_name})")
        
        start_time = time.time()
        
        try:
            count = session.execute_write(mapping['function'], df)
            elapsed = time.time() - start_time
            total_relationships += count
            print(f"    ✓ {count} relationships in {elapsed:.2f}s\n")
        except Exception as e:
            print(f"    ✗ Error: {str(e)}\n")

print(f"✅ Created {total_relationships} total relationships")

# -------------------------
# STEP 5: VERIFICATION
# -------------------------
print_section("STEP 5: VERIFICATION")

def get_stats(tx):
    """Get database statistics"""
    stats = {}
    
    # Count nodes
    result = tx.run("MATCH (n) RETURN count(n) as count")
    stats['nodes'] = result.single()['count']
    
    # Count relationships
    result = tx.run("MATCH ()-[r]->() RETURN count(r) as count")
    stats['relationships'] = result.single()['count']
    
    # Count node labels
    result = tx.run("CALL db.labels() YIELD label RETURN label")
    stats['labels'] = [record['label'] for record in result]
    
    # Count relationship types
    result = tx.run("CALL db.relationshipTypes() YIELD relationshipType RETURN relationshipType")
    stats['rel_types'] = [record['relationshipType'] for record in result]
    
    return stats

with driver.session(database=NEO4J_DATABASE) as session:
    stats = session.execute_read(get_stats)
    
    print(f"  Total Nodes: {stats['nodes']:,}")
    print(f"  Total Relationships: {stats['relationships']:,}")
    print(f"\n  Node Labels ({len(stats['labels'])}):")
    for label in sorted(stats['labels']):
        print(f"    • {label}")
    
    print(f"\n  Relationship Types ({len(stats['rel_types'])}):")
    for rel_type in sorted(stats['rel_types']):
        print(f"    • {rel_type}")

# -------------------------
# CLEANUP
# -------------------------
driver.close()

# -------------------------
# FINAL SUMMARY
# -------------------------
print_section("✅ UPLOAD COMPLETE")

print(f"""
Summary:
  • Loaded {len(sheet_data)} sheets from Excel
  • Created {total_nodes:,} nodes
  • Created {total_relationships:,} relationships
  • Database: {NEO4J_DATABASE}

Next Steps:
  1. Verify data in Neo4j Browser: {NEO4J_URI.replace('+s', '')}
  2. Run sample queries:
     
     // View condition-symptom relationships
     MATCH (c:Conditions)-[r:HAS_SYMPTOM]->(s:Symptoms)
     RETURN c.condition_name, r.prevalence, s.symptom_name
     LIMIT 25
     
     // View intake branching logic
     MATCH (q1:Intake_Questionnaire)-[r:BRANCHES_TO]->(q2)
     RETURN q1.question_text, r.trigger_answer, q2.question_text
     LIMIT 25
     
     // View all relationship types
     MATCH (n)-[r]->(m)
     RETURN DISTINCT type(r), count(r) as count
     ORDER BY count DESC

  3. Start building your application!
""")

print("="*70)