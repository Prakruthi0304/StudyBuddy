from typing import List
from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
import pandas as pd
import io

from ..database import get_db
from ..models import Timetable, User
from ..schemas import TimetableCreate, TimetableResponse
from ..dependencies import get_current_user

router = APIRouter(tags=["Timetable"])


# =========================
# GET FULL TIMETABLE
# =========================

@router.get("/timetable", response_model=List[TimetableResponse])
def get_timetable(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Timetable).filter(Timetable.user_id == current_user.id).all()


# =========================
# ADD SINGLE CLASS
# =========================

@router.post("/timetable", response_model=TimetableResponse, status_code=201)
def add_timetable_entry(
    entry: TimetableCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    new_entry = Timetable(
        subject=entry.subject,
        day=entry.day,
        start_time=entry.start_time,
        end_time=entry.end_time,
        room=entry.room,
        user_id=current_user.id
    )
    db.add(new_entry)
    db.commit()
    db.refresh(new_entry)
    return new_entry


# =========================
# DELETE A CLASS
# =========================

@router.delete("/timetable/{entry_id}")
def delete_timetable_entry(
    entry_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    entry = db.query(Timetable).filter(
        Timetable.id == entry_id,
        Timetable.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    db.delete(entry)
    db.commit()
    return {"message": "Deleted"}


# =========================
# TODAY'S CLASSES
# =========================

@router.get("/timetable/today", response_model=List[TimetableResponse])
def today_classes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    today = datetime.now().strftime("%A")  # "Monday", "Tuesday" …
    # Also support short form "Mon"
    today_short = datetime.now().strftime("%a")
    classes = db.query(Timetable).filter(
        Timetable.user_id == current_user.id,
        Timetable.day.in_([today, today_short])
    ).all()
    return classes


# =========================
# UPLOAD TIMETABLE (Excel)
# =========================

@router.post("/timetable/upload")
def upload_timetable(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if not file.filename.endswith((".xlsx", ".xls", ".csv")):
        raise HTTPException(status_code=400, detail="Only Excel (.xlsx/.xls) or CSV files are supported")

    content = file.file.read()
    try:
        if file.filename.endswith(".csv"):
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse file: {e}")

    df.columns = df.columns.str.lower().str.strip()

    if df.empty:
        raise HTTPException(status_code=400, detail="The uploaded file is empty — no rows found")

    required = ["subject", "day", "start_time", "end_time"]
    missing = [c for c in required if c not in df.columns]
    if missing:
        raise HTTPException(status_code=400, detail=f"Missing columns: {missing}")

    # Drop rows missing required values
    df = df.dropna(subset=required)
    if df.empty:
        raise HTTPException(status_code=400, detail="No valid rows found — check that subject, day, start_time, end_time are filled in")

    # Clear existing timetable for this user before re-upload
    db.query(Timetable).filter(Timetable.user_id == current_user.id).delete()

    for _, row in df.iterrows():
        entry = Timetable(
            subject=str(row["subject"]),
            day=str(row["day"]),
            start_time=str(row["start_time"]),
            end_time=str(row["end_time"]),
            room=str(row.get("room", "")) if "room" in row else None,
            user_id=current_user.id
        )
        db.add(entry)

    db.commit()
    return {"message": "Timetable uploaded successfully"}
