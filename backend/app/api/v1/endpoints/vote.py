from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.db.schemas import VoteResults, VoteSummary
from app.services import vote_service
from app.utils.auth_utils import require_admin, require_voter

router = APIRouter()


@router.post("/", summary="Cast a vote")
def vote(vote: schemas.VoteCreate, db: Session = Depends(get_db), current_user=Depends(require_voter)):
    return vote_service.cast_vote(db, current_user, vote)


@router.get("/results", response_model=VoteSummary)
def get_results(db: Session = Depends(get_db), current_user=Depends(require_admin)):
    return vote_service.get_vote_results_with_winnder(db)
