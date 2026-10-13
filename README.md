# Employee Management System (EMS)

A full-stack, enterprise-grade Employee Management System built with **React 19**, **FastAPI**, **SQLAlchemy 2.0**, and **Tailwind CSS**. Designed for organizations to manage personnel directories, track departmental metrics, enforce cryptographic authentication, and handle employee lifecycles with role-based access controls.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                       Client Browser                        │
│          React 19 SPA • Tailwind CSS • Lucide Icons        │
└──────────────────────────────┬──────────────────────────────┘
                               │
                HTTP / REST    │  Authorization: Bearer <JWT>
                Port 3000      ▼
┌─────────────────────────────────────────────────────────────┐
│                    FastAPI Backend (Python)                 │
│         Argon2id Security • Pydantic v2 • JWT Tokens        │
└──────────────────────────────┬──────────────────────────────┘
                               │
               SQLAlchemy 2.0  │  Alembic Database Migrations
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                 Relational Database Storage                 │
│                   SQLite / PostgreSQL                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Key Features

- **Master Secret Code Protection**: Administrator authentication and new admin registration are protected by a configurable Master Secret Security Code (`ADMIN_SECRET_CODE`).
- **Comprehensive Employee Directory**:
  - Auto-assigned corporate identifiers (`EMP-1001`, `EMP-1002`, ...).
  - Search across names, emails, departments, job titles, and IDs.
  - Multi-parameter filtering by Department and Employment Status (`Active` / `Inactive`).
  - Server-side and client-side pagination with custom page sizes.
- **Real-Time Analytics Dashboard**:
  - Live metric cards for total headcount, active status count, inactive ratio, and department distributions.
- **Client-Side CSV Export**:
  - Instant one-click export of complete employee rosters formatted for spreadsheet tools.
- **Cryptographic Security**:
  - **Argon2id** password hashing with unique salts (OWASP-recommended).
  - Stateles **JWT (JSON Web Tokens)** with access and refresh token rotation.
  - Strict unique email constraints and RFC-compliant validation.
- **Resilient Multi-Mode Execution**:
  - Operates as a seamless standalone React web app with dev-server API middleware or connects directly to the Python FastAPI backend.

---

## Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS v4, Lucide React |
| **Backend** | Python 3.10+, FastAPI, Uvicorn, Pydantic v2 |
| **Database & ORM** | SQLAlchemy 2.0, SQLite (default) / PostgreSQL, Alembic |
| **Security & Auth** | Argon2id (`passlib`), Python-Jose (JWT), Secret Code Verification |
| **Testing** | Vitest (Frontend UI & state tests), Pytest & HTTPX (Backend API tests) |

---

## Project Structure

```
.
├── backend/                  # FastAPI Application
│   ├── config.py             # App configuration & environment settings
│   ├── database.py           # SQLAlchemy engine & session factory
│   ├── dependencies.py       # Authentication & DB session dependencies
│   ├── main.py               # FastAPI entry point & CORS configuration
│   ├── models.py             # Database models (User, Employee)
│   ├── schemas.py            # Pydantic request/response schemas
│   ├── security.py           # Argon2id hashing & JWT token generators
│   └── routers/
│       ├── auth.py           # Login, registration, token refresh routes
│       └── employees.py      # Employee CRUD & analytics summary routes
├── src/                      # React Frontend
│   ├── components/           # UI Modals, tables, navbar, and stat cards
│   ├── api.ts                # HTTP client with resilient fallback handling
│   ├── types.ts              # TypeScript interfaces and contracts
│   ├── App.tsx               # Primary dashboard layout
│   └── main.tsx              # Application entry point
├── alembic/                  # Database migration version scripts
├── tests/                    # Backend Pytest test suite
├── .env.example              # Environment variables template
├── package.json              # Frontend scripts & dependencies
└── requirements.txt          # Python dependencies
```

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ and **npm**
- **Python** 3.10+ and **pip**

### 2. Environment Configuration
Copy the sample environment file:
```bash
cp .env.example .env
```

Default credentials configured in `.env.example`:
- **Default Admin Email**: `admin@prodigy.com`
- **Default Admin Password**: `AdminPassword@2026`
- **Master Admin Secret Code**: `PRODIGY@2026`

---

### 3. Frontend Setup
Install npm packages and launch the development server:
```bash
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

### 4. Backend Setup (Optional for Full-Stack Python Mode)
Create a Python virtual environment and install backend dependencies:
```bash
python3 -m venv venv
source venv/bin/activate    # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

Run database migrations:
```bash
alembic upgrade head
```

Start the FastAPI application:
```bash
uvicorn backend.main:app --port 8000 --reload
```
Interactive API documentation will be available at [http://localhost:8000/docs](http://localhost:8000/docs).

---

## API Endpoints

### Authentication
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Authenticate with email, password, and admin secret code |
| `POST` | `/api/auth/register` | Register new administrator (requires admin secret code) |
| `POST` | `/api/auth/refresh` | Refresh access token using refresh token |
| `GET` | `/api/auth/me` | Retrieve profile of authenticated user |
| `POST` | `/api/auth/logout` | Revoke session tokens |

### Employee Management
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/employees` | Search, filter, and paginate employee records |
| `POST` | `/api/employees` | Create a new employee record |
| `GET` | `/api/employees/{id}` | Retrieve individual employee details |
| `PUT` | `/api/employees/{id}` | Update existing employee record |
| `DELETE` | `/api/employees/{id}` | Remove employee record |
| `GET` | `/api/employees/stats/summary`| Aggregated departmental & headcount analytics |

---

## Running Automated Tests

### Frontend Test Suite (Vitest)
Executes unit tests verifying dashboard rendering, modal transitions, and table actions:
```bash
npm test
```

### Backend Test Suite (Pytest)
Executes comprehensive API test cases with an isolated in-memory database:
```bash
pytest -v
```

---

## License
Distributed under the Apache-2.0 License.
