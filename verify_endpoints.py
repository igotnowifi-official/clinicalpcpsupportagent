
from fastapi.testclient import TestClient
from api.main import app
from api.adapters.memory_store import get_memory_store, reset_memory_store
import datetime
import uuid
import json

def verify_endpoints():
    client = TestClient(app)
    
    # Reset store
    reset_memory_store()
    store = get_memory_store()
    
    # Create a session directly in the store
    session_token = f"q_{uuid.uuid4().hex[:20]}"
    patient_id = "p_frontend_test"
    
    intake_data = {
        "session_token": session_token,
        "patient_id": patient_id,
        "issued_by": "staff_123",
        "intake_mode": "full",
        "started_at": datetime.datetime.utcnow().isoformat(),
        "chief_concern": "Headache",
        "issue_cards": [],
        "symptoms": [{"symptom_id": "headache", "present": True}],
        "red_flags": [],
        "consent_acknowledged": True,
        "medications": [],
        "allergies": [],
        "vitals": {"bp_systolic": 120, "bp_diastolic": 80},
        "pmh": [],
        "symptom_durations": {},
        "functional_impacts": {},
        "social_history": {},
        "ros": {},
        "family_history": []
    }
    
    session_data = {
        "session_token": session_token,
        "patient_id": patient_id,
        "status": "submitted",
        "intake_mode": "full",
        "started_at": datetime.datetime.utcnow().isoformat(),
        "expires_at": (datetime.datetime.utcnow() + datetime.timedelta(hours=1)).isoformat(),
        "submitted_at": datetime.datetime.utcnow().isoformat(),
        "issued_by": "staff_123",
        "audit_trail": [],
        "intake_data": intake_data
    }
    
    # Store it
    store.set(f"intake_session:{session_token}", session_data)
    print(f"Stored session: {session_token}")
    
    # 1. Test Dashboard
    print("\nTesting /api/clinician/dashboard...")
    resp_dash = client.get("/api/clinician/dashboard")
    if resp_dash.status_code != 200:
        print(f"FAILED: Dashboard returned {resp_dash.status_code}")
        print(resp_dash.text)
        return
        
    sessions = resp_dash.json()
    print(f"Dashboard returned {len(sessions)} sessions")
    found = any(s["session_token"] == session_token for s in sessions)
    if not found:
        print("FAILED: Session not found in dashboard")
        return
    else:
        print("SUCCESS: Session found in dashboard")

    # 2. Test Review
    print(f"\nTesting /api/clinician/review/{session_token}...")
    resp_review = client.get(f"/api/clinician/review/{session_token}")
    if resp_review.status_code != 200:
        print(f"FAILED: Review returned {resp_review.status_code}")
        print(resp_review.text)
        return
        
    review_data = resp_review.json()
    if review_data["session_token"] != session_token:
        print("FAILED: Token mismatch")
        return
        
    if "intake_data" not in review_data or not review_data["intake_data"]:
        print("FAILED: intake_data missing in review response")
        return
        
    print("SUCCESS: Review endpoint returned correct data")
    print(f"Patient Name: {review_data['intake_data']['patient']['name']}")

if __name__ == "__main__":
    verify_endpoints()
