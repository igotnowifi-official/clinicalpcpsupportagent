from neo4j import GraphDatabase, exceptions
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

NEO4J_URI = "neo4j+s://4d2a70ea.databases.neo4j.io"

def test_auth(user, password, auth_type_desc):
    """
    Attempts to connect to Neo4j with the given username and password.
    Returns True if successful, False otherwise.
    """
    if not user or not password:
        print(f"[-] Skipping {auth_type_desc}: Missing credentials.")
        return False

    print(f"[*] Testing {auth_type_desc}...")
    print(f"    User: {user}")
    masked_pass = password[:4] + "..." if len(password) > 4 else "***"
    print(f"    Pass: {masked_pass}")

    try:
        # verify_connectivity() checks if we can talk to the server and authenticate
        with GraphDatabase.driver(NEO4J_URI, auth=(user, password)) as driver:
            driver.verify_connectivity()
            print(f"[+] SUCCESS: Connected to {NEO4J_URI} using {auth_type_desc}!")
            return True
    except exceptions.AuthError:
        print(f"[-] FAILED: Authentication error (Unauthorized).")
    except exceptions.ServiceUnavailable:
        print(f"[-] FAILED: Service unavailable (check URI or network).")
    except Exception as e:
        print(f"[-] FAILED: {e}")
    
    return False

def main():
    print("--- Neo4j Connection Tester ---\n")
    print(f"Target URI: {NEO4J_URI}\n")

    # 1. Test standard env vars
    username = os.getenv("NEO4J_USERNAME")
    password = os.getenv("NEO4J_PASSWORD")
    if test_auth(username, password, "ENV Credentials (NEO4J_USERNAME/PASSWORD)"):
        return

    # 2. Test default 'neo4j' user with env password
    # (Common if username is set to an email but DB user is 'neo4j')
    if username != "neo4j":
        print("")
        if test_auth("neo4j", password, "Default User 'neo4j' + ENV Password"):
            return

    # 3. Test Client ID / Client Secret as Basic Auth
    # (Some configurations use these as principal/credentials)
    client_id = os.getenv("NEO4J_CLIENT_ID")
    client_secret = os.getenv("NEO4J_CLIENT_SECRET")
    print("")
    if test_auth(client_id, client_secret, "Client ID + Client Secret (Basic Auth)"):
        return

    print("\n[!] All connection attempts failed.")
    print("Suggestion: Verify credentials in .env or check if OIDC/Token auth is required.")

if __name__ == "__main__":
    main()
