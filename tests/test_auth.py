import pytest
import httpx
import time

BASE = "http://127.0.0.1:8000"

def test_login_unauthorized():
    resp = httpx.post(f"{BASE}/auth/login", json={"email": "nope@example.com", "password": "wrong"})
    assert resp.status_code == 401
    body = resp.json()
    assert body.get("message") == "Invalid credentials"

def test_rate_limit_login():
    # Hit 6 times to trigger limiter 5/min
    codes = []
    for _ in range(6):
        r = httpx.post(f"{BASE}/auth/login", json={"email": "nope@example.com", "password": "wrong"})
        codes.append(r.status_code)
        time.sleep(0.5)
    assert 429 in codes

def test_me_unauthorized():
    r = httpx.get(f"{BASE}/auth/me")
    assert r.status_code == 401
    body = r.json()
    assert "message" in body
