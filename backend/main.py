"""
main.py – FastAPI application entry point.
Registers all routers, configures CORS, and creates tables on startup.
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from config import settings
from database import create_tables

# ── Import routers from every module ──────────────────────────────────────────
from auth.routes import router as auth_router
from jobs.routes import router as jobs_router
from bids.routes import router as bids_router
from projects.routes import router as projects_router
from payments.routes import router as payments_router
from reviews.routes import router as reviews_router
from notifications.routes import router as notifications_router
from support.routes import router as support_router
from messages.routes import router as messages_router
from change_requests.routes import router as change_requests_router
from uploads_router import router as upload_router


# ── Lifespan: runs once at startup/shutdown ───────────────────────────────────
from scheduler import check_deadlines_and_reminders
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Create database tables automatically on first run."""
    await create_tables()
    # Start the background task
    task = asyncio.create_task(check_deadlines_and_reminders())
    yield  # app runs here
    # shutdown logic can go below if needed
    task.cancel()


# ── Application instance ──────────────────────────────────────────────────────
app = FastAPI(
    title=settings.APP_NAME,
    description="A beginner-friendly Freelance Marketplace REST API built with FastAPI.",
    version="1.0.0",
    lifespan=lifespan,
)

# ── CORS ──────────────────────────────────────────────────────────────────────
# Allows the React frontend (running on port 5173) to call the backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/static_uploads", StaticFiles(directory="uploads"), name="static_uploads")

# ── Register routers ──────────────────────────────────────────────────────────
app.include_router(auth_router,           prefix="/auth",           tags=["Authentication"])
app.include_router(jobs_router,           prefix="/jobs",           tags=["Jobs"])
app.include_router(bids_router,           prefix="/bids",           tags=["Bids"])
app.include_router(projects_router,       prefix="/projects",       tags=["Projects"])
app.include_router(payments_router,       prefix="/payments",       tags=["Payments"])
app.include_router(reviews_router,        prefix="/reviews",        tags=["Reviews"])
app.include_router(upload_router,         prefix="/uploads",        tags=["Uploads"])
app.include_router(notifications_router,  prefix="/notifications",  tags=["Notifications"])
app.include_router(support_router,        prefix="/support",        tags=["Support"])
app.include_router(messages_router,       prefix="/messages",       tags=["Messages"])
app.include_router(change_requests_router, prefix="/change-requests", tags=["Change Requests"])


# ── Health check ─────────────────────────────────────────────────────────────
@app.get("/", tags=["Health"])
async def root():
    """Quick sanity-check endpoint."""
    return {"message": "Freelance Marketplace API is running 🚀"}
