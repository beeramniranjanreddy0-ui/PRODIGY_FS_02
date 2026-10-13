import os
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.database import Base, get_db
from backend.main import app
from backend.models import User, Employee
from backend.security import hash_password, create_access_token

TEST_DATABASE_URL = "sqlite:///./test_temp.db"
test_engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)

@pytest.fixture(scope="session", autouse=True)
def setup_test_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)
    if os.path.exists("./test_temp.db"):
        try:
            os.remove("./test_temp.db")
        except OSError:
            pass

@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()
    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()

@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

@pytest.fixture
def admin_user(db_session):
    user = User(
        email="test_admin@prodigy.com",
        username="TestAdmin",
        hashed_password=hash_password("AdminPass@123"),
        role="admin",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def regular_user(db_session):
    user = User(
        email="test_user@prodigy.com",
        username="TestUser",
        hashed_password=hash_password("UserPass@123"),
        role="user",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    db_session.refresh(user)
    return user

@pytest.fixture
def admin_token(admin_user):
    return create_access_token({"sub": str(admin_user.id), "email": admin_user.email, "role": admin_user.role})

@pytest.fixture
def user_token(regular_user):
    return create_access_token({"sub": str(regular_user.id), "email": regular_user.email, "role": regular_user.role})
