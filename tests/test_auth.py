def test_user_registration(client):
    response = client.post(
        "/api/auth/register",
        json={
            "email": "newuser@prodigy.com",
            "username": "New User",
            "password": "Password@123",
            "role": "user"
        }
    )
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["user"]["email"] == "newuser@prodigy.com"
    assert data["user"]["role"] == "user"

def test_duplicate_email_registration(client):
    payload = {
        "email": "dup@prodigy.com",
        "username": "First User",
        "password": "Password@123"
    }
    res1 = client.post("/api/auth/register", json=payload)
    assert res1.status_code == 201

    res2 = client.post("/api/auth/register", json=payload)
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

def test_login_success(client, admin_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test_admin@prodigy.com", "password": "AdminPass@123", "secret_code": "PRODIGY@2026"}
    )
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["email"] == "test_admin@prodigy.com"
    assert data["user"]["role"] == "admin"

def test_login_invalid_secret_code(client, admin_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test_admin@prodigy.com", "password": "AdminPass@123", "secret_code": "WRONG_SECRET"}
    )
    assert response.status_code == 403
    assert "Invalid Administrator Secret Code" in response.json()["detail"]

def test_login_invalid_password(client, admin_user):
    response = client.post(
        "/api/auth/login",
        json={"email": "test_admin@prodigy.com", "password": "WrongPassword", "secret_code": "PRODIGY@2026"}
    )
    assert response.status_code == 401
    assert "Invalid email or password" in response.json()["detail"]

def test_get_current_user_profile(client, admin_token):
    response = client.get(
        "/api/auth/me",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 200
    assert response.json()["email"] == "test_admin@prodigy.com"

def test_unauthenticated_me_request(client):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
