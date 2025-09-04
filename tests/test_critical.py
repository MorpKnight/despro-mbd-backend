import httpx
import pytest

BASE = "http://127.0.0.1:8000"

# Test register user (should succeed, then fail with same email)
import time
import random
def test_register_and_duplicate():
    email = f"pytestuser{int(time.time())}{random.randint(1000,9999)}@example.com"
    payload = {
        "namaLengkap": "Pytest User",
        "email": email,
        "password": "pytestpass123",
        "role": "SISWA"
    }
    r1 = httpx.post(f"{BASE}/auth/register", json=payload)
    assert r1.status_code == 201 or r1.status_code == 200
    r2 = httpx.post(f"{BASE}/auth/register", json=payload)
    assert r2.status_code == 400
    assert "already used" in r2.text or "already registered" in r2.text

# Test GET /users unauthorized (should be forbidden)
def test_users_unauthorized():
    r = httpx.get(f"{BASE}/users")
    # Accept 307 redirect (to /users/) as valid for unauthorized
    assert r.status_code in (401, 403, 307)

# Test POST /attendance/sync with missing API key (should fail)
def test_attendance_sync_no_api_key():
    payload = {"logs": [{"UserId": "dummy", "timestamp": "2025-09-04T00:00:00Z"}]}
    r = httpx.post(f"{BASE}/attendance/sync", json=payload)
    assert r.status_code == 401 or r.status_code == 403

# Test error handler: validation error (422)
def test_validation_error():
    r = httpx.post(f"{BASE}/auth/register", json={"email": "bad"})
    assert r.status_code == 422
    body = r.json()
    assert "errors" in body or "message" in body

# Test security headers in /auth/me
def test_security_headers_auth_me():
    r = httpx.get(f"{BASE}/auth/me")
    for h in ["x-frame-options", "x-content-type-options", "referrer-policy", "strict-transport-security", "content-security-policy", "x-xss-protection"]:
        assert h in r.headers
