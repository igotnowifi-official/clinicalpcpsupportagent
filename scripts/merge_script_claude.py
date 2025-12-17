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

def create_supports_relationships(tx, df):
    """Symptom/Vital → Condition (edges_supports)"""
    count = 0
    for _, row in df.iterrows():
        from_type = str(row.get('from_type', '')).strip()
        from_id = str(row.get('from_id', '')).strip()
        condition_id = str(row.get('condition_id', '')).strip()
        
        if not from_id or not condition_id:
            continue
        
        # Determine source node label based on from_type
        if from_type.lower() == 'symptom':
            source_label = 'Nodes_Symptom'
            source_pk = 'symptom_id'
        elif from_type.lower() == 'vital':
            source_label = 'Nodes_Vital_Rule'
            source_pk = 'rule_id'
        else:
            continue
        
        tx.run(f"""
            MATCH (s:{source_label} {{{source_pk}: $from_id}})
            MATCH (c:Nodes_Condition {{condition_id: $condition_id}})
            MERGE (s)-[r:SUPPORTS]->(c)
            SET r.weight = $weight,
                r.notes = $notes
        """,
        from_id=from_id,
        condition_id=condition_id,
        weight=str(row.get('weight', '')),
        notes=str(row.get('notes', ''))
        )
        count += 1
    return count

def create_triggers_relationships(tx, df):
    """Symptom → RedFlag (edges_triggers)"""
    count = 0
    for _, row in df.iterrows():
        from_id = str(row.get('from_id', '')).strip()
        redflag_id = str(row.get('redflag_id', '')).strip()
        
        if not from_id or not redflag_id:
            continue
        
        tx.run("""
            MATCH (s:Nodes_Symptom {symptom_id: $from_id})
            MATCH (r:Nodes_Redflag {redflag_id: $redflag_id})
            MERGE (s)-[rel:TRIGGERS]->(r)
            SET rel.notes = $notes
        """,
        from_id=from_id,
        redflag_id=redflag_id,
        notes=str(row.get('notes', ''))
        )
        count += 1
    return count

