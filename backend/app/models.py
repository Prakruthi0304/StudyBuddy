from sqlalchemy import Column, Integer, String, Boolean, ForeignKey, Text, LargeBinary
from sqlalchemy.orm import relationship
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password = Column(String)

    timetable   = relationship("Timetable",  back_populates="user", cascade="all, delete-orphan")
    attendance  = relationship("Attendance", back_populates="user", cascade="all, delete-orphan")
    assignments = relationship("Assignment", back_populates="user", cascade="all, delete-orphan")
    notes       = relationship("Note",       back_populates="user", cascade="all, delete-orphan")
    reminders   = relationship("Reminder",   back_populates="user", cascade="all, delete-orphan")


class Timetable(Base):
    __tablename__ = "timetable"

    id         = Column(Integer, primary_key=True, index=True)
    subject    = Column(String, nullable=False)
    day        = Column(String, nullable=False)   # "Mon","Tue",... or "Monday",...
    start_time = Column(String, nullable=False)
    end_time   = Column(String, nullable=False)
    room       = Column(String)
    user_id    = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="timetable")


class Attendance(Base):
    __tablename__ = "attendance"

    id          = Column(Integer, primary_key=True, index=True)
    subject     = Column(String, nullable=False)
    date        = Column(String, nullable=False)   # ISO "YYYY-MM-DD"
    attended    = Column(Boolean, nullable=False)
    timetable_id = Column(Integer, ForeignKey("timetable.id"), nullable=True)  # link to slot
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="attendance")


class Assignment(Base):
    __tablename__ = "assignments"

    id          = Column(Integer, primary_key=True, index=True)
    title       = Column(String, nullable=False)
    subject     = Column(String, nullable=False)
    description = Column(Text)
    deadline    = Column(String)
    priority    = Column(String, default="medium")
    completed   = Column(Boolean, default=False)
    user_id     = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="assignments")


class Note(Base):
    __tablename__ = "notes"

    id           = Column(Integer, primary_key=True, index=True)
    title        = Column(String, nullable=False)
    content      = Column(Text)        # AI-generated summary stored here
    subject      = Column(String)
    file_name    = Column(String)      # original filename
    file_type    = Column(String)      # "pdf" | "ppt" | "pptx" | "manual"
    raw_text     = Column(Text)        # extracted text from file
    created_at   = Column(String)
    user_id      = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="notes")


class Reminder(Base):
    __tablename__ = "reminders"

    id       = Column(Integer, primary_key=True, index=True)
    title    = Column(String, nullable=False)
    due      = Column(String)
    category = Column(String)
    priority = Column(String, default="medium")
    done     = Column(Boolean, default=False)
    user_id  = Column(Integer, ForeignKey("users.id"), nullable=False)

    user = relationship("User", back_populates="reminders")
