# Nexlance - Freelance Marketplace Platform

A professional, industry-standard freelance marketplace platform where **Clients** post high-quality projects and **Freelancers** compete to deliver excellence. Designed with a modern, premium dark-themed glassmorphic aesthetic and built on a robust, asynchronous architecture.

Built with **FastAPI + React + PostgreSQL** by a dedicated team of engineers.

---

## 🏗️ System Architecture

Nexlance follows a modern micro-monolith approach with a clear separation between the presentation layer and the business logic.

```text
Browser → React (Vite, :5173) → FastAPI (:8000) → PostgreSQL (Primary) / SQLite (Dev)
```

- **Frontend**: React 18 + Vite + React Router v6 + Axios (Centralized Service)
- **Backend**: Python 3.12, FastAPI, SQLAlchemy (Asynchronous), JWT Authentication
- **Database**: 
  - **PostgreSQL**: Primary production-grade database for high-concurrency and data integrity.
  - **SQLite**: Lightweight, zero-config option for local architectural testing and rapid development.
- **Security**: Advanced JWT-based authorization and Google SSO integration.

## 📁 Project Structure

```text
freelance-marketplace-platform/
├── backend/                   # Asynchronous FastAPI Service
│   ├── main.py                # Entry point & Router Registry
│   ├── database.py            # SQLAlchemy Async Engine & Session Orchestration
│   ├── config.py              # Pydantic-based Environment Management
│   ├── requirements.txt       # Backend Dependencies
│   ├── auth/                  # Advanced Identity & Access Management
│   ├── jobs/                  # Job Lifecycle & Discovery
│   ├── bids/                  # Competitive Proposal System
│   ├── projects/              # Active Workflow & Delivery Management (Multi-file Support)
│   ├── messages/              # Direct User-to-User Messaging (With Attachments)
│   ├── payments/              # Simulated Escrow & Security System
│   ├── uploads/               # Secure File Storage & Ingestion
│   ├── reviews/               # Reputation & Rating Module
│   ├── notifications/         # Real-time User Alert System
│   └── support/               # Complaints & Ticket Management
├── frontend/                  # Responsive React Application
│   ├── src/
│   │   ├── pages/             # Feature-driven page components
│   │   ├── components/        # Reusable UI Library (Navbar, Cards, Modals)
│   │   ├── services/api.js    # Optimized Axios API Client
│   │   ├── context/           # Global State Management (Auth, Theme)
│   │   ├── App.jsx            # Router Configuration
│   │   └── main.jsx           # Application Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
├── database/schema.sql        # Core DDL & Data Seeding
├── docs/                      # Technical Documentation & Workflow Guides
├── tests/                     # Automated Pytest Integration Suite
├── .env.example               # Configuration Template
└── docker-compose.yml         # Containerized Environment Orchestration
```

---

## 🚀 Deployment & Quick Start

### 1. Backend Initialization

```bash
cd backend

# 1. Environment Setup
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# 2. Dependency Installation
pip install -r requirements.txt

# 3. Configuration
cp ../.env.example .env

# 4. Service Launch
uvicorn main:app --reload
# → API: http://localhost:8000
# → Docs: http://localhost:8000/docs
```

### 2. Frontend Initialization

```bash
cd frontend

# 1. Install Dependencies
npm install

# 2. Launch Dev Server
npm run dev
# → Client: http://localhost:5173
```

---

## 🗄️ Database Strategy: PostgreSQL

Nexlance is optimized for **PostgreSQL** to handle production-level transaction volumes.

### 1. Instance Configuration

#### **🐧 Linux / Ubuntu**
```bash
sudo apt update && sudo apt install postgresql postgresql-contrib
sudo service postgresql start

# Create the Nexlance Instance
sudo -u postgres psql
# CREATE USER nexlance_user WITH PASSWORD 'nexlance_secure_password';
# CREATE DATABASE nexlance_db OWNER nexlance_user;
```

