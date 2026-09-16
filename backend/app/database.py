from sqlalchemy import create_engine, URL
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# ── PostgreSQL connection ────────────────────────────────────────────────────
# Password is passed as a plain string to avoid URL-encoding issues with
# special characters like @ in passwords (e.g. root@123).
# Change these values to match your PostgreSQL setup.
# ─────────────────────────────────────────────────────────────────────────────
connection_url = URL.create(
    drivername="postgresql+psycopg2",
    username="studybuddy",
    password="root@123",      # ← change if your password is different
    host="localhost",
    port=5432,
    database="studybuddy",    # ← change if your database name is different
)

engine = create_engine(connection_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
