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
# SAFETY CONFIRMATION
# -------------------------
print("="*70)
print("⚠️  WARNING: DATABASE DELETION SCRIPT")
print("="*70)
print("\nThis script will PERMANENTLY DELETE:")
print("  • All nodes")
print("  • All relationships")
print("  • All constraints")
print("  • All indexes")
print(f"\nDatabase: {NEO4J_DATABASE}")
print(f"URI: {NEO4J_URI}")
print("\nThis action CANNOT be undone!")
print("="*70)

confirmation = input("\nType 'DELETE ALL DATA' to proceed: ")

if confirmation != "DELETE ALL DATA":
    print("\n❌ Deletion cancelled. No changes made.")
    exit(0)

print("\n🔄 Proceeding with deletion...\n")

# -------------------------
# NEO4J CONNECTION
# -------------------------
driver = GraphDatabase.driver(
    NEO4J_URI,
    auth=(NEO4J_USER, NEO4J_PASSWORD)
)

# -------------------------
# DELETION FUNCTIONS
# -------------------------

def get_node_count(tx):
    """Count total nodes"""
    result = tx.run("MATCH (n) RETURN count(n) as count")
    return result.single()["count"]

def get_relationship_count(tx):
    """Count total relationships"""
    result = tx.run("MATCH ()-[r]->() RETURN count(r) as count")
    return result.single()["count"]

def delete_all_relationships(tx):
    """Delete all relationships in batches"""
    batch_size = 10000
    deleted = 0
    
    while True:
        result = tx.run(f"""
            MATCH ()-[r]->()
            WITH r LIMIT {batch_size}
            DELETE r
            RETURN count(r) as deleted
        """)
        
        batch_deleted = result.single()["deleted"]
        deleted += batch_deleted
        
        if batch_deleted == 0:
            break
            
        print(f"   Deleted {deleted} relationships...")
    
    return deleted

def delete_all_nodes(tx):
    """Delete all nodes in batches"""
    batch_size = 10000
    deleted = 0
    
    while True:
        result = tx.run(f"""
            MATCH (n)
            WITH n LIMIT {batch_size}
            DELETE n
            RETURN count(n) as deleted
        """)
        
        batch_deleted = result.single()["deleted"]
        deleted += batch_deleted
        
        if batch_deleted == 0:
            break
            
        print(f"   Deleted {deleted} nodes...")
    
    return deleted

def get_all_constraints(tx):
    """Get all constraint names"""
    result = tx.run("SHOW CONSTRAINTS")
    return [record["name"] for record in result]

def drop_constraint(tx, constraint_name):
    """Drop a specific constraint"""
    tx.run(f"DROP CONSTRAINT {constraint_name} IF EXISTS")

def get_all_indexes(tx):
    """Get all index names"""
    result = tx.run("SHOW INDEXES")
    return [record["name"] for record in result if record["type"] != "LOOKUP"]

def drop_index(tx, index_name):
    """Drop a specific index"""
    tx.run(f"DROP INDEX {index_name} IF EXISTS")

# -------------------------
# EXECUTE DELETION
# -------------------------

try:
    with driver.session(database=NEO4J_DATABASE) as session:
        
        # Step 1: Get initial counts
        print("📊 Analyzing database...")
        node_count = session.execute_read(get_node_count)
        rel_count = session.execute_read(get_relationship_count)
        
        print(f"   Nodes: {node_count:,}")
        print(f"   Relationships: {rel_count:,}")
        
        if node_count == 0 and rel_count == 0:
            print("\n✅ Database is already empty!")
        else:
            # Step 2: Delete all relationships
            print(f"\n🗑️  Deleting all relationships...")
            total_rels_deleted = session.execute_write(delete_all_relationships)
            print(f"   ✓ Deleted {total_rels_deleted:,} relationships")
            
            # Step 3: Delete all nodes
            print(f"\n🗑️  Deleting all nodes...")
            total_nodes_deleted = session.execute_write(delete_all_nodes)
            print(f"   ✓ Deleted {total_nodes_deleted:,} nodes")
        
        # Step 4: Drop all constraints
        print(f"\n🗑️  Dropping all constraints...")
        constraints = session.execute_read(get_all_constraints)
        
        if constraints:
            for constraint in constraints:
                session.execute_write(drop_constraint, constraint)
                print(f"   ✓ Dropped constraint: {constraint}")
        else:
            print("   No constraints found")
        
        # Step 5: Drop all indexes (except system indexes)
        print(f"\n🗑️  Dropping all indexes...")
        indexes = session.execute_read(get_all_indexes)
        
        if indexes:
            for index in indexes:
                session.execute_write(drop_index, index)
                print(f"   ✓ Dropped index: {index}")
        else:
            print("   No user-created indexes found")
        
        # Step 6: Verify deletion
        print(f"\n📊 Verifying deletion...")
        final_node_count = session.execute_read(get_node_count)
        final_rel_count = session.execute_read(get_relationship_count)
        
        print(f"   Nodes remaining: {final_node_count:,}")
        print(f"   Relationships remaining: {final_rel_count:,}")
        
        if final_node_count == 0 and final_rel_count == 0:
            print("\n" + "="*70)
            print("✅ DATABASE SUCCESSFULLY CLEARED")
            print("="*70)
            print("\nAll data has been permanently deleted.")
            print("You can now run your node and relationship import scripts.")
        else:
            print("\n⚠️  Warning: Some data may remain in the database")

except Exception as e:
    print(f"\n❌ Error during deletion: {str(e)}")
    print("\nThe database may be in an inconsistent state.")
    print("Please check the Neo4j Browser for remaining data.")

finally:
    driver.close()
    print("\n🔌 Database connection closed.")