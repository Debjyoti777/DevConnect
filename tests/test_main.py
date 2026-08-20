from fastapi.testclient import TestClient

from main import app


client = TestClient(app)


def test_root():
    response = client.get("/")

    assert response.status_code == 200
    assert response.json() == {
        "message": "Welcome to DevConnect API"
    }


def test_me_without_token():
    response = client.get("/me")

    assert response.status_code == 401

def test_me_with_fake_token():
    response = client.get(
        "/me",
        headers={
            "Authorization": "Bearer this-is-a-fake-jwt-token"
        }
    )

    assert response.status_code == 401

def test_login_wrong_password():
    response = client.post(
        "/auth/login",
        data={
            "username": "dj@gmail.com",
            "password": "WrongPassword123"
        }
    )

    assert response.status_code == 401

def test_projects_without_token():
    response = client.get("/projects/")

    assert response.status_code == 401