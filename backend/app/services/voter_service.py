from app.db import models, schemas
from sqlalchemy.orm import Session


def create_voter(db: Session, voter: schemas.VoterCreate):
    db_voter = models.Voter(user_id=voter.user_id, has_voted=False)
    db.add(db_voter)
    db.commit()
    db.refresh(db_voter)
    return db_voter


def get_voter_by_user_id(db: Session, user_id: int):
    return db.query(models.Voter).filter(models.Voter.user_id == user_id).first()


def mark_voter_as_voted(db: Session, user_id: int):
    voter = get_voter_by_user_id(db, user_id)
    if voter:
        voter.has_voted = True
        db.commit()
        db.refresh(voter)
    return voter


def get_voters(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Voter).offset(skip).limit(limit).all()
