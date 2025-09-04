from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

# Helmet-like security headers for FastAPI/Starlette
class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response: Response = await call_next(request)
        # X-Frame-Options
        response.headers["X-Frame-Options"] = "DENY"
        # X-Content-Type-Options
        response.headers["X-Content-Type-Options"] = "nosniff"
        # Referrer-Policy
        response.headers["Referrer-Policy"] = "no-referrer"
        # Strict-Transport-Security
        response.headers["Strict-Transport-Security"] = "max-age=63072000; includeSubDomains; preload"
        # Content-Security-Policy (basic)
        response.headers["Content-Security-Policy"] = "default-src 'self'"
        # X-XSS-Protection (legacy, but for parity)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
