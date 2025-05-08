from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import schemas
from app.db.database import get_db
from app.services import vote_service
from app.utils.auth_utils import require_voter

router = APIRouter()


@router.post("/",summary="Cast a vote")
def vote(vote: schemas.VoteCreate, db: Session = Depends(get_db), current_user = Depends(require_voter)):
    return vote_service.cast_vote(db, current_user, vote)


@router.get("/", response_model=list[schemas.VoteBase])
def list_votes(db: Session = Depends(get_db)):
    return vote_service.get_votes(db)


@router.get("/voter/{voter_id}", response_model=schemas.VoteBase)
def get_vote_by_voter(voter_id: int, db: Session = Depends(get_db)):
    vote = vote_service.get_vote_by_voter_id(db, voter_id)
    if not vote:
        raise HTTPException(status_code=404, detail="Vote not found for this voter")
    return vote
