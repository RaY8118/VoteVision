from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.models import Candidate
from app.utils.id_generator import generate_id


def create_candidate(db: Session, candidate: schemas.CandidateBase):
    while True:
        new_candidate_id = generate_id()
        if not db.query(Candidate).filter_by(candidate_id=new_candidate_id).first():
            break
    db_candidate = models.Candidate(
        candidate_id=new_candidate_id,
        name=candidate.name,
        party=candidate.party,
        manifesto=candidate.manifesto,
    )
    db.add(db_candidate)
    db.commit()
    db.refresh(db_candidate)
    return db_candidate


def get_candidate_by_name(db: Session, candidate_name: str):
    return (
        db.query(models.Candidate)
        .filter(models.Candidate.name == candidate_name)
        .first()
    )


def get_candidate_by_id(db: Session, candidate_id: str):
    return (
        db.query(models.Candidate)
        .filter(models.Candidate.candidate_id == candidate_id)
        .first()
    )


def get_candidates(db: Session, skip: int = 0, limit: int = 10):
    return db.query(models.Candidate).offset(skip).limit(limit).all()


def delete_candidate(db: Session, candidate_id: str):
    candidate = db.query(models.Candidate).filter_by(candidate_id=candidate_id).first()
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    db.delete(candidate)
    db.commit()
