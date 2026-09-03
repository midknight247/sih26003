# Smriti (SIH26003)
An Adaptive Cognitive Engagement and Assistive Platform for Elderly Dementia Patients in the North Eastern Region (NER) of India.

## 🏛️ Foundational Core Principle (Architecture C Compliance)
Smriti operates strictly on the **Observable Interaction Signals** pattern. To guarantee safety and compliance with non-clinical MVP boundaries, the platform **does not perform diagnostic functions, calculate clinical cognitive severity scores, or infer underlying dementia progression states**. Instead, it dynamically calibrates interface complexity and support cues in real-time based purely on observable behavioral footprints (latency spikes, touch tracking accuracy, and continuous friction indicators).

---

## 🛠️ The Core Monorepo Tech Stack
*   **React 18 & TypeScript:** Advanced component modular architecture leveraging a centralized state engine loop.
*   **Zustand:** Ultra-fast, unified global session transaction store decoupled completely from raw presentation frames.
*   **FastAPI:** High-performance, thin asynchronous REST API controller gateway.
*   **PostgreSQL:** Production-grade relational database running strict foreign-key integrity constraints.
*   **SQLAlchemy ORM & Alembic:** Full programmatically auto-generated schema migration pipeline tracking database history safely.

---

## 💾 Relational Database Schema Model (The 8 Frozen Entities)
The persistent database layer tracks 8 explicit tables to enable running a patient session, capturing telemetry footprints, and verifying an absolute audit trail for judges:

1.  **`caregivers`**: Identity repository housing clinical supervisor baseline profile rows.
2.  **`patients`**: Masked demographic tracking profiles enforcing data privacy bounds via absolute aliases.
3.  **`activities`**: Master task directory mapping out the frozen MVP cognitive modules.
4.  **`content_items`**: Localized cultural asset repository hosting language and regional tags tailored for the Northeast Region.
5.  **`sessions`**: Core patient run transaction logging shells (`ACTIVE`, `COMPLETED`, `ABANDONED`).
6.  **`interactions`**: Precise behavioral evidence footprint container tracking millisecond-level telemetry strings.
7.  **`adaptation_states`**: Continuous running session matrix mapping consecutive success and struggle counts per activity type.
8.  **`adaptation_decisions`**: **The Presentation Audit Trail Table**. Logs explicit string reasons detailing precisely why the Adaptation Engine scaled support layers up or down.

---

## 🤖 The Mathematical Adaptation Engine Logic Matrix
Real-time interface adaptation is governed entirely by mathematical performance milestones managed inside `app/adaptation/engine.py` and thoroughly verified by programmatically automated unit tests:

*   **Escalation Rule:** If **two or more consecutive struggle events** or categorical friction locks are intercepted, support scaling automatically elevates (`Support Level 0 ➔ Level 1`) to drop visual/auditory support cue overlays.
*   **Latency Guard Rule:** If an interaction's **dwell time exceeds 1.8x the patient's baseline response threshold**, the environment triggers immediate helper prompts to counter potential cognitive exhaustion or fatigue.
*   **Optimization Loop Rule:** Achieving **three consecutive standalone successes** triggers an automatic visual cue fade (`Support Level 1 ➔ Level 0`) or increments the challenge scale to maintain optimal non-frustrating engagement.

---

## 🚀 Local Development Setup & Infrastructure Orchestration

### 1. Persistent Database Migration (PostgreSQL)
Ensure your local PostgreSQL instance is running on port `5432` with a database named `sih26003_dev`, then compile the migrations and populate the localized regional tasks:
```bash
cd backend
\$env:PYTHONPATH="."
alembic upgrade head
python app/database/seed.py
```

### 2. High-Performance API Dev Server (FastAPI)
Boot up the backend execution engine loop:
```bash
cd backend
python -m uvicorn app.main:app --reload
```
*   **Swagger API Developer Portal:** Accessible live at `http://localhost:8000/docs`

### 3. Highly Accessible Client View Interface (React)
Boot up the frontend hot-reloading development server layout container:
```bash
cd frontend
npm install
npm run dev
```

