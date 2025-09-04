from fastapi import Request, HTTPException, status
from app.models import School
from app.db.session import SessionLocal

def require_api_key(request: Request):
    api_key = request.headers.get("X-API-KEY")
    if not api_key:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key")
    with SessionLocal() as db:
        school = db.query(School).filter(School.apiKey == api_key).first()
        if not school:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key")
        return school
