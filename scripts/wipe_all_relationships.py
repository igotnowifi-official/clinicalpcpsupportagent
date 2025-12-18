"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import os
from neo4j import GraphDatabase
from dotenv import load_dotenv

load_dotenv()

# -------------------------
# CONFIG
# -------------------------
NEO4J_URI = "neo4j+s://4d2a70ea.databases.neo4j.io"
NEO4J_USER = os.getenv("NEO4J_USERNAME")
NEO4J_PASSWORD = os.getenv("NEO4J_PASSWORD")
NEO4J_DATABASE = "neo4j"

# -------------------------
# CONNECT
# -------------------------
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

# -------------------------
# WIPE RELATIONSHIPS
# -------------------------
def wipe_relationships(tx):
    tx.run("""
        MATCH ()-[r]->()
        DELETE r
    """)

with driver.session(database=NEO4J_DATABASE) as session:
    print("⚠️  Removing ALL relationships...")
    session.execute_write(wipe_relationships)

driver.close()
print("✅ All relationships removed (nodes preserved)")
