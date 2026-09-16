from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from collections import defaultdict

from ..database import get_db
from ..models import Attendance, Assignment, Reminder, User
from ..dependencies import get_current_user

router = APIRouter(tags=["Analytics"])


@router.get("/analytics")
def get_analytics(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Return aggregated stats for the analytics dashboard."""

    # ── Attendance ──────────────────────────────────────────────
    att_records = db.query(Attendance).filter(Attendance.user_id == current_user.id).all()
    total_classes = len(att_records)
    attended_classes = sum(1 for r in att_records if r.attended)
    overall_pct = round((attended_classes / total_classes) * 100, 1) if total_classes else 0

    # Subject-wise breakdown
    subj_map: dict = defaultdict(lambda: {"attended": 0, "total": 0})
    for r in att_records:
        subj_map[r.subject]["total"] += 1
        if r.attended:
            subj_map[r.subject]["attended"] += 1

    subject_stats = [
        {
            "subject": s,
            "percent": round((v["attended"] / v["total"]) * 100, 1) if v["total"] else 0,
            "attended": v["attended"],
            "total": v["total"],
        }
        for s, v in subj_map.items()
    ]

    # ── Assignments ─────────────────────────────────────────────
    assignments = db.query(Assignment).filter(Assignment.user_id == current_user.id).all()
    total_assignments = len(assignments)
    completed_assignments = sum(1 for a in assignments if a.completed)
    pending_assignments = total_assignments - completed_assignments

    # ── Reminders ───────────────────────────────────────────────
    reminders = db.query(Reminder).filter(Reminder.user_id == current_user.id).all()
    total_reminders = len(reminders)
    done_reminders = sum(1 for r in reminders if r.done)

    return {
        "attendance": {
            "overall_percent": overall_pct,
            "total_classes": total_classes,
            "attended_classes": attended_classes,
            "subject_breakdown": subject_stats,
        },
        "assignments": {
            "total": total_assignments,
            "completed": completed_assignments,
            "pending": pending_assignments,
        },
        "reminders": {
            "total": total_reminders,
            "done": done_reminders,
            "pending": total_reminders - done_reminders,
        },
    }
