from datetime import datetime

from sqlalchemy.orm import Session

from app.db import models


def start_session(db: Session):
    existing = db.query(models.VotingSession).filter_by(is_active=True).first()
    if existing:
        raise Exception("A voting session is already active.")

    session = models.VotingSession(
        is_active=True,
        start_time=datetime.now()
    )

    db.add(session)
    db.commit()
    db.refresh(session)
    return session


def end_session(db: Session):
    session = db.query(models.VotingSession).filter_by(is_active=True).first()
    if not session:
        raise Exception("No active session to end")

    session.is_active = False
    session.end_time = datetime.now()
    db.commit()
    db.refresh(session)
    return session


def get_active_session(db: Session):
    return db.query(models.VotingSession).filter_by(is_active=True).first()
