from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import Attendance, Timetable, User
from ..schemas import AttendanceCreate, AttendanceResponse
from ..dependencies import get_current_user

router = APIRouter(tags=["Attendance"])


def _today_variants():
    return [datetime.now().strftime("%A"), datetime.now().strftime("%a")]


# ── Mark attendance ──────────────────────────────────────────────────────────
@router.post("/attendance", response_model=AttendanceResponse, status_code=201)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    date = payload.date or str(datetime.now().date())
    record = Attendance(
        subject=payload.subject,
        date=date,
        attended=payload.attended,
        timetable_id=payload.timetable_id,
        user_id=current_user.id,
    )
    db.add(record)
    db.commit()
    db.refresh(record)
    return record


# ── Today's subjects from timetable (for quick-mark UI) ─────────────────────
@router.get("/attendance/today-subjects")
def today_subjects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Returns today's timetable entries plus whether attendance has already
    been marked for each slot today.
    """
    today = str(datetime.now().date())
    today_variants = _today_variants()

    entries = (
        db.query(Timetable)
        .filter(
            Timetable.user_id == current_user.id,
            Timetable.day.in_(today_variants),
        )
        .order_by(Timetable.start_time)
        .all()
    )

    # Attendance already marked today (by timetable_id or subject)
    today_records = (
        db.query(Attendance)
        .filter(Attendance.user_id == current_user.id, Attendance.date == today)
        .all()
    )
    marked_slot_ids  = {r.timetable_id for r in today_records if r.timetable_id}
    marked_subjects  = {r.subject for r in today_records}

    result = []
    for e in entries:
        already = (e.id in marked_slot_ids) or (e.subject in marked_subjects)
        att_record = next(
            (r for r in today_records if r.timetable_id == e.id or r.subject == e.subject),
            None,
        )
        result.append({
            "timetable_id": e.id,
            "subject": e.subject,
            "start_time": e.start_time,
            "end_time": e.end_time,
            "room": e.room,
            "marked": already,
            "attended": att_record.attended if att_record else None,
            "attendance_id": att_record.id if att_record else None,
        })
    return result


# ── All records ───────────────────────────────────────────────────────────────
@router.get("/attendance", response_model=List[AttendanceResponse])
def get_attendance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return db.query(Attendance).filter(Attendance.user_id == current_user.id).all()


# ── Delete ────────────────────────────────────────────────────────────────────
@router.delete("/attendance/{record_id}")
def delete_attendance(
    record_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Attendance).filter(
        Attendance.id == record_id,
        Attendance.user_id == current_user.id,
    ).first()
    if not record:
        raise HTTPException(404, "Record not found")
    db.delete(record)
    db.commit()
    return {"message": "Deleted"}


# ── Overall percentage ────────────────────────────────────────────────────────
@router.get("/attendance/percentage")
def attendance_percentage(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.query(Attendance).filter(Attendance.user_id == current_user.id).all()
    total    = len(records)
    attended = sum(1 for r in records if r.attended)
    pct      = round((attended / total) * 100, 1) if total else 0
    safe_bunks = max(int((attended / 0.85) - total), 0) if total else 0
    return {
        "total": total,
        "attended": attended,
        "percentage": pct,
        "safe_bunks": safe_bunks,
        "warning": "Attendance below 85% — attend next class" if pct < 85 and total else None,
    }


# ── Subject-wise summary ──────────────────────────────────────────────────────
@router.get("/attendance/summary")
def attendance_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    records = db.query(Attendance).filter(Attendance.user_id == current_user.id).all()
    summary: dict = {}
    for r in records:
        if r.subject not in summary:
            summary[r.subject] = {"attended": 0, "total": 0}
        summary[r.subject]["total"] += 1
        if r.attended:
            summary[r.subject]["attended"] += 1

    result = []
    for subject, data in summary.items():
        t = data["total"]
        a = data["attended"]
        pct = round((a / t) * 100, 1) if t else 0
        result.append({
            "subject": subject,
            "attended": a,
            "total": t,
            "percent": pct,
            "safe_bunks": max(int((a / 0.85) - t), 0),
        })
    return result
