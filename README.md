# Clinic-Grade Clinician-in-the-Loop Intake, Triage, and Patient Communication System

---

## Overview

This MVP is a **pilot-ready, production-quality platform** for clinical intake, triage, and clinician decision-support in both primary care and telehealth settings.

> **Not an autonomous diagnostic tool.**  
> Built for _clinician-in-the-loop_ workflows to **mirror real primary care/telehealth practice.**

- **Intake**: Realistic, branchable, red-flag-screened, clinic-grade outpatient intake.
- **Triage Reasoning**: Differential, red flag and anomaly highlighting, rule/model driven; always audit-friendly.
- **Clinician Wrap-Up**: Finalize, edit, and communicate clinical plans with complete audit and separation of patient/clinician views.
- **Audit/Compliance**: Immutable logged events for every action.
- **Separation of views**: Patients *never* see diagnosis/probabilities; clinicians *always* see top-5 differential.

## Ownership
© 2025 igotnowifi, LLC
Proprietary and confidential.

---

## Repo Structure (To Update)
api/
├── adapters/
│     ├── knowledge_base.py
│     ├── mock_knowledge_base.py
│     ├── memory_store.py
│     └── mock_memory_store.py
├── config.py
├── main.py
├── models/
│     ├── intake.py
│     ├── triage.py
│     ├── assistant_action.py
│     ├── finalization.py
│     └── message.py
├── routes/
│     ├── checkin.py
│     ├── intake.py
│     ├── triage.py
│     ├── assistant_actions.py
│     ├── clinician.py
│     ├── questionnaire.py
│     └── messaging.py
└── services/
├── audit_logger.py
├── triage_engine.py
├── explanation_engine.py
└── message_generator.py

frontend/
└── (see Frontend README or directory for details)

data/
└── clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx

.env
audit.log

README.md


---

## Knowledge Pack Source

**Mandatory**: All logic, branching, triggers, mappings, and text are strictly derived from  
`data/clinical_knowledge_pack_prefilled_v02_with_questionnaire.xlsx`

- **Sheets used:** See code and Excel—do not omit or add fields.
- Intake and telehealth UI match the Excel item-for-item; branching, mapping and triggers enforced.
- Changes or refactors require a new version of the Excel and business approval.

---

## Compliance and Core Rules

- **Never** show diagnoses/probabilities to patients.
- **Always** present top-5 differentials with probabilities to clinicians.
- **Red flags always override** reasoning/logic but never hide differential.
- **Clinic-grade audit:** Every check-in, action, suggestion, edit, override, clinical change, and communication is logged immutably.
- **Clinic-real UI/logic:** No collapses, "hacks", or omitted flows.

---

## Getting Started

### 1. Environment

- Python 3.10+
- pip
- Node 18+ (for frontend, see frontend/README)
- [Neo4j and MemVerge integration are mocked for MVP]

See `.env` for configuration options.

### 2. Setup

```sh
# Copy and adjust settings as needed
cp .env.example .env

# Install backend
cd api
pip install -r requirements.txt

# Frontend
cd ../frontend
npm install
```

### 3. Run Backend API
```sh
cd api
uvicorn api.main:app --reload --host 0.0.0.0 --port 8080
```

### 4. Run Frontend
```sh
cd frontend
npm run dev
```

---

## Security, Data, and Compliance
Patients may only access intake (tokenized) UIs for their session, and never see clinical data.
Staff must authenticate (PIN/SSO/mock in MVP).
All API payloads are audited if write/change events.
Audit logs saved to audit.log (immutable mode by default).
No PHI or sensitive comms are sent in MVP (mock messages only).

---

## Technology Roadmap
api/adapters/knowledge_base.py and api/adapters/memory_store.py are mocks—drop-in for Neo4j and MemVerge MemMachine coming.
No code or logic outside Excel is authoritative.
No refactors post-hackathon; all improvements are deeper logic, new models, or logic in Excel.

---

## Attribution & Credit
All code: © 2025 igotnowifi, LLC · Proprietary and confidential.
Production UIs:
Clinician Footer: © 2025 igotnowifi, LLC · Proprietary Clinical Software
Patient Footer: Powered by igotnowifi, LLC

---

## Support & Contact
This MVP is not open source nor open for third-party clinical use.
Questions, partnership, or demo requests: hello@natasyaliew.com