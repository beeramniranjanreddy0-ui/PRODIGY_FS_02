from datetime import date, datetime
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.config import settings
from backend.database import engine, SessionLocal, Base
from backend.models import User, Employee
from backend.security import hash_password
from backend.routers import auth, employees


def startup_db_seed():
    """Create database tables and seed initial administrator and sample employee data."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Seed Default Administrator if not present
        admin_user = db.query(User).filter(User.email == settings.ADMIN_DEFAULT_EMAIL).first()
        if not admin_user:
            admin_user = User(
                email=settings.ADMIN_DEFAULT_EMAIL,
                username="Administrator",
                hashed_password=hash_password(settings.ADMIN_DEFAULT_PASSWORD),
                role="admin",
                is_active=True
            )
            db.add(admin_user)

        # Seed Standard Non-Admin User for RBAC testing
        regular_user = db.query(User).filter(User.email == "staff@prodigy.com").first()
        if not regular_user:
            regular_user = User(
                email="staff@prodigy.com",
                username="Staff Member",
                hashed_password=hash_password("StaffPassword@2026"),
                role="user",
                is_active=True
            )
            db.add(regular_user)

        db.commit()

        # Seed initial sample employees if database is empty
        employee_count = db.query(Employee).count()
        if employee_count == 0:
            sample_employees = [
                Employee(
                    id="EMP-1001",
                    full_name="Sarah Jenkins",
                    email="sarah.jenkins@prodigyinfotech.com",
                    phone_number="+1-555-0101",
                    department="Engineering",
                    job_title="Lead Software Engineer",
                    employment_status="Active",
                    date_of_joining=date(2023, 2, 15),
                    notes="Core platform maintainer and tech lead for cloud systems."
                ),
                Employee(
                    id="EMP-1002",
                    full_name="Michael Chen",
                    email="michael.chen@prodigyinfotech.com",
                    phone_number="+1-555-0102",
                    department="Engineering",
                    job_title="Frontend Developer",
                    employment_status="Active",
                    date_of_joining=date(2023, 6, 1),
                    notes="React and UI/UX design systems specialist."
                ),
                Employee(
                    id="EMP-1003",
                    full_name="Amara Okafor",
                    email="amara.okafor@prodigyinfotech.com",
                    phone_number="+1-555-0103",
                    department="Human Resources",
                    job_title="HR Operations Manager",
                    employment_status="Active",
                    date_of_joining=date(2022, 11, 10),
                    notes="Talent acquisition, onboarding, and employee relations."
                ),
                Employee(
                    id="EMP-1004",
                    full_name="David Rodriguez",
                    email="david.rodriguez@prodigyinfotech.com",
                    phone_number="+1-555-0104",
                    department="Finance",
                    job_title="Senior Financial Analyst",
                    employment_status="Active",
                    date_of_joining=date(2023, 1, 20),
                    notes="Quarterly audits and financial planning."
                ),
                Employee(
                    id="EMP-1005",
                    full_name="Elena Rostova",
                    email="elena.rostova@prodigyinfotech.com",
                    phone_number="+1-555-0105",
                    department="Marketing",
                    job_title="Growth Marketing Specialist",
                    employment_status="Inactive",
                    date_of_joining=date(2022, 8, 15),
                    notes="Currently on sabbatical leave."
                ),
                Employee(
                    id="EMP-1006",
                    full_name="James Wilson",
                    email="james.wilson@prodigyinfotech.com",
                    phone_number="+1-555-0106",
                    department="Operations",
                    job_title="DevOps Engineer",
                    employment_status="Active",
                    date_of_joining=date(2023, 9, 5),
                    notes="CI/CD pipelines, container orchestration, and monitoring."
                ),
                Employee(
                    id="EMP-1007",
                    full_name="Priya Patel",
                    email="priya.patel@prodigyinfotech.com",
                    phone_number="+1-555-0107",
                    department="Product",
                    job_title="Product Manager",
                    employment_status="Active",
                    date_of_joining=date(2023, 4, 18),
                    notes="Cross-functional product roadmaps and user research."
                )
            ]
            db.add_all(sample_employees)
            db.commit()
    finally:
        db.close()


@asynccontextmanager
async def lifespan(app: FastAPI):
    startup_db_seed()
    yield


app = FastAPI(
    title="Prodigy Infotech - Employee Management System API",
    description="Task 2: RESTful API for Employee Management System with JWT Authentication and Role-Based Authorization",
    version=settings.VERSION,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
    lifespan=lifespan
)

# Enable CORS for frontend Vite client
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register API Routers under /api
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(employees.router, prefix=settings.API_V1_PREFIX)


@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "Prodigy Infotech EMS API",
        "timestamp": datetime.utcnow().isoformat()
    }
