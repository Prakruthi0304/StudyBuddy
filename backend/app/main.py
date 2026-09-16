from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import Base, engine
from .routers import auth_router, timetable, attendance, assignments, notes, reminders, analytics, settings, notifications

Base.metadata.create_all(bind=engine)

app = FastAPI(title="StudyBuddy API", version="3.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router.router)
app.include_router(timetable.router)
app.include_router(attendance.router)
app.include_router(assignments.router)
app.include_router(notes.router)
app.include_router(reminders.router)
app.include_router(analytics.router)
app.include_router(settings.router)
app.include_router(notifications.router)

@app.get("/", tags=["Health"])
def health():
    return {"status": "ok", "message": "StudyBuddy API v3.1 running 🚀"}
