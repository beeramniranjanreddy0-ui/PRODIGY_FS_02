from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Date, Text
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    username = Column(String(100), nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(50), nullable=False, default="user")  # 'admin' or 'user'
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def is_admin(self) -> bool:
        return self.role == "admin"


class Employee(Base):
    __tablename__ = "employees"

    id = Column(String(64), primary_key=True, index=True)  # System-generated ID e.g. EMP-1001
    full_name = Column(String(150), nullable=False, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone_number = Column(String(50), nullable=False)
    department = Column(String(100), nullable=False, index=True)
    job_title = Column(String(100), nullable=False)
    employment_status = Column(String(50), nullable=False, default="Active", index=True)  # 'Active' or 'Inactive'
    date_of_joining = Column(Date, nullable=False)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
