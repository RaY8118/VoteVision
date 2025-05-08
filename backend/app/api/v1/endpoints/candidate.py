from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.services import candidate_service
from app.utils.auth_utils import require_admin

router = APIRouter()


@router.post("/", response_model=schemas.CandidateOut)
def create_candidate(candidate: schemas.CandidateBase, db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return candidate_service.create_candidate(db, candidate)


@router.get("/", response_model=list[schemas.CandidateBase])
def list_candidates(db: Session = Depends(get_db)):
    return candidate_service.get_candidates(db)


@router.get("/id/{candiate_id}", response_model=schemas.CandidateBase)
def get_candidate(candidate_id: str, db: Session = Depends(get_db)):
    candidate = candidate_service.get_candidate_by_id(db, candidate_id)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.get("/name/{candiate_name}", response_model=schemas.CandidateBase)
def get_candidate(candidate_name: str, db: Session = Depends(get_db)):
    candidate = candidate_service.get_candidate_by_name(db, candidate_name)
    if not candidate:
        raise HTTPException(status_code=404, detail="Candidate not found")
    return candidate


@router.delete("/{candidate_id}")
def delete_candidate(candidate_id: str, db: Session = Depends(get_db), current_user = Depends(require_admin)):
    candidate_service.delete_candidate(db, candidate_id)
    return {"detail": "Candidate deleted successfully"}
