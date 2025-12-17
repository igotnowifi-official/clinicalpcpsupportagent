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
CSV_OUT_DIR = Path("neo4j_csv")

NEO4J_URI = "neo4j+s://4d2a70ea.databases.neo4j.io"
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DB = "neo4j"

# -------------------------
# NEO4J
# -------------------------
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

# ======================
# HELPERS
# ======================
def detect_key(tx, label):
    rec = tx.run(
        f"""
        MATCH (n:`{label}`)
        RETURN keys(n) AS k
        LIMIT 1
        """
    ).single()
    if not rec:
        raise RuntimeError(f"No nodes for label {label}")
    return rec["k"]

def match_node(tx, label, keys, value):
    for k in keys:
        r = tx.run(
            f"""
            MATCH (n:`{label}`)
            WHERE n.{k} = $v
            RETURN n
            """,
            v=value,
        ).single()
        if r:
            return k
    return None

# ======================
# LINKERS
# ======================
def link_question_symptom(tx, df):
    q_label = "Intake_Questionnaire"
    s_label = "Nodes_Symptom"
    edge_label = "Intake_Q_Symptom_Map"

    q_keys = detect_key(tx, q_label)
    s_keys = detect_key(tx, s_label)
    e_keys = detect_key(tx, edge_label)

    for _, r in df.iterrows():
        qid = r["question_id"]
        sid = r["symptom_id"]

        qk = match_node(tx, q_label, q_keys, qid)
        sk = match_node(tx, s_label, s_keys, sid)

        if not qk or not sk:
            raise RuntimeError(f"Missing Question or Symptom: {qid}, {sid}")

        tx.run(
            f"""
            MATCH (q:`{q_label}` {{{qk}: $qid}})
            MATCH (s:`{s_label}` {{{sk}: $sid}})
            CREATE (e:`{edge_label}`)
            SET e += $props
            CREATE (e)-[:FROM_QUESTION]->(q)
            CREATE (e)-[:TO_SYMPTOM]->(s)
            """,
            qid=qid,
            sid=sid,
            props=r.to_dict(),
        )

def link_question_branching(tx, df):
    q_label = "Intake_Questionnaire"
    edge_label = "Intake_Branch_Rules"

    q_keys = detect_key(tx, q_label)
    e_keys = detect_key(tx, edge_label)

    for _, r in df.iterrows():
        src = r["question_id"]
        yes = r.get("yes_next_question")
        no = r.get("no_next_question")

        src_k = match_node(tx, q_label, q_keys, src)
        if not src_k:
            raise RuntimeError(f"Missing question {src}")

        tx.run(
            f"""
            MATCH (q:`{q_label}` {{{src_k}: $src}})
            CREATE (e:`{edge_label}`)
            SET e += $props
            CREATE (e)-[:FROM_QUESTION]->(q)
            """,
            src=src,
            props=r.to_dict(),
        )

        if yes:
            yes_k = match_node(tx, q_label, q_keys, yes)
            if yes_k:
                tx.run(
                    f"""
                    MATCH (e:`{edge_label}`), (q:`{q_label}` {{{yes_k}: $yes}})
                    WHERE e.question_id = $src
                    CREATE (e)-[:YES_BRANCH]->(q)
                    """,
                    yes=yes,
                    src=src,
                )

        if no:
            no_k = match_node(tx, q_label, q_keys, no)
            if no_k:
                tx.run(
                    f"""
                    MATCH (e:`{edge_label}`), (q:`{q_label}` {{{no_k}: $no}})
                    WHERE e.question_id = $src
                    CREATE (e)-[:NO_BRANCH]->(q)
                    """,
                    no=no,
                    src=src,
                )

# ======================
# RUN
# ======================
xls = pd.ExcelFile(EXCEL_PATH)

with driver.session(database=NEO4J_DB) as session:

    if "Intake_Q_Symptom_Map" in xls.sheet_names:
        print("→ Linking Question ↔ Symptom")
        df = pd.read_excel(xls, "Intake_Q_Symptom_Map").fillna("")
        session.execute_write(link_question_symptom, df)

    if "Intake_Branch_Rules" in xls.sheet_names:
        print("→ Linking Question Branching")
        df = pd.read_excel(xls, "Intake_Branch_Rules").fillna("")
        session.execute_write(link_question_branching, df)

driver.close()
print("✅ DONE")
