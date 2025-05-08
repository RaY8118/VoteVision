from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.models import Candidate


def cast_vote(db: Session, user: models.User, vote_data: schemas.VoteCreate):
    if user.has_voted:
        raise HTTPException(status_code=400, detail="You have already voted")

    candidate = db.query(Candidate).filter_by(candidate_id=vote_data.candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    candidate.vote_count += 1
    user.has_voted = 1 

    db.commit()
    return {"details":"Vote case successfully"}

def get_votes(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Vote).offset(skip).limit(limit).all()


def get_vote_by_voter_id(db: Session, voter_id: int):
    return db.query(models.Vote).filter(models.Vote.voter_id == voter_id).first()
