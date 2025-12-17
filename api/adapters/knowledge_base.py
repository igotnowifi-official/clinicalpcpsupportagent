"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import threading
from typing import Dict, Any, List, Optional
from pathlib import Path
import pandas as pd

class KnowledgeBaseAdapter:
    """
    Mock, swappable adapter for clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx
    Provides structured, cached sheets as required.
    Interface is fixed for future Neo4j/other backend drop-in.
    Singleton behavior enforced.
    """

    _instance = None
    _lock = threading.Lock()

    def __new__(cls, *args, **kwargs):
        with cls._lock:
            if cls._instance is None:
                cls._instance = super(KnowledgeBaseAdapter, cls).__new__(cls)
        return cls._instance

    def __init__(self, excel_path: str):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self.excel_path = Path(excel_path)
        self.sheets: Dict[str, pd.DataFrame] = {}
        self._initialized = False
        self._load_excel()
        self._initialized = True

    def _load_excel(self):
        if not self.excel_path.exists():
            raise FileNotFoundError(f"Knowledge pack Excel not found: {self.excel_path}")
        xls = pd.ExcelFile(self.excel_path)
        # Load all required (verbatim) sheets
        required_sheets = [
            "intake_questionnaire",
            "intake_branch_rules",
            "telehealth_questionnaire",
            "intake_q_symptom_map",
            "conditions",
            "symptoms",
            "supports",
            "red_flags",
            "actions",
            "guides",
            "templates",
            "assistant_action_ui_map",
            "clinician_validation_checklist"
        ]
        for sheet in required_sheets:
            if sheet not in xls.sheet_names:
                raise ValueError(f"Required knowledge pack sheet missing: {sheet}")
            self.sheets[sheet] = xls.parse(sheet)
        xls.close()

    def get_sheet(self, name: str) -> pd.DataFrame:
        """Get a knowledge pack sheet as DataFrame (do not modify in place)."""
        if name not in self.sheets:
            raise KeyError(f"Sheet {name} not loaded")
        return self.sheets[name].copy()

    def get_intake_questionnaire(self, mode: str = "full") -> pd.DataFrame:
        if mode == "full":
            return self.get_sheet("intake_questionnaire")
        elif mode == "telehealth":
            return self.get_sheet("telehealth_questionnaire")
        raise ValueError("Unknown intake mode")

    def get_branch_rules(self) -> pd.DataFrame:
        return self.get_sheet("intake_branch_rules")

    def get_symptom_map(self) -> pd.DataFrame:
        return self.get_sheet("intake_q_symptom_map")

    def get_conditions(self) -> pd.DataFrame:
        return self.get_sheet("conditions")

    def get_symptoms(self) -> pd.DataFrame:
        return self.get_sheet("symptoms")

    def get_supports(self) -> pd.DataFrame:
        return self.get_sheet("supports")

    def get_red_flags(self) -> pd.DataFrame:
        return self.get_sheet("red_flags")

    def get_actions(self) -> pd.DataFrame:
        return self.get_sheet("actions")

    def get_guides(self) -> pd.DataFrame:
        return self.get_sheet("guides")

    def get_templates(self) -> pd.DataFrame:
        return self.get_sheet("templates")

    def get_assistant_action_ui_map(self) -> pd.DataFrame:
        return self.get_sheet("assistant_action_ui_map")

    def get_validation_checklist(self) -> pd.DataFrame:
        return self.get_sheet("clinician_validation_checklist")

    def reload(self):
        """Force reload Excel, used by admin functions or development reload."""
        with self._lock:
            self._load_excel()

# Factory function for DI / import in service layer
_knowledge_base_adapter: Optional[KnowledgeBaseAdapter] = None

def get_knowledge_base_adapter(path: Optional[str] = None) -> KnowledgeBaseAdapter:
    global _knowledge_base_adapter
    if _knowledge_base_adapter is None:
        if path is None:
            raise ValueError("Must provide knowledge pack path for first instantiation.")
        _knowledge_base_adapter = KnowledgeBaseAdapter(path)
    return _knowledge_base_adapter