def create_labs_relationships(tx, df):
    """Condition → Lab (edges_labs)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        lab_id = str(row.get('lab_id', '')).strip()
        
        if not condition_id or not lab_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (l:Nodes_Lab {lab_id: $lab_id})
            MERGE (c)-[r:REQUIRES_LAB]->(l)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        lab_id=lab_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_referrals_relationships(tx, df):
    """Condition → Specialist (edges_referrals)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        specialist_id = str(row.get('specialist_id', '')).strip()
        
        if not condition_id or not specialist_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (s:Nodes_Specialist {specialist_id: $specialist_id})
            MERGE (c)-[r:REFERS_TO]->(s)
            SET r.urgency = $urgency,
                r.reason = $reason
        """,
        condition_id=condition_id,
        specialist_id=specialist_id,
        urgency=str(row.get('urgency', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_meds_relationships(tx, df):
    """Condition → Medication (edges_meds)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        med_id = str(row.get('med_id', '')).strip()
        
        if not condition_id or not med_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (m:Nodes_Medication_Option {med_id: $med_id})
            MERGE (c)-[r:TREATED_BY]->(m)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        med_id=med_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_actions_condition_relationships(tx, df):
    """Condition → Action (edges_actions_condition)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        action_id = str(row.get('action_id', '')).strip()
        
        if not condition_id or not action_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (a:Nodes_Action_Recommendation {action_id: $action_id})
            MERGE (c)-[r:REQUIRES_ACTION]->(a)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        action_id=action_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_actions_redflag_relationships(tx, df):
    """RedFlag → Action (edges_actions_redflag)"""
    count = 0
    for _, row in df.iterrows():
        redflag_id = str(row.get('redflag_id', '')).strip()
        action_id = str(row.get('action_id', '')).strip()
        
        if not redflag_id or not action_id:
            continue
        
        tx.run("""
            MATCH (r:Nodes_Redflag {redflag_id: $redflag_id})
            MATCH (a:Nodes_Action_Recommendation {action_id: $action_id})
            MERGE (r)-[rel:REQUIRES_ACTION]->(a)
            SET rel.priority = $priority,
                rel.reason = $reason
        """,
        redflag_id=redflag_id,
        action_id=action_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_redflag_labs_relationships(tx, df):
    """RedFlag → Lab (edges_redflag_labs)"""
    count = 0
    for _, row in df.iterrows():
        redflag_id = str(row.get('redflag_id', '')).strip()
        lab_id = str(row.get('lab_id', '')).strip()
        
        if not redflag_id or not lab_id:
            continue
        
        tx.run("""
            MATCH (r:Nodes_Redflag {redflag_id: $redflag_id})
            MATCH (l:Nodes_Lab {lab_id: $lab_id})
            MERGE (r)-[rel:REQUIRES_LAB]->(l)
            SET rel.priority = $priority,
                rel.reason = $reason
        """,
        redflag_id=redflag_id,
        lab_id=lab_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_redflag_referrals_relationships(tx, df):
    """RedFlag → Specialist (edges_redflag_referrals)"""
    count = 0
    for _, row in df.iterrows():
        redflag_id = str(row.get('redflag_id', '')).strip()
        specialist_id = str(row.get('specialist_id', '')).strip()
        
        if not redflag_id or not specialist_id:
            continue
        
        tx.run("""
            MATCH (r:Nodes_Redflag {redflag_id: $redflag_id})
            MATCH (s:Nodes_Specialist {specialist_id: $specialist_id})
            MERGE (r)-[rel:REFERS_TO]->(s)
            SET rel.urgency = $urgency,
                rel.reason = $reason
        """,
        redflag_id=redflag_id,
        specialist_id=specialist_id,
        urgency=str(row.get('urgency', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_asst_cond_relationships(tx, df):
    """Condition → Assistant Action (edges_asst_cond)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        assistant_action_id = str(row.get('assistant_action_id', '')).strip()
        
        if not condition_id or not assistant_action_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (a:Nodes_Assistant_Action {assistant_action_id: $assistant_action_id})
            MERGE (c)-[r:NEEDS_ASSISTANT_ACTION]->(a)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        assistant_action_id=assistant_action_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_asst_redflag_relationships(tx, df):
    """RedFlag → Assistant Action (edges_asst_redflag)"""
    count = 0
    for _, row in df.iterrows():
        redflag_id = str(row.get('redflag_id', '')).strip()
        assistant_action_id = str(row.get('assistant_action_id', '')).strip()
        
        if not redflag_id or not assistant_action_id:
            continue
        
        tx.run("""
            MATCH (r:Nodes_Redflag {redflag_id: $redflag_id})
            MATCH (a:Nodes_Assistant_Action {assistant_action_id: $assistant_action_id})
            MERGE (r)-[rel:NEEDS_ASSISTANT_ACTION]->(a)
            SET rel.priority = $priority,
                rel.reason = $reason
        """,
        redflag_id=redflag_id,
        assistant_action_id=assistant_action_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_condition_guides_relationships(tx, df):
    """Condition → Guide (edges_condition_guides)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        guide_id = str(row.get('guide_id', '')).strip()
        
        if not condition_id or not guide_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (g:Nodes_Patient_Guide {guide_id: $guide_id})
            MERGE (c)-[r:HAS_GUIDE]->(g)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        guide_id=guide_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_action_guides_relationships(tx, df):
    """Action → Guide (edges_action_guides)"""
    count = 0
    for _, row in df.iterrows():
        action_id = str(row.get('action_id', '')).strip()
        guide_id = str(row.get('guide_id', '')).strip()
        
        if not action_id or not guide_id:
            continue
        
        tx.run("""
            MATCH (a:Nodes_Action_Recommendation {action_id: $action_id})
            MATCH (g:Nodes_Patient_Guide {guide_id: $guide_id})
            MERGE (a)-[r:HAS_GUIDE]->(g)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        action_id=action_id,
        guide_id=guide_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_cond_msg_tmpl_relationships(tx, df):
    """Condition → Message Template (edges_cond_msg_tmpl)"""
    count = 0
    for _, row in df.iterrows():
        condition_id = str(row.get('condition_id', '')).strip()
        template_id = str(row.get('template_id', '')).strip()
        
        if not condition_id or not template_id:
            continue
        
        tx.run("""
            MATCH (c:Nodes_Condition {condition_id: $condition_id})
            MATCH (t:Nodes_Message_Template {template_id: $template_id})
            MERGE (c)-[r:USES_TEMPLATE]->(t)
            SET r.priority = $priority,
                r.reason = $reason
        """,
        condition_id=condition_id,
        template_id=template_id,
        priority=str(row.get('priority', '')),
        reason=str(row.get('reason', ''))
        )
        count += 1
    return count

def create_intake_branch_relationships(tx, df):
    """Intake Question → Next Question (intake_branch_rules)"""
    count = 0
    for _, row in df.iterrows():
        trigger_question_id = str(row.get('trigger_question_id', '')).strip()
        show_question_id = str(row.get('show_question_id', '')).strip()
        
        if not trigger_question_id or not show_question_id:
            continue
        
        tx.run("""
            MATCH (q1:Intake_Questionnaire {question_id: $trigger_id})
            MATCH (q2:Intake_Questionnaire {question_id: $show_id})
            MERGE (q1)-[r:BRANCHES_TO]->(q2)
            SET r.trigger_value = $trigger_value,
                r.rule_type = $rule_type,
                r.notes = $notes
        """,
        trigger_id=trigger_question_id,
        show_id=show_question_id,
        trigger_value=str(row.get('trigger_value', '')),
        rule_type=str(row.get('rule_type', '')),
        notes=str(row.get('notes', ''))
        )
        count += 1
    return count

def create_intake_symptom_map_relationships(tx, df):
    """Intake Question → Symptom (intake_q_symptom_map)"""
    count = 0
    for _, row in df.iterrows():
        question_id = str(row.get('question_id', '')).strip()
        symptom_id = str(row.get('symptom_id', '')).strip()
        
        if not question_id or not symptom_id:
            continue
        
        tx.run("""
            MATCH (q:Intake_Questionnaire {question_id: $question_id})
            MATCH (s:Nodes_Symptom {symptom_id: $symptom_id})
            MERGE (q)-[r:MAPS_TO_SYMPTOM]->(s)
            SET r.weight_modifier = $weight_modifier
        """,
        question_id=question_id,
        symptom_id=symptom_id,
        weight_modifier=str(row.get('weight_modifier', ''))
        )
        count += 1
    return count

def create_assistant_action_ui_relationships(tx, df):
    """Assistant Action → UI Component (assistant_action_ui_map)"""
    count = 0
    for _, row in df.iterrows():
        assistant_action_id = str(row.get('assistant_action_id', '')).strip()
        
        if not assistant_action_id:
            continue
        
        # Create UI component node and link it
        tx.run("""
            MATCH (a:Nodes_Assistant_Action {assistant_action_id: $action_id})
            MERGE (a)-[r:HAS_UI_COMPONENT]->(u:UI_Component {assistant_action_id: $action_id})
            SET u.ui_control = $ui_control,
                u.field_keys = $field_keys,
                u.min_value = $min_value,
                u.max_value = $max_value,
                u.unit_label = $unit_label,
                u.dropdown_options = $dropdown_options,
                u.placeholder_text = $placeholder_text
        """,
        action_id=assistant_action_id,
        ui_control=str(row.get('ui_control', '')),
        field_keys=str(row.get('field_keys', '')),
        min_value=str(row.get('min_value', '')),
        max_value=str(row.get('max_value', '')),
        unit_label=str(row.get('unit_label', '')),
        dropdown_options=str(row.get('dropdown_options', '')),
        placeholder_text=str(row.get('placeholder_text', ''))
        )
        count += 1
    return count

# Relationship mapping configuration
relationship_mappings = [
    {
        'sheet': 'edges_supports',
        'function': create_supports_relationships,
        'description': 'Symptom/Vital → Condition',
        'rel_type': 'SUPPORTS'
    },
    {
        'sheet': 'edges_triggers',
        'function': create_triggers_relationships,
        'description': 'Symptom → RedFlag',
        'rel_type': 'TRIGGERS'
    },
    {
        'sheet': 'edges_labs',
        'function': create_labs_relationships,
        'description': 'Condition → Lab',
        'rel_type': 'REQUIRES_LAB'
    },
    {
        'sheet': 'edges_referrals',
        'function': create_referrals_relationships,
        'description': 'Condition → Specialist',
        'rel_type': 'REFERS_TO'
    },
    {
        'sheet': 'edges_meds',
        'function': create_meds_relationships,
        'description': 'Condition → Medication',
        'rel_type': 'TREATED_BY'
    },
    {
        'sheet': 'edges_actions_condition',
        'function': create_actions_condition_relationships,
        'description': 'Condition → Action',
        'rel_type': 'REQUIRES_ACTION'
    },
    {
        'sheet': 'edges_actions_redflag',
        'function': create_actions_redflag_relationships,
        'description': 'RedFlag → Action',
        'rel_type': 'REQUIRES_ACTION'
    },
    {
        'sheet': 'edges_redflag_labs',
        'function': create_redflag_labs_relationships,
        'description': 'RedFlag → Lab',
        'rel_type': 'REQUIRES_LAB'
    },
    {
        'sheet': 'edges_redflag_referrals',
        'function': create_redflag_referrals_relationships,
        'description': 'RedFlag → Specialist',
        'rel_type': 'REFERS_TO'
    },
    {
        'sheet': 'edges_asst_cond',
        'function': create_asst_cond_relationships,
        'description': 'Condition → Assistant Action',
        'rel_type': 'NEEDS_ASSISTANT_ACTION'
    },
    {
        'sheet': 'edges_asst_redflag',
        'function': create_asst_redflag_relationships,
        'description': 'RedFlag → Assistant Action',
        'rel_type': 'NEEDS_ASSISTANT_ACTION'
    },
    {
        'sheet': 'edges_condition_guides',
        'function': create_condition_guides_relationships,
        'description': 'Condition → Guide',
        'rel_type': 'HAS_GUIDE'
    },
    {
        'sheet': 'edges_action_guides',
        'function': create_action_guides_relationships,
        'description': 'Action → Guide',
        'rel_type': 'HAS_GUIDE'
    },
    {
        'sheet': 'edges_cond_msg_tmpl',
        'function': create_cond_msg_tmpl_relationships,
        'description': 'Condition → Message Template',
        'rel_type': 'USES_TEMPLATE'
    },
    {
        'sheet': 'intake_branch_rules',
        'function': create_intake_branch_relationships,
        'description': 'Intake Question → Next Question',
        'rel_type': 'BRANCHES_TO'
    },
    {
        'sheet': 'intake_q_symptom_map',
        'function': create_intake_symptom_map_relationships,
        'description': 'Intake Question → Symptom',
        'rel_type': 'MAPS_TO_SYMPTOM'
    },
    {
        'sheet': 'assistant_action_ui_map',
        'function': create_assistant_action_ui_relationships,
        'description': 'Assistant Action → UI Component',
        'rel_type': 'HAS_UI_COMPONENT'
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
     
     // View symptom-condition relationships
     MATCH (s:Nodes_Symptom)-[r:SUPPORTS]->(c:Nodes_Condition)
     RETURN s.name, r.weight, c.name
     LIMIT 25
     
     // View condition treatment plan
     MATCH (c:Nodes_Condition {{condition_id: 'posture_related_headache'}})
     OPTIONAL MATCH (c)-[:REQUIRES_LAB]->(l:Nodes_Lab)
     OPTIONAL MATCH (c)-[:TREATED_BY]->(m:Nodes_Medication_Option)
     OPTIONAL MATCH (c)-[:REQUIRES_ACTION]->(a:Nodes_Action_Recommendation)
     OPTIONAL MATCH (c)-[:HAS_GUIDE]->(g:Nodes_Patient_Guide)
     RETURN c.name, collect(DISTINCT l.name) as labs, 
            collect(DISTINCT m.name) as meds,
            collect(DISTINCT a.name) as actions,
            collect(DISTINCT g.title) as guides
     
     // View red flag triggers
     MATCH (s:Nodes_Symptom)-[r:TRIGGERS]->(rf:Nodes_Redflag)
     RETURN s.name, rf.name, rf.urgency
     
     // View intake question branching
     MATCH (q1:Intake_Questionnaire)-[r:BRANCHES_TO]->(q2)
     RETURN q1.question_text, r.trigger_value, q2.question_text
     LIMIT 10
     
     // Count all relationship types
     MATCH ()-[r]->()
     RETURN type(r) as relationship_type, count(r) as count
     ORDER BY count DESC

  3. Start building your application!
""")

print("="*70)