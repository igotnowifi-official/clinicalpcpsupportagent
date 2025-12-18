# Frontend-Backend API Integration

This document explains how the frontend connects to the FastAPI backend with Neo4j integration.

## Overview

The frontend now connects to the real backend API instead of using mocks. The backend uses:
- **KnowledgeBaseAdapter**: Can use Excel (dev) or Neo4j (production) for clinical knowledge
- **MemoryStore**: Session management and temporary data storage
- **TriageEngine**: Clinical triage with differential diagnosis

## Configuration

### API Base URL

The API base URL is configured in `frontend/src/config/api.ts`:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';
```

You can override this by setting the environment variable:
```bash
VITE_API_BASE_URL=http://your-backend-url:8080 npm run dev
```

### Backend Port

The backend runs on port **8080** by default (see `api/main.py`). Make sure:
1. Backend is running: `python api/main.py` or `uvicorn api.main:app --reload`
2. Frontend dev server is on a different port (Vite default is 5173, but configured to 8080 in `vite.config.ts`)

**Note**: If both are on 8080, you'll need to change one. Update `vite.config.ts` server port or backend port.

## API Flow

### 1. Issue Questionnaire
When a patient starts intake, the system:
- Calls `POST /api/intake/issue` to create a session
- Returns a `session_token` for tracking

### 2. Submit Intake
When patient completes the form:
- Transforms frontend `IntakePayload` to backend `IntakeQuestionnaireResponse` format
- Calls `POST /api/intake/submit` with the transformed data
- Backend validates and stores in MemoryStore

### 3. Run Triage
After submission:
- Calls `POST /api/triage/run` with the `session_token`
- Backend TriageEngine uses KnowledgeBaseAdapter (Neo4j or Excel) to:
  - Calculate differential diagnoses
  - Flag red flags
  - Suggest labs, referrals, medications
  - Generate patient communication drafts
- Returns triage result transformed to frontend format

## Data Transformation

The `apiTransform.ts` file handles conversion between frontend and backend types:

- **Frontend → Backend**: `transformIntakePayloadToBackend()`
  - Maps `Issue[]` to `IssueCard[]`
  - Maps symptoms array to `SymptomEntry[]`
  - Maps red flags object to `RedFlagScreening[]`
  - Transforms vitals, medications, allergies, etc.

- **Backend → Frontend**: `transformTriageResultFromBackend()`
  - Maps `top_5_conditions` to `differentials`
  - Extracts lab/referral/medication suggestions from `suggestions` array
  - Maps `acuity` to `status` (urgent/non_urgent)

## Neo4j Integration

The backend can use Neo4j for the knowledge base. To enable:

1. Set environment variables:
```bash
export NEO4J_URI="neo4j+s://your-instance.databases.neo4j.io"
export NEO4J_USERNAME="neo4j"
export NEO4J_PASSWORD="your-password"
```

2. In `api/config.py`, set `MOCK_NEO4J=False` or use environment variable:
```bash
export MOCK_NEO4J=false
```

3. The KnowledgeBaseAdapter will automatically use Neo4j instead of Excel

The frontend doesn't need any changes - it just calls the API endpoints and the backend handles Neo4j queries internally.

## Error Handling

All API calls use the `apiRequest()` helper which:
- Handles network errors
- Parses JSON responses
- Throws descriptive errors for non-2xx responses
- Includes error details from backend

## Testing

1. **Start Backend**:
```bash
cd /Users/igotnowifiapple/clinicalpcpsupportagent
python api/main.py
# Or: uvicorn api.main:app --reload --port 8080
```

2. **Start Frontend**:
```bash
npm run dev
```

3. **Test Flow**:
   - Navigate to `/intake`
   - Complete the intake form
   - Submit - should connect to backend
   - View triage results from real TriageEngine

## Troubleshooting

### CORS Errors
- Backend CORS is configured in `api/main.py`
- Default allows `localhost:5173` and `localhost:8080`
- If using different port, update CORS origins in backend

### Connection Refused
- Ensure backend is running on port 8080
- Check `VITE_API_BASE_URL` matches backend URL
- Verify no firewall blocking localhost:8080

### Type Mismatches
- Check `apiTransform.ts` for correct field mappings
- Backend models are in `api/models/intake.py` and `api/models/triage.py`
- Frontend types are in `frontend/src/types/intake.ts`

