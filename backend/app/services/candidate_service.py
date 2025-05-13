from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.models import Candidate
from app.utils.id_generator import generate_id


def get_candidates(db: Session):
    """Get all candidates"""
    return db.query(models.Candidate).all()


def get_candidate(db: Session, candidate_id: str):
    """Get a specific candidate by ID"""
    candidate = db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


def create_candidate(db: Session, candidate: schemas.CandidateCreate):
    """Create a new candidate"""
    while True:
        candidate_id = generate_id()
        if not db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first():
            break

    db_candidate = models.Candidate(
        candidate_id=candidate_id,
        name=candidate.name,
        party=candidate.party,
        manifesto=candidate.manifesto
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def update_candidate(db: Session, candidate_id: str, candidate: schemas.CandidateBase):
    """Update a candidate"""
    db_candidate = db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()
    if not db_candidate:
        return None

    for key, value in candidate.dict().items():
        setattr(db_candidate, key, value)

    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def delete_candidate(db: Session, candidate_id: str):
    """Delete a candidate"""
    db_candidate = db.query(models.Candidate).filter(models.Candidate.candidate_id == candidate_id).first()
    if not db_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")

    db.delete(db_candidate)
    db.commit()
    return {"message": "Candidate deleted successfully"}


def get_candidate_by_name(db: Session, candidate_name: str):
    """Get a candidate by name"""
    return (
        db.query(models.Candidate)
        .filter(models.Candidate.name == candidate_name)
        .first()
    )


def get_candidate_by_id(db: Session, candidate_id: str):
    """Get a candidate by ID"""
    return (
        db.query(models.Candidate)
        .filter(models.Candidate.candidate_id == candidate_id)
        .first()
    )


def get_candidates(db: Session, skip: int = 0, limit: int = 10):
    """Get all candidates with pagination"""
    return db.query(models.Candidate).offset(skip).limit(limit).all()
