import asyncio
import requests
import json
import datetime
from api.models.intake import IntakeSession

BASE_URL = "http://localhost:8080/api"

def verify_dashboard():
    print("Testing /api/clinician/dashboard...")
    try:
        response = requests.get(f"{BASE_URL}/clinician/dashboard")
        response.raise_for_status()
        sessions = response.json()
        print(f"Dashboard returned {len(sessions)} sessions")
        
        # Verify structure
        for session in sessions:
            # Check required fields for frontend
            if not all(k in session for k in ['session_token', 'status', 'submitted_at', 'started_at']):
                print(f"FAIL: Session {session.get('session_token')} missing required fields")
                return False
            
            # Check data types if needed, though requests.json() handles most
            
        print("SUCCESS: Dashboard endpoint structure verified")
        return True
    except Exception as e:
        print(f"FAIL: Dashboard endpoint error: {e}")
        return False

def verify_review(session_token):
    print(f"Testing /api/clinician/review/{session_token}...")
    try:
        response = requests.get(f"{BASE_URL}/clinician/review/{session_token}")
        response.raise_for_status()
        session = response.json()
        
        if 'intake_data' not in session:
             print("FAIL: Review endpoint missing intake_data")
             return False
             
        # Frontend transforms this using transformBackendToIntakePayload
        # We can loosely check if intake_data has what we expect
        intake_data = session['intake_data']
        required_fields = ['patient_id', 'consent_acknowledged', 'issue_cards', 'symptoms']
        if not all(k in intake_data for k in required_fields):
             print(f"FAIL: intake_data missing required fields: {required_fields}")
             return False
             
        print("SUCCESS: Review endpoint returned correct data")
        return True
    except Exception as e:
        print(f"FAIL: Review endpoint error: {e}")
        return False

def create_dummy_session():
    # Issue questionnaire
    print("Creating dummy session...")
    issue_payload = {
        "patient_id": "test_patient_verify",
        "issued_by": "staff_verify",
        "intake_mode": "full"
    }
    resp = requests.post(f"{BASE_URL}/intake/issue", json=issue_payload)
    resp.raise_for_status()
    session = resp.json()
    session_token = session['session_token']
    
    # Submit intake
    submit_payload = {
        "session_token": session_token,
        "patient_id": "test_patient_verify",
        "issued_by": "staff_verify",
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
    
    resp = requests.post(f"{BASE_URL}/intake/submit", json=submit_payload)
    resp.raise_for_status()
    print(f"Stored session: {session_token}")
    return session_token

if __name__ == "__main__":
    try:
        token = create_dummy_session()
        if verify_dashboard():
            verify_review(token)
    except Exception as e:
        print(f"Setup failed: {e}")
