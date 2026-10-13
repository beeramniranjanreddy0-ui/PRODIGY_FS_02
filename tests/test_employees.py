from datetime import date
from backend.models import Employee

def test_admin_create_employee(client, admin_token):
    payload = {
        "full_name": "Alice Johnson",
        "email": "alice.johnson@prodigy.com",
        "phone_number": "+1-555-0199",
        "department": "Engineering",
        "job_title": "Backend Engineer",
        "employment_status": "Active",
        "date_of_joining": "2024-01-15",
        "notes": "Backend python specialist"
    }
    response = client.post(
        "/api/employees",
        json=payload,
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert response.status_code == 201
    data = response.json()
    assert data["id"].startswith("EMP-")
    assert data["full_name"] == "Alice Johnson"
    assert data["email"] == "alice.johnson@prodigy.com"
    assert data["department"] == "Engineering"

def test_unauthenticated_create_employee(client):
    payload = {
        "full_name": "Unauthorized User",
        "email": "unauth@prodigy.com",
        "phone_number": "+1-555-0000",
        "department": "Engineering",
        "job_title": "Developer",
        "employment_status": "Active",
        "date_of_joining": "2024-01-15"
    }
    response = client.post("/api/employees", json=payload)
    assert response.status_code == 401

def test_non_admin_forbidden_create_employee(client, user_token):
    payload = {
        "full_name": "Forbidden Employee",
        "email": "forbidden@prodigy.com",
        "phone_number": "+1-555-0000",
        "department": "HR",
        "job_title": "Recruiter",
        "employment_status": "Active",
        "date_of_joining": "2024-01-15"
    }
    response = client.post(
        "/api/employees",
        json=payload,
        headers={"Authorization": f"Bearer {user_token}"}
    )
    assert response.status_code == 403
    assert "Administrator privileges are required" in response.json()["detail"]

def test_duplicate_employee_email(client, admin_token):
    payload = {
        "full_name": "Bob Smith",
        "email": "bob.smith@prodigy.com",
        "phone_number": "+1-555-0200",
        "department": "Marketing",
        "job_title": "Specialist",
        "employment_status": "Active",
        "date_of_joining": "2024-02-01"
    }
    res1 = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res1.status_code == 201

    res2 = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert res2.status_code == 409
    assert "already exists" in res2.json()["detail"]

def test_invalid_phone_number_validation(client, admin_token):
    payload = {
        "full_name": "Invalid Phone",
        "email": "invalidphone@prodigy.com",
        "phone_number": "abc",  # Invalid
        "department": "Operations",
        "job_title": "Analyst",
        "employment_status": "Active",
        "date_of_joining": "2024-02-01"
    }
    response = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 422

def test_get_employee_by_id(client, admin_token):
    # First create an employee
    payload = {
        "full_name": "Clara Oswald",
        "email": "clara.oswald@prodigy.com",
        "phone_number": "+1-555-0300",
        "department": "Finance",
        "job_title": "Financial Analyst",
        "employment_status": "Active",
        "date_of_joining": "2024-03-01"
    }
    create_res = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    emp_id = create_res.json()["id"]

    # Fetch by ID
    get_res = client.get(f"/api/employees/{emp_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert get_res.status_code == 200
    assert get_res.json()["full_name"] == "Clara Oswald"

def test_get_nonexistent_employee(client, admin_token):
    response = client.get("/api/employees/EMP-99999", headers={"Authorization": f"Bearer {admin_token}"})
    assert response.status_code == 404
    assert "not found" in response.json()["detail"]

def test_update_employee(client, admin_token):
    # Create employee
    payload = {
        "full_name": "Daniel Craig",
        "email": "daniel.craig@prodigy.com",
        "phone_number": "+1-555-0400",
        "department": "Engineering",
        "job_title": "Junior Developer",
        "employment_status": "Active",
        "date_of_joining": "2024-01-10"
    }
    create_res = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    emp_id = create_res.json()["id"]

    # Update job title and status
    update_res = client.put(
        f"/api/employees/{emp_id}",
        json={"job_title": "Senior Developer", "employment_status": "Inactive"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert update_res.status_code == 200
    updated_data = update_res.json()
    assert updated_data["job_title"] == "Senior Developer"
    assert updated_data["employment_status"] == "Inactive"
    assert updated_data["full_name"] == "Daniel Craig"

def test_delete_employee(client, admin_token):
    # Create employee
    payload = {
        "full_name": "To Delete",
        "email": "todelete@prodigy.com",
        "phone_number": "+1-555-0500",
        "department": "Legal",
        "job_title": "Counsel",
        "employment_status": "Active",
        "date_of_joining": "2024-01-10"
    }
    create_res = client.post("/api/employees", json=payload, headers={"Authorization": f"Bearer {admin_token}"})
    emp_id = create_res.json()["id"]

    # Delete
    del_res = client.delete(f"/api/employees/{emp_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert del_res.status_code == 200
    assert del_res.json()["deleted_id"] == emp_id

    # Verify no longer exists
    get_res = client.get(f"/api/employees/{emp_id}", headers={"Authorization": f"Bearer {admin_token}"})
    assert get_res.status_code == 404

def test_list_employees_pagination_and_search(client, admin_token):
    # Create 3 employees
    for i in range(3):
        client.post(
            "/api/employees",
            json={
                "full_name": f"SearchTest User{i}",
                "email": f"search{i}@prodigy.com",
                "phone_number": f"+1-555-060{i}",
                "department": "Engineering" if i < 2 else "Sales",
                "job_title": "Developer",
                "employment_status": "Active",
                "date_of_joining": "2024-01-01"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )

    # Search query
    res = client.get(
        "/api/employees?q=SearchTest&page=1&page_size=2",
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert res.status_code == 200
    data = res.json()
    assert data["total"] >= 3
    assert len(data["items"]) == 2
    assert data["page"] == 1

def test_stats_summary_endpoint(client, admin_token):
    res = client.get("/api/employees/stats/summary", headers={"Authorization": f"Bearer {admin_token}"})
    assert res.status_code == 200
    data = res.json()
    assert "total" in data
    assert "active" in data
    assert "inactive" in data
    assert "departments_count" in data
    assert isinstance(data["department_distribution"], dict)
