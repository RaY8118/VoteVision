from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import models, schemas
from app.db.database import get_db
from app.services import election_service
from app.utils.auth_utils import get_current_user, require_admin

router = APIRouter()


@router.get("/", response_model=List[schemas.ElectionOut])
def get_elections(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all elections"""
    return election_service.get_elections(db)


@router.get("/{election_id}", response_model=schemas.ElectionOut)
def get_election(
    election_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get a specific election by ID"""
    return election_service.get_election(db, election_id)


@router.post("/", response_model=schemas.ElectionOut)
def create_election(
    election: schemas.ElectionCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Create a new election (admin only)"""
    return election_service.create_election(db, election)


@router.put("/{election_id}", response_model=schemas.ElectionOut)
def update_election(
    election_id: str,
    election_update: schemas.ElectionCreate,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Update an election (admin only)"""
    return election_service.update_election(db, election_id, election_update)


@router.delete("/{election_id}")
def delete_election(
    election_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Delete an election (admin only)"""
    return election_service.delete_election(db, election_id)


@router.post("/{election_id}/start")
def start_election(
    election_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Start an election (admin only)"""
    return election_service.start_election(db, election_id)


@router.post("/{election_id}/end")
def end_election(
    election_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """End an election (admin only)"""
    return election_service.end_election(db, election_id)


@router.get("/{election_id}/results", response_model=schemas.VoteSummary)
def get_election_results(
    election_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get election results"""
    return election_service.get_election_results(db, election_id)


@router.post("/{election_id}/vote")
def cast_vote(
    election_id: str,
    vote: schemas.VoteCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Cast a vote in an election"""
    return election_service.cast_vote(db, election_id, vote, current_user)


@router.post("/{election_id}/candidates/{candidate_id}")
def add_candidate_to_election(
    election_id: str,
    candidate_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Add a candidate to an election (admin only)"""
    return election_service.add_candidate_to_election(db, election_id, candidate_id)


@router.delete("/{election_id}/candidates/{candidate_id}")
def remove_candidate_from_election(
    election_id: str,
    candidate_id: str,
    db: Session = Depends(get_db),
    admin: models.User = Depends(require_admin)
):
    """Remove a candidate from an election (admin only)"""
    return election_service.remove_candidate_from_election(db, election_id, candidate_id)


@router.get("/{election_id}/candidates", response_model=List[schemas.CandidateOut])
def get_election_candidates(
    election_id: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    """Get all candidates registered for an election"""
    return election_service.get_election_candidates(db, election_id)
