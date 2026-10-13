import math
import re
from typing import Optional, Dict
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_, func
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Employee, User
from backend.schemas import (
    EmployeeCreate,
    EmployeeUpdate,
    EmployeeResponse,
    EmployeeListResponse,
    EmployeeStatsResponse
)
from backend.dependencies import get_current_admin

router = APIRouter(prefix="/employees", tags=["Employee Management"])


def generate_employee_id(db: Session) -> str:
    """Generate a sequential, system-assigned unique employee ID (e.g. EMP-1001)."""
    employees = db.query(Employee.id).all()
    max_num = 1000
    for (emp_id,) in employees:
        match = re.match(r"^EMP-(\d+)$", str(emp_id))
        if match:
            num = int(match.group(1))
            if num > max_num:
                max_num = num
    return f"EMP-{max_num + 1}"


@router.get("/stats/summary", response_model=EmployeeStatsResponse)
def get_employee_stats(
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve aggregate statistics for the Employee Management Dashboard."""
    total = db.query(Employee).count()
    active = db.query(Employee).filter(Employee.employment_status == "Active").count()
    inactive = db.query(Employee).filter(Employee.employment_status == "Inactive").count()
    
    dept_rows = db.query(Employee.department, func.count(Employee.id)).group_by(Employee.department).all()
    dept_dict: Dict[str, int] = {dept: count for dept, count in dept_rows if dept}
    
    return EmployeeStatsResponse(
        total=total,
        active=active,
        inactive=inactive,
        departments_count=len(dept_dict),
        department_distribution=dept_dict
    )


@router.get("", response_model=EmployeeListResponse)
def list_employees(
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(10, ge=1, le=100, description="Items per page"),
    q: Optional[str] = Query(None, description="Search term for name, email, department, job title"),
    department: Optional[str] = Query(None, description="Filter by department"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by status (Active / Inactive)"),
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """List employees with pagination, search, and department/status filters."""
    query = db.query(Employee)

    if q and q.strip():
        term = f"%{q.strip().lower()}%"
        query = query.filter(
            or_(
                func.lower(Employee.id).like(term),
                func.lower(Employee.full_name).like(term),
                func.lower(Employee.email).like(term),
                func.lower(Employee.department).like(term),
                func.lower(Employee.job_title).like(term)
            )
        )

    if department and department.strip():
        query = query.filter(Employee.department == department.strip())

    if status_filter and status_filter.strip():
        query = query.filter(Employee.employment_status == status_filter.strip())

    total = query.count()
    total_pages = math.ceil(total / page_size) if total > 0 else 1
    offset = (page - 1) * page_size

    employees = query.order_by(Employee.created_at.desc()).offset(offset).limit(page_size).all()

    return EmployeeListResponse(
        items=[EmployeeResponse.model_validate(emp) for emp in employees],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=total_pages
    )


@router.get("/{employee_id}", response_model=EmployeeResponse)
def get_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Retrieve details of a single employee by their system ID."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee record with ID '{employee_id}' was not found"
        )
    return EmployeeResponse.model_validate(employee)


@router.post("", response_model=EmployeeResponse, status_code=status.HTTP_201_CREATED)
def create_employee(
    emp_in: EmployeeCreate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Create a new employee record after server-side validation and conflict checking."""
    existing_email = db.query(Employee).filter(Employee.email == emp_in.email).first()
    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"An employee with email '{emp_in.email}' already exists in the system"
        )

    new_id = generate_employee_id(db)
    employee = Employee(
        id=new_id,
        full_name=emp_in.full_name,
        email=emp_in.email,
        phone_number=emp_in.phone_number,
        department=emp_in.department,
        job_title=emp_in.job_title,
        employment_status=emp_in.employment_status,
        date_of_joining=emp_in.date_of_joining,
        notes=emp_in.notes
    )

    try:
        db.add(employee)
        db.commit()
        db.refresh(employee)
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to save employee record due to a database error"
        )

    return EmployeeResponse.model_validate(employee)


@router.put("/{employee_id}", response_model=EmployeeResponse)
def update_employee(
    employee_id: str,
    emp_update: EmployeeUpdate,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Update an existing employee record."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee record with ID '{employee_id}' was not found"
        )

    # Check for duplicate email if email is being modified
    if emp_update.email and emp_update.email != employee.email:
        email_conflict = db.query(Employee).filter(
            Employee.email == emp_update.email,
            Employee.id != employee_id
        ).first()
        if email_conflict:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Another employee with email '{emp_update.email}' already exists"
            )

    update_data = emp_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(employee, field, value)

    try:
        db.commit()
        db.refresh(employee)
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update employee record due to a database error"
        )

    return EmployeeResponse.model_validate(employee)


@router.delete("/{employee_id}", status_code=status.HTTP_200_OK)
def delete_employee(
    employee_id: str,
    db: Session = Depends(get_db),
    admin: User = Depends(get_current_admin)
):
    """Delete an employee record by system ID with authorization and confirmation."""
    employee = db.query(Employee).filter(Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Employee record with ID '{employee_id}' was not found"
        )

    try:
        db.delete(employee)
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete employee record due to a database error"
        )

    return {"message": f"Employee {employee_id} deleted successfully", "deleted_id": employee_id}
