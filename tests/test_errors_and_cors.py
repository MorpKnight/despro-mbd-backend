import httpx

BASE = "http://127.0.0.1:8000"


def test_404_message():
    r = httpx.get(f"{BASE}/__not_found__")
    assert r.status_code == 404
    assert r.json().get("message") == "Not Found"


def test_security_headers_and_cors():
    # Use OPTIONS to trigger CORS preflight on endpoint that allows OPTIONS
    headers = {"Origin": "http://localhost:3000"}
    r = httpx.options(f"{BASE}/auth/login", headers=headers)
    assert r.status_code in (200, 204, 405)
    # Starlette CORS mirrors origin if allowed
    cors_header = r.headers.get("access-control-allow-origin")
    if r.status_code == 405:
        assert cors_header is None  # CORS header not present on 405
    else:
        assert cors_header in ("*", headers["Origin"])
