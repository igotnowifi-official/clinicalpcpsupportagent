"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import threading
from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd
import os
from dotenv import load_dotenv

# Optional Neo4j import - only needed if using Neo4j mode
try:
    from neo4j import GraphDatabase
    NEO4J_AVAILABLE = True
except ImportError:
    NEO4J_AVAILABLE = False
    GraphDatabase = None

load_dotenv()


class KnowledgeBaseAdapter:
    """
    Swappable adapter for clinical knowledge base.
    Can use either:
    1. Excel file (mock mode for development)
    2. Neo4j graph database (production mode)
    
    Interface is fixed for drop-in replacement.
    Singleton behavior enforced.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(KnowledgeBaseAdapter, cls).__new__(cls)
        return cls._instance

    def __init__(
        self, 
        excel_path: Optional[str] = None,
        use_neo4j: bool = False,
        neo4j_uri: Optional[str] = None,
        neo4j_user: Optional[str] = None,
        neo4j_password: Optional[str] = None,
        neo4j_database: str = "neo4j"
    ):
        if hasattr(self, "_initialized") and self._initialized:
            return
        
        self.use_neo4j = use_neo4j
        self.sheets: Dict[str, pd.DataFrame] = {}
        self._initialized = False
        
        if use_neo4j:
            if not NEO4J_AVAILABLE:
                raise ImportError("Neo4j is not installed. Install it with: pip install neo4j")
            
            # Initialize Neo4j connection
            self.neo4j_uri = neo4j_uri or os.getenv("NEO4J_URI")
            self.neo4j_user = neo4j_user or os.getenv("NEO4J_USERNAME")
            self.neo4j_password = neo4j_password or os.getenv("NEO4J_PASSWORD")
            self.neo4j_database = neo4j_database
            
            if not all([self.neo4j_uri, self.neo4j_user, self.neo4j_password]):
                raise ValueError("Neo4j credentials not provided")
            
            self.driver = GraphDatabase.driver(
                self.neo4j_uri,
                auth=(self.neo4j_user, self.neo4j_password)
            )
            self._load_from_neo4j()
        else:
            # Fallback to Excel
            if excel_path is None:
                raise ValueError("Must provide excel_path when not using Neo4j")
            self.excel_path = Path(excel_path)
            self._load_excel()
        
        self._initialized = True

    def _load_excel(self):
        """Load data from Excel file (mock mode)"""
        if not self.excel_path.exists():
            raise FileNotFoundError(f"Knowledge pack Excel not found: {self.excel_path}")
        
        xls = pd.ExcelFile(self.excel_path)
        
        # Map sheet names from actual Excel to expected names
        sheet_mapping = {
            "intake_questionnaire": "intake_questionnaire",
            "intake_branch_rules": "intake_branch_rules",
            "telehealth_questionnaire": "telehealth_questionnaire",
            "intake_q_symptom_map": "intake_q_symptom_map",
            "conditions": "nodes_condition",
            "symptoms": "nodes_symptom",
            "red_flags": "nodes_redflag",
            "actions": "nodes_action_recommendation",
            "guides": "nodes_patient_guide",
            "templates": "nodes_message_template",
            "assistant_action_ui_map": "assistant_action_ui_map",
            "clinician_validation_checklist": "clinician_validation_checklist",
            "labs": "nodes_lab",
            "specialists": "nodes_specialist",
            "medications": "nodes_medication_option",
            "assistant_actions": "nodes_assistant_action",
            "vital_rules": "nodes_vital_rule"
        }
        
        for expected_name, actual_name in sheet_mapping.items():
            if actual_name in xls.sheet_names:
                self.sheets[expected_name] = xls.parse(actual_name)
            else:
                # Create empty DataFrame if sheet doesn't exist
                self.sheets[expected_name] = pd.DataFrame()
        
        xls.close()

    def _load_from_neo4j(self):
        """Load data from Neo4j and cache as DataFrames"""
        with self.driver.session(database=self.neo4j_database) as session:
            
            # Load conditions
            result = session.run("MATCH (n:Nodes_Condition) RETURN n")
            self.sheets["conditions"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load symptoms
            result = session.run("MATCH (n:Nodes_Symptom) RETURN n")
            self.sheets["symptoms"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load red flags
            result = session.run("MATCH (n:Nodes_Redflag) RETURN n")
            self.sheets["red_flags"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load actions
            result = session.run("MATCH (n:Nodes_Action_Recommendation) RETURN n")
            self.sheets["actions"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load guides
            result = session.run("MATCH (n:Nodes_Patient_Guide) RETURN n")
            self.sheets["guides"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load templates
            result = session.run("MATCH (n:Nodes_Message_Template) RETURN n")
            self.sheets["templates"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load labs
            result = session.run("MATCH (n:Nodes_Lab) RETURN n")
            self.sheets["labs"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load specialists
            result = session.run("MATCH (n:Nodes_Specialist) RETURN n")
            self.sheets["specialists"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load medications
            result = session.run("MATCH (n:Nodes_Medication_Option) RETURN n")
            self.sheets["medications"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load assistant actions
            result = session.run("MATCH (n:Nodes_Assistant_Action) RETURN n")
            self.sheets["assistant_actions"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load vital rules
            result = session.run("MATCH (n:Nodes_Vital_Rule) RETURN n")
            self.sheets["vital_rules"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load intake questionnaire
            result = session.run("MATCH (n:Intake_Questionnaire) RETURN n ORDER BY n.question_id")
            self.sheets["intake_questionnaire"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load telehealth questionnaire
            result = session.run("MATCH (n:Telehealth_Questionnaire) RETURN n ORDER BY n.question_id")
            self.sheets["telehealth_questionnaire"] = pd.DataFrame([dict(record["n"]) for record in result])
            
            # Load branch rules
            result = session.run("""
                MATCH (q1:Intake_Questionnaire)-[r:BRANCHES_TO]->(q2:Intake_Questionnaire)
                RETURN q1.question_id as trigger_question_id, 
                       r.trigger_value as trigger_value,
                       q2.question_id as show_question_id,
                       r.rule_type as rule_type,
                       r.notes as notes
            """)
            self.sheets["intake_branch_rules"] = pd.DataFrame([dict(record) for record in result])
            
            # Load symptom mapping
            result = session.run("""
                MATCH (q:Intake_Questionnaire)-[r:MAPS_TO_SYMPTOM]->(s:Nodes_Symptom)
                RETURN q.question_id as question_id,
                       s.symptom_id as symptom_id,
                       r.weight_modifier as weight_modifier
            """)
            self.sheets["intake_q_symptom_map"] = pd.DataFrame([dict(record) for record in result])
            
            # Load assistant action UI map
            result = session.run("""
                MATCH (a:Nodes_Assistant_Action)-[r:HAS_UI_COMPONENT]->(u:UI_Component)
                RETURN a.assistant_action_id as assistant_action_id,
                       u.ui_control as ui_control,
                       u.field_keys as field_keys,
                       u.min_value as min_value,
                       u.max_value as max_value,
                       u.unit_label as unit_label,
                       u.dropdown_options as dropdown_options,
                       u.placeholder_text as placeholder_text
            """)
            self.sheets["assistant_action_ui_map"] = pd.DataFrame([dict(record) for record in result])
            
            # Load clinician validation checklist (if exists in graph)
            result = session.run("MATCH (n:Clinician_Validation_Checklist) RETURN n")
            records = [dict(record["n"]) for record in result]
            if records:
                self.sheets["clinician_validation_checklist"] = pd.DataFrame(records)
            else:
                self.sheets["clinician_validation_checklist"] = pd.DataFrame()

    def get_sheet(self, name: str) -> pd.DataFrame:
        """Get a knowledge pack sheet as DataFrame (do not modify in place)."""
        if name not in self.sheets:
            raise KeyError(f"Sheet {name} not loaded")
        return self.sheets[name].copy()

    def get_intake_questionnaire(self, mode: str = "full") -> pd.DataFrame:
        """Get intake questionnaire based on mode"""
        if mode == "full":
            return self.get_sheet("intake_questionnaire")
        elif mode == "telehealth":
            return self.get_sheet("telehealth_questionnaire")
        raise ValueError("Unknown intake mode")

    def get_branch_rules(self) -> pd.DataFrame:
        """Get branching rules for intake questions"""
        return self.get_sheet("intake_branch_rules")

    def get_symptom_map(self) -> pd.DataFrame:
        """Get mapping between intake questions and symptoms"""
        return self.get_sheet("intake_q_symptom_map")

    def get_conditions(self) -> pd.DataFrame:
        """Get all conditions"""
        return self.get_sheet("conditions")

    def get_symptoms(self) -> pd.DataFrame:
        """Get all symptoms"""
        return self.get_sheet("symptoms")

    def get_red_flags(self) -> pd.DataFrame:
        """Get all red flags"""
        return self.get_sheet("red_flags")

    def get_actions(self) -> pd.DataFrame:
        """Get all clinical actions"""
        return self.get_sheet("actions")

    def get_guides(self) -> pd.DataFrame:
        """Get all patient guides"""
        return self.get_sheet("guides")

    def get_templates(self) -> pd.DataFrame:
        """Get all message templates"""
        return self.get_sheet("templates")

    def get_labs(self) -> pd.DataFrame:
        """Get all lab tests"""
        return self.get_sheet("labs")

    def get_specialists(self) -> pd.DataFrame:
        """Get all specialists"""
        return self.get_sheet("specialists")

    def get_medications(self) -> pd.DataFrame:
        """Get all medication options"""
        return self.get_sheet("medications")

    def get_assistant_actions(self) -> pd.DataFrame:
        """Get all assistant actions"""
        return self.get_sheet("assistant_actions")

    def get_vital_rules(self) -> pd.DataFrame:
        """Get all vital sign rules"""
        return self.get_sheet("vital_rules")

    def get_assistant_action_ui_map(self) -> pd.DataFrame:
        """Get UI mapping for assistant actions"""
        return self.get_sheet("assistant_action_ui_map")

    def get_validation_checklist(self) -> pd.DataFrame:
        """Get clinician validation checklist"""
        return self.get_sheet("clinician_validation_checklist")

    def query_condition_with_relationships(self, condition_id: str) -> Dict[str, Any]:
        """
        Query a condition with all its relationships (Neo4j only)
        Returns comprehensive condition data including labs, meds, actions, guides, etc.
        """
        if not self.use_neo4j:
            raise NotImplementedError("Relationship queries require Neo4j mode")
        
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (c:Nodes_Condition {condition_id: $condition_id})
                OPTIONAL MATCH (c)-[r_lab:REQUIRES_LAB]->(lab:Nodes_Lab)
                OPTIONAL MATCH (c)-[r_med:TREATED_BY]->(med:Nodes_Medication_Option)
                OPTIONAL MATCH (c)-[r_action:REQUIRES_ACTION]->(action:Nodes_Action_Recommendation)
                OPTIONAL MATCH (c)-[r_guide:HAS_GUIDE]->(guide:Nodes_Patient_Guide)
                OPTIONAL MATCH (c)-[r_ref:REFERS_TO]->(spec:Nodes_Specialist)
                OPTIONAL MATCH (c)-[r_asst:NEEDS_ASSISTANT_ACTION]->(asst:Nodes_Assistant_Action)
                OPTIONAL MATCH (c)-[r_tmpl:USES_TEMPLATE]->(tmpl:Nodes_Message_Template)
                OPTIONAL MATCH (s:Nodes_Symptom)-[r_sup:SUPPORTS]->(c)
                
                RETURN c,
                       collect(DISTINCT {lab: lab, priority: r_lab.priority, reason: r_lab.reason}) as labs,
                       collect(DISTINCT {med: med, priority: r_med.priority, reason: r_med.reason}) as medications,
                       collect(DISTINCT {action: action, priority: r_action.priority, reason: r_action.reason}) as actions,
                       collect(DISTINCT {guide: guide, priority: r_guide.priority, reason: r_guide.reason}) as guides,
                       collect(DISTINCT {specialist: spec, urgency: r_ref.urgency, reason: r_ref.reason}) as referrals,
                       collect(DISTINCT {assistant_action: asst, priority: r_asst.priority, reason: r_asst.reason}) as assistant_actions,
                       collect(DISTINCT {template: tmpl, priority: r_tmpl.priority}) as templates,
                       collect(DISTINCT {symptom: s, weight: r_sup.weight}) as supporting_symptoms
            """, condition_id=condition_id)
            
            record = result.single()
            if not record:
                return {}
            
            return {
                "condition": dict(record["c"]),
                "labs": [dict(item["lab"]) for item in record["labs"] if item["lab"]],
                "medications": [dict(item["med"]) for item in record["medications"] if item["med"]],
                "actions": [dict(item["action"]) for item in record["actions"] if item["action"]],
                "guides": [dict(item["guide"]) for item in record["guides"] if item["guide"]],
                "referrals": [dict(item["specialist"]) for item in record["referrals"] if item["specialist"]],
                "assistant_actions": [dict(item["assistant_action"]) for item in record["assistant_actions"] if item["assistant_action"]],
                "templates": [dict(item["template"]) for item in record["templates"] if item["template"]],
                "supporting_symptoms": [dict(item["symptom"]) for item in record["supporting_symptoms"] if item["symptom"]]
            }

    def query_symptoms_for_condition(self, condition_id: str) -> List[Dict[str, Any]]:
        """Get all symptoms that support a condition with their weights"""
        if not self.use_neo4j:
            raise NotImplementedError("Relationship queries require Neo4j mode")
        
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (s:Nodes_Symptom)-[r:SUPPORTS]->(c:Nodes_Condition {condition_id: $condition_id})
                RETURN s, r.weight as weight, r.notes as notes
                ORDER BY r.weight DESC
            """, condition_id=condition_id)
            
            return [
                {
                    **dict(record["s"]),
                    "weight": record["weight"],
                    "notes": record["notes"]
                }
                for record in result
            ]

    def query_red_flags_for_symptom(self, symptom_id: str) -> List[Dict[str, Any]]:
        """Get all red flags triggered by a symptom"""
        if not self.use_neo4j:
            raise NotImplementedError("Relationship queries require Neo4j mode")
        
        with self.driver.session(database=self.neo4j_database) as session:
            result = session.run("""
                MATCH (s:Nodes_Symptom {symptom_id: $symptom_id})-[r:TRIGGERS]->(rf:Nodes_Redflag)
                RETURN rf, r.notes as notes
            """, symptom_id=symptom_id)
            
            return [
                {
                    **dict(record["rf"]),
                    "notes": record["notes"]
                }
                for record in result
            ]

    def reload(self):
        """Force reload data from source"""
        with self._lock:
            if self.use_neo4j:
                self._load_from_neo4j()
            else:
                self._load_excel()

    def close(self):
        """Close Neo4j connection if active"""
        if self.use_neo4j and hasattr(self, 'driver'):
            self.driver.close()

    def __del__(self):
        """Cleanup on deletion"""
        self.close()


# Factory function for DI / import in service layer
_knowledge_base_adapter: Optional[KnowledgeBaseAdapter] = None


def get_knowledge_base_adapter(
    excel_path: Optional[str] = None,
    use_neo4j: bool = False,
    **kwargs
) -> KnowledgeBaseAdapter:
    """
    Get singleton instance of KnowledgeBaseAdapter.
    
    Args:
        excel_path: Path to Excel file (required if use_neo4j=False)
        use_neo4j: Whether to use Neo4j instead of Excel
        **kwargs: Additional arguments for Neo4j connection
    """
    global _knowledge_base_adapter
    if _knowledge_base_adapter is None:
        _knowledge_base_adapter = KnowledgeBaseAdapter(
            excel_path=excel_path,
            use_neo4j=use_neo4j,
            **kwargs
        )
    return _knowledge_base_adapter


def reset_knowledge_base_adapter():
    """Reset singleton (for testing)"""
    global _knowledge_base_adapter
    if _knowledge_base_adapter:
        _knowledge_base_adapter.close()
    _knowledge_base_adapter = None