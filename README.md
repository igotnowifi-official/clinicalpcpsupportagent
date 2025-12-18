# Clinical PCP Support Agent

A clinician-in-the-loop **Clinic Intake & Triage System** designed to improve patient intake quality, triage accuracy, and clinician efficiency through structured workflows, knowledge graphs, and stateful assistant memory.

Built by **Natasya Liew** and **Artem**.

---

## Overview

Clinical intake and triage workflows are often fragmented, error-prone, and misaligned with how clinics actually operate. Patients complete long, static forms, clinicians receive incomplete or poorly structured information, and critical signals such as red flags or missing data are handled inconsistently or too late.

This project rethinks intake as a **stateful clinical workflow** rather than a static questionnaire. The system models real clinic processes including patient check-in, structured intake, automated triage, and clinician review—while keeping humans firmly in the loop.

---

## Key Features

- **Patient Check-In Gate**
  - Identity verification (first name, last name, date of birth)
  - Explicit session creation before intake begins
  - Mirrors real clinic front-desk workflows

- **Dynamic Intake Flow**
  - Multi-step questionnaire with branching logic
  - Symptom mapping and body-region selection
  - Red-flag screening and structured history capture

- **Rule-Based Triage Engine**
  - Condition scoring based on symptoms, history, and issue descriptions
  - Red-flag–aware urgency escalation
  - Ranked differential diagnosis with confidence labels

- **Clinician Dashboard**
  - Displays only checked-in patients
  - Supports intake review, edits, and last-minute concerns
  - Clear separation between patient-facing and clinician-facing workflows

---

## Architecture

### Frontend
- React + TypeScript
- Vite
- Tailwind CSS
- Multi-step intake flow with explicit workflow gating

### Backend
- FastAPI (Python)
- Pydantic for strict schema validation
- REST APIs for intake, triage, check-in, and clinician actions

---

## Knowledge Graph & Memory Architecture

### Neo4j for Clinical Knowledge Graph (RAG)

Neo4j is used to model a **clinical knowledge graph** that supports diagnosis and triage reasoning. The graph encodes structured relationships between *non-identifying clinical entities*, including:

- Symptoms and conditions  
- Conditions and red flags  
- Conditions and medication classes  
- Conditions and supporting history factors  
- Symptoms and body regions  

During triage, relevant subgraphs are retrieved to inform scoring, ranking, and explanations. This knowledge-graph–driven RAG approach enables reasoning over clinically meaningful relationships rather than relying on flat text or hard-coded rules.

Importantly, **no patient identifiers or protected health information (PHI) are stored in the knowledge graph**.

---

### Memory Machine for Assistant Context & Workflow Awareness

We designed the system around a **memory machine architecture** to support **stateful, context-aware workflows** without relying on fragile client-side storage or purely stateless API calls.

In the current implementation, the backend maintains authoritative **session and workflow state** (such as check-in status, intake submission, triage results, and clinician edits) at the API layer, while the memory machine is used to support **assistant-level memory and preferences** that persist across sessions.

This includes the ability to store and recall:

- Clinician preferences and dashboard configuration  
- Drafting and communication style preferences  
- Reusable follow-up patterns and assistant context  
- Workflow-related metadata that improves continuity across interactions  

The memory machine is intentionally **decoupled from patient-identifying data and raw intake responses**, allowing assistant memory to evolve independently of protected clinical data. This design avoids entangling AI memory with core workflow persistence while keeping the system flexible and future-proof.

---

## Triage Logic

At the core of triage is a weighted scoring function that combines multiple structured signals:

\[
\text{score} = 2 \cdot (\text{matched symptoms}) + (\text{supporting history}) + (\text{issue matches}) + \text{red flag bonus}
\]

This produces a ranked differential diagnosis while preserving clinician oversight and transparency.

---

## Privacy, Security, and HIPAA-Aligned Design

While this project is a prototype and not HIPAA-compliant, it was designed with **HIPAA-aligned principles** in mind:

- Separation of clinical knowledge from patient-identifying data  
- Least-privilege access to sensitive workflow information  
- Explicit workflow states to reduce accidental data exposure  
- Support for auditability and role-based access patterns  

Neo4j is used exclusively for **non-PHI clinical knowledge**, while patient identity and intake data are handled through controlled backend session management. Assistant memory is intentionally scoped to preferences and non-identifying context.

---

## What We Learned

- Workflow design matters more than UI polish  
- Intake, check-in, and clinician review must be explicit states  
- Strict validation improves safety and data quality  
- Frontend–backend contracts must be deterministic to avoid silent failures  

---

## Challenges

- Handling partial and missing intake data safely  
- Aligning frontend flows with backend workflow enforcement  
- Debugging inconsistent routing during development  
- Hardening triage logic against incomplete knowledge entries  

---

## Next Steps

1. **Improve the RAG knowledge graph with expert feedback**  
   Refine condition weights, symptom relationships, and scoring logic using clinician input.

2. **Expand the intake questionnaire to mirror real clinical procedures**  
   Add more structured, context-aware questions aligned with actual workflows.

3. **Strengthen privacy and security controls**  
   Introduce encryption at rest and in transit, audit logging, and role-based access control.

4. **Run pilot programs to refine UI/UX**  
   Partner with clinics to test and improve usability in real-world settings.

5. **Add ensemble decision-tree models for diagnostic support**  
   Augment rule-based triage with ensemble decision trees to provide complementary diagnostic signals for practitioners.

---

## Built With

**TypeScript, React, Vite, Tailwind CSS, FastAPI (Python), Pydantic, REST APIs, Neo4j, memory-augmented state machines, rule-based triage engine, and knowledge-graph–driven RAG architecture.**

---

## Repository

```bash
git clone https://github.com/igotnowifi-official/clinicalpcpsupportagent.git