#### **🪟 Windows**
1. Install PostgreSQL from [postgresql.org](https://www.postgresql.org/download/windows/).
2. Run SQL Shell (psql) or pgAdmin:
```sql
CREATE DATABASE nexlance_db;
CREATE USER nexlance_user WITH PASSWORD 'nexlance_secure_password';
GRANT ALL PRIVILEGES ON DATABASE nexlance_db TO nexlance_user;
```

### 2. Integration & Migration
Update your `backend/.env` and execute the migration script to synchronize models:
```bash
cd backend
python migrate_to_postgres.py
```

### 3. Sharing via Cloud vs Local Presentation
Nexlance supports dynamically switching between databases by editing your `backend/.env` file:
* **For Local Presentation (Speed):** Use the `localhost` PostgreSQL setting so there is zero network latency during your live demos.
* **For Team Sharing (Collaboration):** Comment out the local URL and uncomment the Neon Cloud database URL before sending the `.env` file to your group so you all share the same live platform data.

---

## 🐳 Docker Deployment (Recommended)

Streamline your environment setup with a single command:
```bash
docker compose up --build
```
*Note: This automatically orchestrates the FastAPI service, React frontend, and a PostgreSQL container.*

---

## 📡 Specialized API Reference

Interactive documentation is available at **http://localhost:8000/docs**.

| Module | Method | Endpoint | Description |
|--------|--------|----------|-------------|
| **Auth** | POST | `/auth/login` | Secure JWT Session Generation |
| **Jobs** | GET | `/jobs` | Optimized Job Querying & Filtering |
| **Bids** | POST | `/bids` | Proposal Submission for Freelancers |
| **Projects**| PUT | `/projects/{id}/approve` | Client-Side Project Finalization |
| **Uploads** | POST | `/uploads/multiple` | Secure Multi-file Asset Ingestion |
| **Payments**| GET | `/payments/history` | Financial Transaction Logs |
| **Support** | POST | `/support/tickets` | Conflict Resolution & Complaints |
| **Alerts**  | GET | `/notifications` | Personalized User Alert Stream |

---

## 🧪 Testing Protocol

Ensure system stability by running the automated suite:
```bash
cd backend
pytest ../tests/ -v
```

---

## 🗄️ Database Schema Overview

| Table | Purpose |
|-------|---------|
- **Architecture Guide**: [docs/architecture.md](docs/architecture.md)
- **GitHub Workflow**: [docs/github_workflow.md](docs/github_workflow.md)

---

## 👥 Team Module Assignments

### 1. Digu (Member 1)
**Core Focus:** Review & Rating System | Payment & Escrow System | Disputes & Counter Bids
- **Backend:** `/backend/reviews/`, `/backend/payments/`, `/backend/change_requests/`
- **Frontend:** `/frontend/src/pages/ReviewPage.jsx`, `/frontend/src/pages/PaymentPage.jsx`, `/frontend/src/pages/EscrowPaymentPage.jsx`, `/frontend/src/pages/AdminDisputesPage.jsx`, `/frontend/src/components/ReviewCard.jsx`

### 2. Poojita (Member 2)
**Core Focus:** User Auth | Registration | Profile Creation | Core UI Layout
- **Backend:** `/backend/auth/`
- **Frontend:** `/frontend/src/pages/LoginPage.jsx`, `/frontend/src/pages/SignupPage.jsx`, `/frontend/src/pages/ProfilePage.jsx`, `/frontend/src/context/AuthContext.jsx`, `/frontend/src/pages/HomePage.jsx`, `/frontend/src/pages/Dashboard.jsx`, `/frontend/src/pages/FreelancersPage.jsx`, `/frontend/src/components/Navbar.jsx`, `/frontend/src/components/Navbar.css`, `/frontend/src/components/PageBackground.jsx`, `/frontend/src/services/api.js`, `/frontend/src/App.jsx`

### 3. Alekhya (Member 3)
**Core Focus:** Client Proposal Review | Freelancer Proposal Submission | AI Gig Recommendations
- **Backend:** `/backend/bids/`
- **Frontend:** `/frontend/src/pages/BidFormPage.jsx`, `/frontend/src/components/BidCard.jsx`

### 4. Harshita (Member 4)
**Core Focus:** Project Infrastructure | DevOps | Notifications | Support Tickets | Saved Gigs
- **Backend Core:** `/backend/notifications/`, `/backend/support/`, `/backend/main.py`, `/backend/config.py`, `/backend/database.py`, `/backend/migrate_to_postgres.py`, `/backend/alter_tables.py`, `/backend/Dockerfile`, `/backend/requirements.txt`, `/backend/.env`
- **Frontend Core:** `/frontend/src/context/NotificationContext.jsx`, `/frontend/src/pages/SavedJobsPage.jsx`, `/frontend/src/main.jsx`, `/frontend/src/index.css`, `/frontend/vite.config.js`, `/frontend/tailwind.config.js`, `/frontend/postcss.config.js`, `/frontend/Dockerfile`, `/frontend/package.json`, `/frontend/package-lock.json`, `/frontend/index.html`
- **Shared Docs:** `/database/schema.sql`, `/docs/`, `/tests/`, `PRD.md`, `README.md`, `docker-compose.yml`, `.gitignore`

### 5. Pallavi (Member 5)
**Core Focus:** Project Work Submission | Messaging System | File & Image Uploads
- **Backend:** `/backend/projects/`, `/backend/messages/`, `/backend/uploads/`, `/backend/uploads_router.py`
- **Frontend:** `/frontend/src/pages/SubmitWorkPage.jsx`, `/frontend/src/pages/ProjectDashboard.jsx`, `/frontend/src/pages/MessagesPage.jsx`, `/frontend/src/pages/InboxPage.jsx`

### 6. Shekhar (Member 6)
**Core Focus:** Gig Listing | Gig Posting | Application Sidebar Engine
- **Backend:** `/backend/jobs/`, `/backend/test_get_jobs.py`
- **Frontend:** `/frontend/src/pages/JobListPage.jsx`, `/frontend/src/pages/JobDetailsPage.jsx`, `/frontend/src/pages/NewJobPage.jsx`, `/frontend/src/components/JobCard.jsx`, `/frontend/src/components/Sidebar.jsx`
