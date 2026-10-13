import re
from datetime import datetime, date
from typing import Optional, List, Dict, Literal
from pydantic import BaseModel, Field, EmailStr, field_validator

PHONE_REGEX = re.compile(r"^(\+?[0-9]{1,4}[-.\s]?)?(\(?\d{2,5}\)?[-.\s]?)?[\d\s.-]{5,15}$")

# ================= AUTH SCHEMAS =================

class UserBase(BaseModel):
    email: str = Field(..., max_length=255)
    username: str = Field(..., min_length=2, max_length=100)

    @field_validator("email")
    @classmethod
    def validate_email_format(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid email address format")
        return v

    @field_validator("username")
    @classmethod
    def normalize_username(cls, v: str) -> str:
        return v.strip()

class UserRegister(UserBase):
    password: str = Field(..., min_length=8, max_length=128)
    role: Optional[Literal["admin", "user"]] = "user"
    secret_code: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str
    secret_code: Optional[str] = None

    @field_validator("email")
    @classmethod
    def normalize_email(cls, v: str) -> str:
        return v.strip().lower()

class UserResponse(BaseModel):
    id: int
    email: str
    username: str
    role: str
    is_active: bool
    created_at: datetime

    model_config = {"from_attributes": True}

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

class RefreshTokenRequest(BaseModel):
    refresh_token: str


# ================= EMPLOYEE SCHEMAS =================

class EmployeeBase(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=150)
    email: str = Field(..., max_length=255)
    phone_number: str = Field(..., min_length=7, max_length=30)
    department: str = Field(..., min_length=2, max_length=100)
    job_title: str = Field(..., min_length=2, max_length=100)
    employment_status: Literal["Active", "Inactive"] = "Active"
    date_of_joining: date
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, v: str) -> str:
        v = v.strip()
        if len(v) < 2:
            raise ValueError("Full name must be at least 2 characters")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: str) -> str:
        v = v.strip().lower()
        if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
            raise ValueError("Invalid employee email format")
        return v

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: str) -> str:
        v = v.strip()
        if not PHONE_REGEX.match(v):
            raise ValueError("Invalid phone number format. Examples: +1-555-0199 or 555-123-4567")
        return v

    @field_validator("department")
    @classmethod
    def clean_department(cls, v: str) -> str:
        return v.strip()

    @field_validator("job_title")
    @classmethod
    def clean_title(cls, v: str) -> str:
        return v.strip()


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeUpdate(BaseModel):
    full_name: Optional[str] = Field(None, min_length=2, max_length=150)
    email: Optional[str] = Field(None, max_length=255)
    phone_number: Optional[str] = Field(None, min_length=7, max_length=30)
    department: Optional[str] = Field(None, min_length=2, max_length=100)
    job_title: Optional[str] = Field(None, min_length=2, max_length=100)
    employment_status: Optional[Literal["Active", "Inactive"]] = None
    date_of_joining: Optional[date] = None
    notes: Optional[str] = Field(None, max_length=1000)

    @field_validator("full_name")
    @classmethod
    def clean_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 2:
                raise ValueError("Full name must be at least 2 characters")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().lower()
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
                raise ValueError("Invalid employee email format")
        return v

    @field_validator("phone_number")
    @classmethod
    def clean_phone(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if not PHONE_REGEX.match(v):
                raise ValueError("Invalid phone number format")
        return v


class EmployeeResponse(BaseModel):
    id: str
    full_name: str
    email: str
    phone_number: str
    department: str
    job_title: str
    employment_status: str
    date_of_joining: date
    notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EmployeeListResponse(BaseModel):
    items: List[EmployeeResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class EmployeeStatsResponse(BaseModel):
    total: int
    active: int
    inactive: int
    departments_count: int
    department_distribution: Dict[str, int]
