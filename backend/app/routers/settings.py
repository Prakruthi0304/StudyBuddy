from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from ..models import User
from ..schemas import SettingsUpdate, UserResponse
from ..auth import hash_password, verify_password
from ..dependencies import get_current_user

router = APIRouter(tags=["Settings"])


@router.get("/settings/profile", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/settings/profile", response_model=UserResponse)
def update_profile(
    payload: SettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if payload.name is not None:
        current_user.name = payload.name

    if payload.email is not None:
        existing = db.query(User).filter(
            User.email == payload.email,
            User.id != current_user.id
        ).first()
        if existing:
            raise HTTPException(status_code=400, detail="Email already in use")
        current_user.email = payload.email

    if payload.password is not None:
        current_user.password = hash_password(payload.password)

    db.commit()
    db.refresh(current_user)
    return current_user


@router.delete("/settings/account")
def delete_account(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    from ..models import Timetable, Attendance, Assignment, Note, Reminder
    db.query(Timetable).filter(Timetable.user_id == current_user.id).delete()
    db.query(Attendance).filter(Attendance.user_id == current_user.id).delete()
    db.query(Assignment).filter(Assignment.user_id == current_user.id).delete()
    db.query(Note).filter(Note.user_id == current_user.id).delete()
    db.query(Reminder).filter(Reminder.user_id == current_user.id).delete()
    db.delete(current_user)
    db.commit()
    return {"message": "Account deleted"}
