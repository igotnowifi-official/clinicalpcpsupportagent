"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import pandas as pd
import os
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# CONFIG
# -------------------------
EXCEL_PATH = "data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx"

NEO4J_URI = "neo4j+s://4d2a70ea.databases.neo4j.io"
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = "neo4j"

# -------------------------
# LOAD EXCEL DATA
# -------------------------
print("Loading Excel data...")
xls = pd.ExcelFile(EXCEL_PATH)

sheets = {}
for sheet_name in xls.sheet_names:
    sheets[sheet_name] = pd.read_excel(xls, sheet_name=sheet_name).fillna("")
    print(f"  ✓ Loaded {sheet_name}: {len(sheets[sheet_name])} rows")

# -------------------------
# NEO4J CONNECTION
# -------------------------
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

# -------------------------
# RELATIONSHIP FUNCTIONS
# -------------------------

def create_condition_symptom_relationships(tx, df):
    """
    Link Conditions to Symptoms based on condition_symptoms sheet
    Expected columns: condition_id, symptom_id, prevalence, severity
    """
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

def create_condition_red_flag_relationships(tx, df):
    """
    Link Conditions to Red Flags based on condition_red_flags sheet
    Expected columns: condition_id, red_flag_id, urgency
    """
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

def create_condition_action_relationships(tx, df):
    """
    Link Conditions to Clinical Actions based on condition_actions sheet
    Expected columns: condition_id, action_id, priority, timing
    """
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

def create_condition_support_relationships(tx, df):
    """
    Link Conditions to Support Resources based on condition_supports sheet
    Expected columns: condition_id, support_id, recommendation_strength
    """
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

def create_intake_branch_relationships(tx, df):
    """
    Link intake questions to follow-up questions based on intake_branch_rules
    Expected columns: question_id, trigger_answer, next_question_id, action_type
    """
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

def create_symptom_mapping_relationships(tx, df):
    """
    Link intake questions to symptoms based on intake_q_symptom_map
    Expected columns: question_id, symptom_id, mapping_strength
    """
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

def create_medication_condition_relationships(tx, df):
    """
    Link medication categories to conditions
    Expected columns: medication_category_id, condition_id, indication_strength
    """
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

def create_guide_condition_relationships(tx, df):
    """
    Link patient guides to conditions
    Expected columns: guide_id, condition_id, relevance
    """
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

def create_action_ui_mapping_relationships(tx, df):
    """
    Link assistant actions to UI components
    Expected columns: action_id, ui_component_id, display_priority
    """
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

def create_telehealth_symptom_relationships(tx, df):
    """
    Link telehealth questions to symptoms
    Expected columns: question_id, symptom_id
    """
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

# -------------------------
# EXECUTE RELATIONSHIP CREATION
# -------------------------

relationship_mappings = [
    {
        'sheet': 'condition_symptoms',
        'function': create_condition_symptom_relationships,
        'description': 'Condition → Symptom'
    },
    {
        'sheet': 'condition_red_flags',
        'function': create_condition_red_flag_relationships,
        'description': 'Condition → Red Flag'
    },
    {
        'sheet': 'condition_actions',
        'function': create_condition_action_relationships,
        'description': 'Condition → Clinical Action'
    },
    {
        'sheet': 'condition_supports',
        'function': create_condition_support_relationships,
        'description': 'Condition → Support Resource'
    },
    {
        'sheet': 'intake_branch_rules',
        'function': create_intake_branch_relationships,
        'description': 'Intake Question → Next Question (branching)'
    },
    {
        'sheet': 'intake_q_symptom_map',
        'function': create_symptom_mapping_relationships,
        'description': 'Intake Question → Symptom'
    },
    {
        'sheet': 'medication_condition_map',
        'function': create_medication_condition_relationships,
        'description': 'Medication Category → Condition'
    },
    {
        'sheet': 'guide_condition_map',
        'function': create_guide_condition_relationships,
        'description': 'Patient Guide → Condition'
    },
    {
        'sheet': 'assistant_action_ui_map',
        'function': create_action_ui_mapping_relationships,
        'description': 'Assistant Action → UI Component'
    },
    {
        'sheet': 'telehealth_symptom_map',
        'function': create_telehealth_symptom_relationships,
        'description': 'Telehealth Question → Symptom'
    }
]

print("\n" + "="*60)
print("CREATING RELATIONSHIPS IN NEO4J")
print("="*60 + "\n")

with driver.session(database=NEO4J_DATABASE) as session:
    for mapping in relationship_mappings:
        sheet_name = mapping['sheet']
        
        if sheet_name not in sheets:
            print(f"⚠️  Sheet '{sheet_name}' not found in Excel, skipping {mapping['description']}")
            continue
        
        df = sheets[sheet_name]
        if df.empty:
            print(f"⚠️  Sheet '{sheet_name}' is empty, skipping {mapping['description']}")
            continue
        
        print(f"Creating {mapping['description']} relationships...")
        print(f"   Sheet: {sheet_name} ({len(df)} rows)")
        
        try:
            session.execute_write(mapping['function'], df)
            print(f"   ✓ Successfully created relationships\n")
        except Exception as e:
            print(f"   ✗ Error: {str(e)}\n")

driver.close()

print("="*60)
print("✅ RELATIONSHIP CREATION COMPLETE")
print("="*60)
print("\nYou can verify relationships in Neo4j Browser with queries like:")
print("  MATCH (c:Conditions)-[r]->(s:Symptoms) RETURN c, r, s LIMIT 25")
print("  MATCH (q:Intake_Questionnaire)-[r:BRANCHES_TO]->(q2) RETURN q, r, q2")
print("  MATCH (c:Conditions)-[r:HAS_RED_FLAG]->(rf) RETURN c, r, rf")