from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from slowapi.errors import RateLimitExceeded
from fastapi.responses import JSONResponse
from app.core.rate_limit import limiter
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from slowapi.middleware import SlowAPIMiddleware
from app.middlewares.security import SecurityHeadersMiddleware

from app.core.config import settings
import os
import sys
from loguru import logger
from app.api.routers.health import router as health_router
from app.api.routers.auth import router as auth_router
from app.api.routers.user import router as user_router
from app.api.routers.attendance import router as attendance_router
from app.api.routers.catering import router as catering_router
from app.api.routers.feedback import router as feedback_router
from app.api.routers.emergency_report import router as emergency_report_router
from app.api.routers.reports import router as reports_router
from app.api.routers.dashboard import router as dashboard_router
from app.middlewares.errors import add_exception_handlers
from app.models import Base, User
from app.db.session import engine, SessionLocal
from sqlalchemy import select
from app.core.config import settings

logger.remove()
logger.add(sys.stdout, level=settings.LOG_LEVEL.upper(), format="{time:YYYY-MM-DD HH:mm:ss} | {level} | {message}")

app = FastAPI(
    title="MBG Backend (FastAPI)",
    description=(
        "MBG Review & Track API provides authentication, user management, attendance synchronization, "
        "catering menu, student feedback, emergency reports, and dashboards."
    ),
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    contact={
        "name": "MBG Backend",
        "email": "support@example.com",
    },
)

# Tags metadata for better grouping in Swagger
tags_metadata = [
    {"name": "auth", "description": "Authentication and user session"},
    {"name": "users", "description": "User management (admin/masteradmin)"},
    {"name": "attendance", "description": "Attendance sync from device"},
    {"name": "catering", "description": "Catering logs"},
    {"name": "feedback", "description": "Student feedback"},
    {"name": "emergency-report", "description": "Emergency reporting"},
    {"name": "dashboard", "description": "Dashboards"},
    {"name": "reports", "description": "Summary reports"},
]
app.openapi_tags = tags_metadata

# Inject servers info into OpenAPI schema for parity with Express docs
def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title=app.title,
        version=app.version,
        description=app.description,
        routes=app.routes,
    )
    openapi_schema["servers"] = [
        {"url": "http://localhost:8000", "description": "Development"},
        {"url": "https://mbg.mrt.qzz.io", "description": "Production"},
    ]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi  # type: ignore

# Rate limiter (SlowAPI)
app.state.limiter = limiter
@app.exception_handler(RateLimitExceeded)
async def rate_limit_handler(request, exc):
    return JSONResponse(status_code=429, content={"message": "Too many requests, please try again later."})

# Trusted hosts (optional)
trusted_hosts = [h.strip() for h in settings.TRUSTED_HOSTS.split(",") if h.strip()]
app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

# Rate limit middleware
app.add_middleware(SlowAPIMiddleware)

# Security headers (Helmet parity, can be disabled via env)
if settings.SECURITY_ENABLED:
    app.add_middleware(SecurityHeadersMiddleware)

# CORS whitelist (can be disabled via env)
if settings.CORS_ENABLED:
    cors_origins = [o.strip() for o in settings.CORS_WHITELIST.split(",") if o.strip()]
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Routers
app.include_router(health_router)
app.include_router(auth_router)
app.include_router(user_router)
app.include_router(attendance_router)
app.include_router(catering_router)
app.include_router(feedback_router)
app.include_router(emergency_report_router)
app.include_router(reports_router)
app.include_router(dashboard_router)

# Errors
add_exception_handlers(app)

# 404/405 error handlers to standardize message key
from fastapi.requests import Request
from starlette.exceptions import HTTPException as StarletteHTTPException
from fastapi import HTTPException
from fastapi.responses import JSONResponse

@app.exception_handler(StarletteHTTPException)
async def starlette_http_exception_handler(request: Request, exc: StarletteHTTPException):
    if exc.status_code in (404, 405):
        # Standardize Express-like message
        msg = "Not Found" if exc.status_code == 404 else "Method Not Allowed"
        return JSONResponse(status_code=exc.status_code, content={"message": msg})
    # fallback to default
    return JSONResponse(status_code=exc.status_code, content={"message": str(exc.detail)})

@app.get("/")
def root():
    return {"message": "MBG FastAPI is running"}


@app.on_event("startup")
def on_startup():
    # Create tables
    Base.metadata.create_all(bind=engine)
    if settings.SEED_MASTER_ADMIN:
        # Seed Master Admin if not exists
        with SessionLocal() as db:
            exists = db.execute(select(User).where(User.role == "MASTERADMIN")).scalars().first()
            if not exists:
                ua = User(
                    namaLengkap="Master Admin",
                    email="christoffelsihombing@gmail.com",
                    role="MASTERADMIN",
                )
                ua.set_password("masteradmin123")
                db.add(ua)
                db.commit()
