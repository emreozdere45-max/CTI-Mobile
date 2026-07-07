from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_list_threats() -> None:
    response = client.get("/api/v1/threats")
    assert response.status_code == 200
    assert response.json()["meta"]["total"] >= 1


def test_search_ioc() -> None:
    response = client.get("/api/v1/iocs/search", params={"value": "malicious-example.com"})
    assert response.status_code == 200
    assert response.json()["data"]["detected_type"] == "domain"
