"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import pandas as pd
import hashlib
import os
from pathlib import Path
from neo4j import GraphDatabase
from dotenv import load_dotenv

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
    """
    Deterministic ID so reruns don't create duplicates
    """
    raw = f"{sheet}|" + "|".join(f"{k}:{v}" for k, v in sorted(row.items()))
    return hashlib.sha256(raw.encode()).hexdigest()

def get_primary_key(sheet: str, df: pd.DataFrame) -> str:
    candidate = f"{sheet}_id"
    return candidate if candidate in df.columns else "id"

# -------------------------
# STEP 1: EXCEL → CSV
# -------------------------
print("Exporting Excel sheets to CSV...")

xls = pd.ExcelFile(EXCEL_PATH)

sheet_data = {}

for sheet in xls.sheet_names:
    df = pd.read_excel(xls, sheet_name=sheet).fillna("")
    pk = get_primary_key(sheet, df)

    if pk not in df.columns:
        df["id"] = [
            stable_id(sheet, row.to_dict())
            for _, row in df.iterrows()
        ]

    csv_path = CSV_OUT_DIR / f"{sheet}.csv"
    df.to_csv(csv_path, index=False)
    sheet_data[sheet] = df

    print(f"  ✓ {sheet} → {csv_path}")

# -------------------------
# STEP 2: LOAD INTO NEO4J
# -------------------------
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

def create_constraint(tx, label, key):
    tx.run(
        f"""
        CREATE CONSTRAINT IF NOT EXISTS
        FOR (n:{label})
        REQUIRE n.{key} IS UNIQUE
        """
    )

def ingest_sheet(tx, sheet, df):
    label = sheet.replace(" ", "_").title()
    pk = get_primary_key(sheet, df)

    for _, row in df.iterrows():
        props = row.to_dict()

        tx.run(
            f"""
            MERGE (n:{label} {{ {pk}: $pk }})
            SET n += $props
            """,
            pk=props[pk],
            props=props
        )

with driver.session(database=NEO4J_DATABASE) as session:
    for sheet, df in sheet_data.items():
        label = sheet.replace(" ", "_").title()
        pk = get_primary_key(sheet, df)

        print(f"Creating constraint for :{label}({pk})")
        session.execute_write(create_constraint, label, pk)

    for sheet, df in sheet_data.items():
        print(f"Ingesting sheet: {sheet}")
        session.execute_write(ingest_sheet, sheet, df)

driver.close()

print("✅ Neo4j ingestion complete")
