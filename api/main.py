"""
© 2025 igotnowifi, LLC
Proprietary and confidential.
"""

import uvicorn
from fastapi import FastAPI, Request, Response, status, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse

from starlette.middleware.sessions import SessionMiddleware
from starlette.responses import RedirectResponse

from api.config import settings
from api.routers import (
    auth,
    patient,
    staff,
    clinician,
    questionnaire,
    audit,
    intake,
    assistant,
    admin,
    communication,
    wrapup
)
from api.services.knowledge import knowledge_pack_initializer
from api.services.audit import emit_audit_event

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

# Instantiate and load knowledge pack (Excel)
@app.on_event("startup")
async def startup_load_knowledge_pack():
    knowledge_pack_initializer(settings.KNOWLEDGE_PACK_PATH)

# --- ROUTERS (MUST MATCH SYSTEM WORKFLOWS: DO NOT REMOVE OR COLLAPSE) ---
app.include_router(auth.router, prefix=settings.API_PREFIX + "/auth", tags=["Authentication"])
app.include_router(patient.router, prefix=settings.API_PREFIX + "/patient", tags=["Patient"])
app.include_router(staff.router, prefix=settings.API_PREFIX + "/staff", tags=["Staff"])
app.include_router(clinician.router, prefix=settings.API_PREFIX + "/clinician", tags=["Clinician"])
app.include_router(questionnaire.router, prefix=settings.API_PREFIX + "/questionnaire", tags=["Questionnaire"])
app.include_router(intake.router, prefix=settings.API_PREFIX + "/intake", tags=["Intake"])
app.include_router(assistant.router, prefix=settings.API_PREFIX + "/assistant", tags=["Assistant"])
app.include_router(wrapup.router, prefix=settings.API_PREFIX + "/wrapup", tags=["Clinical Wrap-Up"])
app.include_router(communication.router, prefix=settings.API_PREFIX + "/communication", tags=["Communication"])
app.include_router(admin.router, prefix=settings.API_PREFIX + "/admin", tags=["Admin"])
app.include_router(audit.router, prefix=settings.API_PREFIX + "/audit", tags=["Audit"])

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