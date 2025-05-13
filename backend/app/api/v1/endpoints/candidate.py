from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.services import candidate_service
from app.utils.auth_utils import require_admin

router = APIRouter()


@router.post("/", response_model=schemas.CandidateOut)
def create_candidate(candidate: schemas.CandidateBase, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    """Create a new candidate"""
    return candidate_service.create_candidate(db, candidate)


@router.get("/", response_model=list[schemas.CandidateOut])
def list_candidates(db: Session = Depends(get_db)):
    """Get all candidates"""
    return candidate_service.get_candidates(db)


@router.get("/id/{candiate_id}", response_model=schemas.CandidateBase)
def get_candidate_with_id(candidate_id: str, db: Session = Depends(get_db)):
    """Get a candidate by ID"""
    candidate = candidate_service.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/name/{candiate_name}", response_model=schemas.CandidateBase)
def get_candidate_with_name(candidate_name: str, db: Session = Depends(get_db)):
    """Get a candidate by name"""
    candidate = candidate_service.get_candidate_by_name(db, candidate_name)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.put("/{candidate_id}", response_model=schemas.CandidateOut)
def update_candidate(
    candidate_id: str,
    candidate: schemas.CandidateBase,
    db: Session = Depends(get_db),
    current_user=Depends(require_admin)
):
    """Update a candidate"""
    updated_candidate = candidate_service.update_candidate(db, candidate_id, candidate)
    if not updated_candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return updated_candidate


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    """Delete a candidate"""
    candidate_service.delete_candidate(db, candidate_id)
    return {"detail": "Candidate deleted successfully"}
