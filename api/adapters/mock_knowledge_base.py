"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

from typing import Dict, Any, List, Optional

import pandas as pd

class MockKnowledgeBaseAdapter:
    """
    Purely mock/test double for the knowledge base adapter.
    Does not load from disk. Instead, accepts test data as DataFrames or dicts.
    Used for tests and staging, not for actual product flow.
    Singleton per test process.
    """

    _instance = None

    def __new__(cls, *args, **kwargs):
        if cls._instance is None:
            cls._instance = super(MockKnowledgeBaseAdapter, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if hasattr(self, "_initialized") and self._initialized:
            return
        self._sheets: Dict[str, pd.DataFrame] = {}
        self._initialized = True

    def inject_sheet(self, name: str, data: Any):
        """
        Inject sheet as DataFrame or convert from list-of-dict.
        """
        if isinstance(data, pd.DataFrame):
            self._sheets[name] = data.copy()
        elif isinstance(data, list):
            self._sheets[name] = pd.DataFrame(data)
        elif isinstance(data, dict):
            # Accept dict of columns
            self._sheets[name] = pd.DataFrame(data)
        else:
            raise ValueError("Unknown sheet data type for injection")

    def get_sheet(self, name: str) -> pd.DataFrame:
        if name not in self._sheets:
            raise KeyError(f"Sheet {name} not in test mock (inject first)")
        return self._sheets[name].copy()

    # Sheet-specific shortcut methods, exactly like real adapter
    def get_intake_questionnaire(self, mode: str = "full") -> pd.DataFrame:
        if mode == "full":
            return self.get_sheet("intake_questionnaire")
        elif mode == "telehealth":
            return self.get_sheet("telehealth_questionnaire")
        raise ValueError("Unknown intake mode for mock")

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

    def clear(self):
        """Clear all injected sheets."""
        self._sheets.clear()

# Factory function for test harnesses
_mock_knowledge_base_adapter_instance: Optional[MockKnowledgeBaseAdapter] = None

def get_mock_knowledge_base_adapter() -> MockKnowledgeBaseAdapter:
    global _mock_knowledge_base_adapter_instance
    if _mock_knowledge_base_adapter_instance is None:
        _mock_knowledge_base_adapter_instance = MockKnowledgeBaseAdapter()
    return _mock_knowledge_base_adapter_instance