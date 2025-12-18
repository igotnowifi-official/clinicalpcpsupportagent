"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import uvicorn
from typing import Optional, Dict, Any
from fastapi import FastAPI, Request, Response, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

from api.config import settings
from api.routes import (
    clinician,
    questionnaire,
    intake,
    assistant_actions,
    messaging,
    checkin,
    triage,
    memory
)
from api.services.audit_logger import get_audit_logger

# Helper function for audit events
async def emit_audit_event(event_type: str, actor_type: str, actor_id: Optional[str] = None, 
                          session_token: Optional[str] = None, patient_id: Optional[str] = None,
                          metadata: Optional[Dict[str, Any]] = None):
    """Helper to emit audit events"""
    audit_logger = get_audit_logger()
    return audit_logger.log_event(
        event_type=event_type,
        actor_type=actor_type,
        actor_id=actor_id,
        session_token=session_token,
        patient_id=patient_id,
        metadata=metadata or {}
    )

APP_METADATA = {
    "title": settings.APP_NAME,
    "version": settings.VERSION,
    "description": (
        "Clinic-grade Intake, Triage, Decision Support, "
        "and Patient Communication System - Clinician-in-the-Loop"
    ),
    "docs_url": "/api/docs",
    "redoc_url": "/api/redoc",
    "openapi_url": "/api/openapi.json",
}

app = FastAPI(**APP_METADATA)

# CORS setup: allow only clinic/trusted frontends and local dev access
if settings.ENV in ("development",):
    origins = [
        "http://localhost",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        settings.FRONTEND_URL
    ]
else:
    origins = [
        settings.FRONTEND_URL
    ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Session (cookie) middleware for PIN/SSO mock and patient limited sessions
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.SECRET_KEY,
    session_cookie=settings.SESSION_COOKIE_NAME,
    max_age=60 * settings.SESSION_EXPIRE_MINUTES
)

# Knowledge pack is loaded lazily by TriageEngine when first used
# No need to pre-load on startup

# --- ROUTERS (MUST MATCH SYSTEM WORKFLOWS: DO NOT REMOVE OR COLLAPSE) ---
app.include_router(clinician.router, prefix=settings.API_PREFIX + "/clinician", tags=["Clinician"])
app.include_router(questionnaire.router, prefix=settings.API_PREFIX + "/questionnaire", tags=["Questionnaire"])
app.include_router(intake.router, prefix=settings.API_PREFIX + "/intake", tags=["Intake"])
app.include_router(triage.router, prefix=settings.API_PREFIX + "/triage", tags=["Triage"])
app.include_router(assistant_actions.router, prefix=settings.API_PREFIX + "/assistant", tags=["Assistant"])
app.include_router(messaging.router, prefix=settings.API_PREFIX + "/communication", tags=["Communication"])
app.include_router(checkin.router, prefix=settings.API_PREFIX + "/checkin", tags=["Check-In"])
app.include_router(memory.router, prefix=settings.API_PREFIX + "/memory", tags=["Memory"])

# --- ERROR HANDLING (for real-world pilot readiness) ---
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    await emit_audit_event(
        event_type="validation_error",
        actor_type="system",
        metadata={
            "url": str(request.url),
            "errors": exc.errors()
        }
    )
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={"detail": exc.errors(), "message": "Invalid input."},
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    await emit_audit_event(
        event_type="not_found",
        actor_type="system",
        metadata={
            "url": str(request.url)
        }
    )
    return JSONResponse(
        status_code=status.HTTP_404_NOT_FOUND,
        content={"detail": "Not Found"}
    )

@app.exception_handler(Exception)
async def generic_exception_handler(request: Request, exc: Exception):
    await emit_audit_event(
        event_type="internal_error",
        actor_type="system",
        metadata={
            "url": str(request.url),
            "error": str(exc)
        }
    )
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error."},
    )

# --- HEALTH CHECK & ROOT ---

@app.get("/", include_in_schema=False)
async def root():
    return RedirectResponse(url="/api/docs")

@app.get("/api/health", tags=["Health"])
async def health_check():
    return {"status": "ok", "app": settings.APP_NAME, "version": settings.VERSION}

# --- RUN APP ---

def run():
    """Entry point for running via python api/main.py"""
    uvicorn.run("api.main:app", host="0.0.0.0", port=8080, reload=settings.DEBUG)

if __name__ == "__main__":
    run()