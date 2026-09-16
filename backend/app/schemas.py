from pydantic import BaseModel, EmailStr
from typing import Optional, List

# ── Auth ────────────────────────────────────────────────────────────────────
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse

# ── Timetable ───────────────────────────────────────────────────────────────
class TimetableCreate(BaseModel):
    subject: str
    day: str
    start_time: str
    end_time: str
    room: Optional[str] = None

class TimetableResponse(BaseModel):
    id: int
    subject: str
    day: str
    start_time: str
    end_time: str
    room: Optional[str] = None
    class Config:
        from_attributes = True

# ── Attendance ───────────────────────────────────────────────────────────────
class AttendanceCreate(BaseModel):
    subject: str
    attended: bool
    date: Optional[str] = None
    timetable_id: Optional[int] = None

class AttendanceResponse(BaseModel):
    id: int
    subject: str
    date: str
    attended: bool
    timetable_id: Optional[int] = None
    class Config:
        from_attributes = True

class AttendanceSummaryItem(BaseModel):
    subject: str
    attended: int
    total: int
    percent: float
    safe_bunks: int

# ── Assignment ───────────────────────────────────────────────────────────────
class AssignmentCreate(BaseModel):
    title: str
    subject: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    priority: Optional[str] = "medium"

class AssignmentResponse(BaseModel):
    id: int
    title: str
    subject: str
    description: Optional[str] = None
    deadline: Optional[str] = None
    priority: str
    completed: bool
    class Config:
        from_attributes = True

# ── Notes ────────────────────────────────────────────────────────────────────
class NoteCreate(BaseModel):
    title: str
    content: Optional[str] = None
    subject: Optional[str] = None

class NoteResponse(BaseModel):
    id: int
    title: str
    content: Optional[str] = None
    subject: Optional[str] = None
    file_name: Optional[str] = None
    file_type: Optional[str] = None
    created_at: Optional[str] = None
    class Config:
        from_attributes = True

# ── Reminder ─────────────────────────────────────────────────────────────────
class ReminderCreate(BaseModel):
    title: str
    due: Optional[str] = None
    category: Optional[str] = "other"
    priority: Optional[str] = "medium"

class ReminderResponse(BaseModel):
    id: int
    title: str
    due: Optional[str] = None
    category: Optional[str] = None
    priority: str
    done: bool
    class Config:
        from_attributes = True

# ── Settings ──────────────────────────────────────────────────────────────────
class SettingsUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    password: Optional[str] = None

# ── Planner ───────────────────────────────────────────────────────────────────
class PlannerBlock(BaseModel):
    time: str
    title: str
    tag: str
    energy: float
    subject: Optional[str] = None

class PlannerResponse(BaseModel):
    blocks: List[PlannerBlock]
    insights: List[str]
