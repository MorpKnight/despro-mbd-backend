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
        # Content-Security-Policy for Swagger UI compatibility
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' https://cdn.jsdelivr.net 'unsafe-inline'; "
            "style-src 'self' https://cdn.jsdelivr.net; "
            "img-src 'self' https://fastapi.tiangolo.com data:; "
            "connect-src 'self' https://cdn.jsdelivr.net; "
        )
        # X-XSS-Protection (legacy, but for parity)
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response
