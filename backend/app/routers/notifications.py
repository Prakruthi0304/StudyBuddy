"""
Notifications router — returns actionable alerts:
  - Reminders due today or overdue
  - Attendance below 85% per subject
  - Assignments due within 2 days
"""
from datetime import datetime, date, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Reminder, Attendance, Assignment, User
from ..dependencies import get_current_user

router = APIRouter(tags=["Notifications"])


@router.get("/notifications")
def get_notifications(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    notifications = []
    today = date.today()
    today_str = str(today)
    tomorrow_str = str(today + timedelta(days=1))
    day_after_str = str(today + timedelta(days=2))

    # ── 1. Reminders due today or overdue ───────────────────────────────────
    reminders = db.query(Reminder).filter(
        Reminder.user_id == current_user.id,
        Reminder.done == False,
    ).all()

    for r in reminders:
        if not r.due:
            continue
        try:
            due_date = datetime.strptime(r.due[:10], "%Y-%m-%d").date()
        except Exception:
            continue

        if due_date < today:
            notifications.append({
                "id": f"reminder_overdue_{r.id}",
                "type": "danger",
                "icon": "🔴",
                "title": "Overdue Reminder",
                "message": f'"{r.title}" was due on {r.due}',
                "link": "/dashboard/reminders",
            })
        elif due_date == today:
            notifications.append({
                "id": f"reminder_today_{r.id}",
                "type": "warning",
                "icon": "⏰",
                "title": "Due Today",
                "message": f'"{r.title}" is due today!',
                "link": "/dashboard/reminders",
            })
        elif r.due[:10] in [tomorrow_str, day_after_str]:
            notifications.append({
                "id": f"reminder_soon_{r.id}",
                "type": "info",
                "icon": "📅",
                "title": "Due Soon",
                "message": f'"{r.title}" is due on {r.due}',
                "link": "/dashboard/reminders",
            })

    # ── 2. Attendance shortage (below 85%) ──────────────────────────────────
    att_records = db.query(Attendance).filter(Attendance.user_id == current_user.id).all()
    subject_map: dict = {}
    for r in att_records:
        if r.subject not in subject_map:
            subject_map[r.subject] = {"attended": 0, "total": 0}
        subject_map[r.subject]["total"] += 1
        if r.attended:
            subject_map[r.subject]["attended"] += 1

    for subject, data in subject_map.items():
        if data["total"] < 3:
            continue  # not enough data
        pct = (data["attended"] / data["total"]) * 100
        if pct < 75:
            notifications.append({
                "id": f"att_critical_{subject}",
                "type": "danger",
                "icon": "🚨",
                "title": "Critical Attendance",
                "message": f'{subject}: only {pct:.0f}% — you need immediate action!',
                "link": "/dashboard/attendance",
            })
        elif pct < 85:
            safe_bunks = max(int((data["attended"] / 0.85) - data["total"]), 0)
            notifications.append({
                "id": f"att_low_{subject}",
                "type": "warning",
                "icon": "⚠️",
                "title": "Low Attendance",
                "message": f'{subject}: {pct:.0f}% — attend next {1 if safe_bunks == 0 else safe_bunks} class(es)',
                "link": "/dashboard/attendance",
            })

    # ── 3. Assignments due soon ──────────────────────────────────────────────
    assignments = db.query(Assignment).filter(
        Assignment.user_id == current_user.id,
        Assignment.completed == False,
    ).all()

    for a in assignments:
        if not a.deadline:
            continue
        try:
            due = datetime.strptime(a.deadline[:10], "%Y-%m-%d").date()
        except Exception:
            continue

        if due < today:
            notifications.append({
                "id": f"asgn_overdue_{a.id}",
                "type": "danger",
                "icon": "📚",
                "title": "Overdue Assignment",
                "message": f'"{a.title}" ({a.subject}) was due on {a.deadline}',
                "link": "/dashboard/planner",
            })
        elif due == today:
            notifications.append({
                "id": f"asgn_today_{a.id}",
                "type": "warning",
                "icon": "📝",
                "title": "Assignment Due Today",
                "message": f'"{a.title}" ({a.subject}) is due today!',
                "link": "/dashboard/planner",
            })
        elif a.deadline[:10] in [tomorrow_str, day_after_str]:
            notifications.append({
                "id": f"asgn_soon_{a.id}",
                "type": "info",
                "icon": "📖",
                "title": "Assignment Due Soon",
                "message": f'"{a.title}" ({a.subject}) due on {a.deadline}',
                "link": "/dashboard/planner",
            })

    # Sort: danger first, then warning, then info
    order = {"danger": 0, "warning": 1, "info": 2}
    notifications.sort(key=lambda n: order.get(n["type"], 3))

    return {
        "count": len(notifications),
        "unread": len([n for n in notifications if n["type"] in ("danger", "warning")]),
        "notifications": notifications,
    }
