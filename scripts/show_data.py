"""
© 2025 igotnowifi, LLC
Proprietary and confidential.

Inspect Excel file structure to understand the actual sheet names and columns
"""

import pandas as pd

EXCEL_PATH = "data/knowledge_pack/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx"

print("="*70)
print("EXCEL FILE STRUCTURE ANALYSIS")
print("="*70)

xls = pd.ExcelFile(EXCEL_PATH)

print(f"\nTotal sheets found: {len(xls.sheet_names)}\n")

for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    
    print(f"Sheet: '{sheet_name}'")
    print(f"  Rows: {len(df)}")
    print(f"  Columns: {list(df.columns)}")
    
    # Show first row as sample
    if len(df) > 0:
        print(f"  Sample data (first row):")
        for col in df.columns:
            val = df.iloc[0][col]
            if pd.notna(val) and str(val).strip():
                print(f"    {col}: {val}")
    
    print()

print("="*70)
print("\nLOOKING FOR RELATIONSHIP SHEETS:")
print("="*70)

# Sheets we expect for relationships
expected_relationship_sheets = [
    'condition_symptoms',
    'condition_red_flags', 
    'condition_actions',
    'condition_supports',
    'intake_branch_rules',
    'intake_q_symptom_map',
    'medication_condition_map',
    'guide_condition_map',
    'assistant_action_ui_map',
    'telehealth_symptom_map'
]

print("\nExpected sheets for relationships:")
for expected in expected_relationship_sheets:
    found = expected in xls.sheet_names
    status = "✓ FOUND" if found else "✗ MISSING"
    print(f"  {status}: {expected}")

print("\n" + "="*70)
print("SHEETS THAT MIGHT CONTAIN RELATIONSHIP DATA:")
print("="*70)

# Look for sheets that might contain relationships (have multiple ID columns)
for sheet_name in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet_name)
    
    # Count columns ending with '_id'
    id_columns = [col for col in df.columns if str(col).endswith('_id')]
    
    if len(id_columns) >= 2:
        print(f"\n'{sheet_name}' has {len(id_columns)} ID columns:")
        print(f"  {id_columns}")
        print(f"  → Likely contains relationships!")
        
        # Show a sample row
        if len(df) > 0:
            print(f"  Sample relationship:")
            sample = df.iloc[0]
            for col in id_columns:
                if pd.notna(sample[col]):
                    print(f"    {col}: {sample[col]}")