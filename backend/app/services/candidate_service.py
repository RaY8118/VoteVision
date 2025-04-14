from app.db import models, schemas
from sqlalchemy.orm import Session


def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    db_candidate = models.Candidate(
        name=candidate.name, party=candidate.party, manifesto=candidate.manifesto
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def get_candidate_by_id(db: Session, candidate_id: int):
    return (
        db.query(models.Candidate).filter(models.Candidate.id == candidate_id).first()
    )


def get_candidates(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Candidate).offset(skip).limit(limit).all()


def delete_candidate(db: Session, candidate_id: int):
    candidate = get_candidate_by_id(db, candidate_id)
    if candidate:
        db.delete(candidate)
        db.commit()
    return candidate
