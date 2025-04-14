from app.db import models, schemas
from sqlalchemy.orm import Session


def create_vote(db: Session, vote: schemas.VoteCreate):
    db_vote = models.Vote(voter_id=vote.voter_id, candidate_id=vote.candidate_id)
    db.add(db_vote)

    # Increment vote count for candidate
    candidate = (
        db.query(models.Candidate)
        .filter(models.Candidate.id == vote.candidate_id)
        .first()
    )
    if candidate:
        candidate.vote_count += 1

    # Mark voter as voted
    voter = db.query(models.Voter).filter(models.Voter.id == vote.voter_id).first()
    if voter:
        voter.has_voted = True

    db.commit()
    db.refresh(db_vote)
    return db_vote


def get_votes(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Vote).offset(skip).limit(limit).all()


def get_vote_by_voter_id(db: Session, voter_id: int):
    return db.query(models.Vote).filter(models.Vote.voter_id == voter_id).first()
